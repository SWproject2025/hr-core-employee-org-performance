import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from './models/employee-profile.schema';
import { EmployeeProfileChangeRequest } from './models/ep-change-request.schema';
import { AuditLog, AuditLogDocument } from './models/audit-log.schema'; // <-- Import Audit Log
import { Candidate } from './models/candidate.schema';
import { EmployeeSystemRole } from './models/employee-system-role.schema';
import { EmployeeQualification } from './models/qualification.schema';
import { ProfileChangeStatus } from './enums/employee-profile.enums';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name) private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(EmployeeProfileChangeRequest.name) private changeRequestModel: Model<EmployeeProfileChangeRequest>,
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>, // <-- Inject Audit Model
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
    @InjectModel(EmployeeSystemRole.name) private systemRoleModel: Model<EmployeeSystemRole>,
    @InjectModel(EmployeeQualification.name) private qualificationModel: Model<EmployeeQualification>,
  ) {}

  // --- 1. Helper: Internal Audit Logging ---
  private async logAction(
    targetEmployeeId: string | Types.ObjectId,
    action: string,
    performedBy: string,
    changes: Record<string, any>
  ) {
    const log = new this.auditLogModel({
      targetEmployeeId: new Types.ObjectId(targetEmployeeId),
      action,
      performedBy, // ID of the user (Employee or Admin) performing the action
      changes,
      timestamp: new Date(),
    });
    await log.save();
  }

  // --- 2. View Personal Profile ---
  async getProfile(employeeId: string): Promise<EmployeeProfile> {
    const profile = await this.employeeProfileModel.findById(employeeId).exec();
    if (!profile) throw new NotFoundException(`Employee profile with ID ${employeeId} not found`);
    return profile;
  }

  // --- 3. Update Self-Service Data (With Audit) ---
  // Added 'performedBy' to signature to track WHO did this
  async updateContactInfo(
    employeeId: string, 
    updateDto: UpdateContactDto, 
    performedBy: string
  ): Promise<EmployeeProfile> {
    if (Object.keys(updateDto).length === 0) {
      throw new BadRequestException('No valid contact information provided for update.');
    }

    const updated = await this.employeeProfileModel
      .findByIdAndUpdate(employeeId, { $set: updateDto }, { new: true })
      .exec();
      
    if (!updated) throw new NotFoundException(`Employee profile with ID ${employeeId} not found`);

    // LOG THE ACTION
    await this.logAction(employeeId, 'SELF_UPDATE_CONTACT', performedBy, updateDto);

    return updated;
  }

  // --- 4. Submit Change Request ---
  async submitChangeRequest(employeeId: string, changes: any, reason?: string): Promise<EmployeeProfileChangeRequest> {
    const newRequest = new this.changeRequestModel({
      requestId: new Types.ObjectId().toString(),
      employeeProfileId: new Types.ObjectId(employeeId),
      requestDescription: JSON.stringify(changes),
      reason: reason,
      status: ProfileChangeStatus.PENDING,
      submittedAt: new Date(),
    });
    return newRequest.save();
  }

  // --- 5. Manager View Team ---
  async getTeamProfiles(managerEmployeeId: string): Promise<EmployeeProfile[]> {
    const managerProfile = await this.employeeProfileModel.findById(managerEmployeeId).exec();
    if (!managerProfile || !managerProfile.primaryPositionId) {
        throw new NotFoundException('Manager profile or position not found');
    }
    // Find employees reporting to this position
    return this.employeeProfileModel.find({ 
        supervisorPositionId: managerProfile.primaryPositionId 
    }).exec();
  }

  // --- 6. Approve Change Request (With Audit) ---
  async approveChangeRequest(requestId: string, reviewerId: string): Promise<EmployeeProfile> {
    const request = await this.changeRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Change request not found');
    if (request.status !== ProfileChangeStatus.PENDING) throw new BadRequestException('Request is already processed');

    const requestedChanges = JSON.parse(request.requestDescription);

    const updatedProfile = await this.employeeProfileModel.findByIdAndUpdate(
      request.employeeProfileId,
      { $set: requestedChanges },
      { new: true }
    ).exec();

    if (!updatedProfile) throw new NotFoundException(`Employee profile not found`);

    request.status = ProfileChangeStatus.APPROVED;
    request.processedAt = new Date();
    await request.save();

    // LOG THE ACTION
    await this.logAction(
      request.employeeProfileId, 
      'APPROVE_CHANGE_REQUEST', 
      reviewerId, 
      requestedChanges
    );

    return updatedProfile;
  }

  // --- 7. Reject Change Request ---
  async rejectChangeRequest(requestId: string, reviewerId: string): Promise<EmployeeProfileChangeRequest> {
    const request = await this.changeRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Change request not found');
    
    request.status = ProfileChangeStatus.REJECTED;
    request.processedAt = new Date();
    
    // Optional: Log rejection as well
    await this.logAction(
        request.employeeProfileId, 
        'REJECT_CHANGE_REQUEST', 
        reviewerId, 
        { requestId: requestId }
    );

    return request.save();
  }

  // --- 8. Master Data Management (HR Admin Full Update - With Audit) ---
  async adminUpdateProfile(
    employeeId: string, 
    updateData: any, 
    adminId: string
  ): Promise<EmployeeProfile> {
    const updated = await this.employeeProfileModel
      .findByIdAndUpdate(employeeId, { $set: updateData }, { new: true })
      .exec();

    if (!updated) throw new NotFoundException(`Employee profile with ID ${employeeId} not found`);

    // LOG THE ACTION
    await this.logAction(employeeId, 'ADMIN_UPDATE_MASTER_DATA', adminId, updateData);

    return updated;
  }
}