import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

// Import Schemas/Models
import { EmployeeProfile } from './schemas/employee-profile.schema';
import { CorrectionRequest, RequestStatus } from './schemas/correction-request.schema';
import { User } from '../users/schemas/user.schema';
import { Position } from '../organization-structure/schemas/position.schema';

// Import DTOs
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateCorrectionRequestDto } from './dto/create-correction-request.dto';
import { AdminUpdateProfileDto } from './dto/admin-update-profile.dto';

// Import Other Services
import { OrganizationStructureService } from '../organization-structure/organization-structure.service';

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name) private profileModel: Model<EmployeeProfile>,
    @InjectModel(CorrectionRequest.name) private requestModel: Model<CorrectionRequest>,
    @InjectModel(Position.name) private positionModel: Model<Position>,
    @InjectModel(User.name) private userModel: Model<User>,

    // Inject the OrganizationStructureService to find team members.
    // forwardRef is sometimes needed if services have circular dependencies (e.g., Org needs Profile, Profile needs Org)
    @Inject(forwardRef(() => OrganizationStructureService))
    private orgStructureService: OrganizationStructureService,
  ) {}

  /**
   * (Phase I)
   * Finds a user's profile by their User ID (from the JWT).
   * US-E2-04: View full employee profile.
   */
  async getProfileByUserId(userId: Types.ObjectId): Promise<EmployeeProfile> {
    const profile = await this.profileModel
      .findOne({ user: userId })
      .populate('position') // Show full position details, not just ID
      .exec();
      
    if (!profile) {
      throw new NotFoundException('Employee profile not found for this user.');
    }
    return profile;
  }

  /**
   * (Phase I)
   * Updates self-service fields (contact, bio, photo).
   * US-E2-05, US-E2-12.
   */
  async updateSelfServiceData(profileId: Types.ObjectId, dto: UpdateContactDto): Promise<EmployeeProfile> {
    const updatedProfile = await this.profileModel.findByIdAndUpdate(
      profileId,
      { $set: dto }, // Use $set to update only the fields provided in the DTO
      { new: true }, // Return the updated document
    );

    if (!updatedProfile) {
      throw new NotFoundException('Profile not found.');
    }
    // You could emit an event here for BR 22 (logging)
    return updatedProfile;
  }

  /**
   * (Phase I)
   * Creates a new correction request for HR approval.
   * US-E6-02: Request corrections of data.
   */
  async createCorrectionRequest(profileId: Types.ObjectId, dto: CreateCorrectionRequestDto): Promise<CorrectionRequest> {
    const request = new this.requestModel({
      ...dto,
      employee: profileId,
      status: RequestStatus.PENDING,
    });
    // You would add a notification (N-040) here, e.g., via an event emitter
    return request.save();
  }

  /**
   * (Phase II)
   * Gets all profiles for a manager's direct reports.
   * US-E4-01: View team members' profiles.
   */
  async getTeamProfiles(managerProfileId: Types.ObjectId): Promise<EmployeeProfile[]> {
    // 1. Find the manager's own position
    const managerProfile = await this.profileModel.findById(managerProfileId);
    if (!managerProfile || !managerProfile.position) {
      throw new NotFoundException('Manager position not found.');
    }
    const managerPositionId = managerProfile.position;

    // 2. Use the OrgStructureService to find all direct report positions
    // This is the key cross-module interaction
    const directReportPositions = await this.orgStructureService.getDirectReportsByPosition(managerPositionId);

    if (directReportPositions.length === 0) {
      return []; // Manager has no direct reports
    }

    // 3. Get the IDs of those positions
    const positionIds = directReportPositions.map(pos => pos._id);

    // 4. Find all employee profiles that hold those positions
    // BR 18b (Privacy) is applied here: we only select non-sensitive fields.
    const teamProfiles = await this.profileModel
      .find({
        position: { $in: positionIds },
        status: 'Active', // Only show active team members
      })
      .select('firstName lastName employeeId position status dateOfHire') // BR 18b
      .populate('position', 'title'); // Show the position title
      
    return teamProfiles;
  }

  /**
   * (Phase III)
   * Allows an HR Admin to approve or reject a change request.
   * US-E2-03: Review and approve employee-submitted changes.
   */
  async processCorrectionRequest(requestId: string, adminUserId: Types.ObjectId, newStatus: 'Approved' | 'Rejected'): Promise<EmployeeProfile | CorrectionRequest> {
    // 1. Find the request
    const request = await this.requestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Correction request not found.');
    }
    if (request.status !== RequestStatus.PENDING) {
      throw new NotFoundException(`Request already ${request.status}.`);
    }

    // 2. Update the request status
    request.status = newStatus === 'Approved' ? RequestStatus.APPROVED : RequestStatus.REJECTED;
    request.processedBy = adminUserId;
    await request.save();
    
    // 3. If approved, apply the change to the master profile (BR 36)
    if (newStatus === 'Approved') {
      const { employee, fieldToChange, newValue } = request;

      // This dynamically sets the field on the profile
      const updatedProfile = await this.profileModel.findByIdAndUpdate(
        employee,
        { $set: { [fieldToChange]: newValue } }, // e.g., { "lastName": "Smith" }
        { new: true },
      );
      
      if (!updatedProfile) {
        throw new NotFoundException('Profile not found for update.');
      }
      
      // BR 22 (Logging) and N-037 (Notification) would be triggered here
      return updatedProfile;
    }

    return request; // If rejected, just return the request
  }
  
  /**
   * (Phase III)
   * Allows an HR Admin to edit any part of a profile directly.
   * US-EP-04: As an HR admin, I want to edit any part...
   */
  async adminUpdateProfile(profileId: string, dto: AdminUpdateProfileDto): Promise<EmployeeProfile> {
    const updatedProfile = await this.profileModel.findByIdAndUpdate(
      profileId,
      { $set: dto }, // DTO can contain any field: status, contractType, etc.
      { new: true },
    );
    
    if (!updatedProfile) {
      throw new NotFoundException('Profile not found.');
    }
    
    // BR 20, BR 17: If status changes, trigger downstream sync
    if (dto.status && (dto.status === 'Terminated' || dto.status === 'Suspended')) {
      // this.eventEmitter.emit('profile.status.changed', { profileId, newStatus: dto.status });
      // A separate PayrollModule would listen for this event to block payment.
    }
    
    return updatedProfile;
  }
  
  /**
   * (Phase III)
   * Searches for employee profiles by name.
   * US-E6-03: As an HR Admin, I want to be able to search...
   */
  async searchProfiles(name: string): Promise<EmployeeProfile[]> {
    if (!name || name.trim().length === 0) {
      return [];
    }

    const searchRegex = new RegExp(name, 'i'); // Case-insensitive search
    return this.profileModel
      .find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { employeeId: searchRegex },
        ],
      })
      .select('firstName lastName employeeId position status dateOfHire')
      .populate('position', 'title')
      .exec();
  }

  /**
   * (Internal)
   * Adds an appraisal record to the employee's history.
   * Called by the PerformanceService after an appraisal is closed.
   * BR 16: Appraisal records saved on profile.
   */
  async addAppraisalRecord(profileId: Types.ObjectId, history: { date: Date; type: string; score: number }) {
    return this.profileModel.findByIdAndUpdate(profileId, {
      $push: { appraisalHistory: history }, // Pushes the new record into the array
    });
  }
}