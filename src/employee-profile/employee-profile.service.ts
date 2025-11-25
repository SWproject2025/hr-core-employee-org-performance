import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { EmployeeProfile } from './models/employee-profile.schema';
import { EmployeeProfileChangeRequest } from './models/ep-change-request.schema';
import { Candidate } from './models/candidate.schema';
import { EmployeeSystemRole } from './models/employee-system-role.schema';
import { EmployeeQualification } from './models/qualification.schema';
import { ProfileChangeStatus } from './enums/employee-profile.enums';

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name) private employeeProfileModel: Model<EmployeeProfile>,
    @InjectModel(EmployeeProfileChangeRequest.name) private changeRequestModel: Model<EmployeeProfileChangeRequest>,
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
    @InjectModel(EmployeeSystemRole.name) private systemRoleModel: Model<EmployeeSystemRole>,
    @InjectModel(EmployeeQualification.name) private qualificationModel: Model<EmployeeQualification>,
  ) {}

  // 1. View Personal Profile (US-04)
  async getProfile(employeeId: string): Promise<EmployeeProfile> {
    const profile = await this.employeeProfileModel.findById(employeeId).exec();
    if (!profile) throw new NotFoundException(`Employee profile with ID ${employeeId} not found`);
    return profile;
  }

  // 2. Update Self-Service Data (Direct update for non-sensitive info like phone/address) (US-2.0)
  async updateContactInfo(employeeId: string, updateData: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
    // Only allow specific fields to be updated directly
    const allowedUpdates = ['phoneNumber', 'address', 'emergencyContact']; 
    const filteredData = Object.keys(updateData)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    if (Object.keys(filteredData).length === 0) {
      throw new BadRequestException('No valid contact information provided for update.');
    }

    const updated = await this.employeeProfileModel
      .findByIdAndUpdate(employeeId, filteredData, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Employee profile with ID ${employeeId} not found`);
    return updated;
  }

  // 3. Submit Request for Correction/Change (Sensitive Data)
  async submitChangeRequest(employeeId: string, changes: any): Promise<EmployeeProfileChangeRequest> {
    const newRequest = new this.changeRequestModel({
      requestId: new Types.ObjectId().toString(),
      employeeProfileId: new Types.ObjectId(employeeId),
      requestDescription: JSON.stringify(changes),
      status: ProfileChangeStatus.PENDING,
      submittedAt: new Date(),
    });
    return newRequest.save();
  }

  // 4. View Team Serial (Manager Insight)
  async getTeamProfiles(managerId: string): Promise<EmployeeProfile[]> {
    // Assuming EmployeeProfile has a 'managerId' or 'reportsTo' field
    return this.employeeProfileModel.find({ managerId: managerId }).exec();
  }

  // 5. Review and Process Change Request: Approve
  async approveChangeRequest(requestId: string, reviewerId: string): Promise<EmployeeProfile> {
    const request = await this.changeRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Change request not found');
    if (request.status !== ProfileChangeStatus.PENDING) throw new BadRequestException('Request is already processed');

    // Parse the changes from requestDescription
    const requestedChanges = JSON.parse(request.requestDescription);

    // Apply changes to the actual profile
    const updatedProfile = await this.employeeProfileModel.findByIdAndUpdate(
      request.employeeProfileId.toString(),
      requestedChanges,
      { new: true }
    ).exec();

    if (!updatedProfile) throw new NotFoundException(`Employee profile with ID ${request.employeeProfileId} not found`);

    // Update request status
    request.status = ProfileChangeStatus.APPROVED;
    request.processedAt = new Date();
    await request.save();

    return updatedProfile;
  }

  // 6. Review and Process Change Request: Reject
  async rejectChangeRequest(requestId: string, reviewerId: string): Promise<EmployeeProfileChangeRequest> {
    const request = await this.changeRequestModel.findById(requestId);
    if (!request) throw new NotFoundException('Change request not found');
    
    request.status = ProfileChangeStatus.REJECTED;
    request.processedAt = new Date();
    return request.save();
  }

  // 7. Master Data Management (HR Admin Full Update)
  async adminUpdateProfile(employeeId: string, updateData: any): Promise<EmployeeProfile> {
    const updated = await this.employeeProfileModel
      .findByIdAndUpdate(employeeId, updateData, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Employee profile with ID ${employeeId} not found`);
    return updated;
  }
}