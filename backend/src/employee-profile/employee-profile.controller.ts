// src/employee-profile/employee-profile.controller.ts
import { Controller, Get, Put, Post, Body, UseGuards, Param, Query } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/schemas/user.schema';
import { EmployeeProfileService } from './employee-profile.service';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateCorrectionRequestDto } from './dto/create-correction-request.dto';
import { AdminUpdateProfileDto } from './dto/admin-update-profile.dto';

@UseGuards(JwtAuthGuard) // All routes require login
@Controller('profile')
export class EmployeeProfileController {
  constructor(private readonly profileService: EmployeeProfileService) {}

  // --- Phase I: Employee Self-Service ---

  @Get('me')
  getMyProfile(@GetUser() user: User) {
    // US-E2-04: As an employee, I want to view my full employee profile.
    return this.profileService.getProfileByUserId(user._id as Types.ObjectId);
  }

  @Put('me/contact')
  updateMyContactInfo(@GetUser() user: User, @Body() updateContactDto: UpdateContactDto) {
    // US-E2-05, US-E2-12: Update contact info, bio, picture
    return this.profileService.updateSelfServiceData(user.profile, updateContactDto);
  }

  @Post('me/correction-request')
  submitCorrectionRequest(@GetUser() user: User, @Body() createDto: CreateCorrectionRequestDto) {
    // US-E6-02: As an employee, I want to request corrections...
    return this.profileService.createCorrectionRequest(user.profile, createDto);
  }

  // --- Phase II: Manager Insight ---

  @Get('team')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER)
  getMyTeamProfiles(@GetUser() managerUser: User) {
    // US-E4-01: As a manager, I want to view my team members’ profiles
    return this.profileService.getTeamProfiles(managerUser.profile);
  }

  // --- Phase III: HR/Admin Processing ---

  @Get('admin/search')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN)
  searchEmployees(@Query('name') name: string) {
    // US-E6-03: As an HR Admin, I want to be able to search...
    return this.profileService.searchProfiles(name);
  }
  
  @Put('admin/:profileId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN, UserRole.SYS_ADMIN)
  adminUpdateProfile(@Param('profileId') profileId: string, @Body() updateDto: AdminUpdateProfileDto) {
    // US-EP-04: As an HR admin, I want to edit any part...
    return this.profileService.adminUpdateProfile(profileId, updateDto);
  }

  @Post('admin/approve-request/:requestId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN)
  approveRequest(@Param('requestId') requestId: string, @GetUser() adminUser: User) {
    // US-E2-03: As an HR admin, I want to review and approve...
    return this.profileService.processCorrectionRequest(requestId, adminUser._id as Types.ObjectId, 'Approved');
  }

  @Post('admin/reject-request/:requestId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HR_ADMIN)
  rejectRequest(@Param('requestId') requestId: string, @GetUser() adminUser: User) {
    return this.profileService.processCorrectionRequest(requestId, adminUser._id as Types.ObjectId, 'Rejected');
  }
}