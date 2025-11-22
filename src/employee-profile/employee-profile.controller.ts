import { 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Param, 
    Body, 
    UseGuards, // Assuming you might have auth guards later
    Put
  } from '@nestjs/common';
  import { EmployeeProfileService } from './employee-profile.service';
  
  @Controller('employee-profile')
  export class EmployeeProfileController {
    constructor(private readonly employeeService: EmployeeProfileService) {}
  
    // Get own profile or specific employee profile
    @Get(':id')
    async getProfile(@Param('id') id: string) {
      return this.employeeService.getProfile(id);
    }
  
    // Update Contact Info (Self-Service)
    @Patch(':id/contact-info')
    async updateContactInfo(
      @Param('id') id: string, 
      @Body() updateData: any
    ) {
      return this.employeeService.updateContactInfo(id, updateData);
    }
  
    // Submit a Change Request (for sensitive data)
    @Post(':id/change-request')
    async submitChangeRequest(
      @Param('id') id: string, 
      @Body() changes: any
    ) {
      return this.employeeService.submitChangeRequest(id, changes);
    }
  
    // Manager View: Get Team Profiles
    @Get('team/:managerId')
    async getTeam(@Param('managerId') managerId: string) {
      return this.employeeService.getTeamProfiles(managerId);
    }
  
    // HR/Admin: Approve Change Request
    @Post('change-request/:requestId/approve')
    async approveRequest(
      @Param('requestId') requestId: string,
      @Body('reviewerId') reviewerId: string
    ) {
      return this.employeeService.approveChangeRequest(requestId, reviewerId);
    }
  
    // HR/Admin: Reject Change Request
    @Post('change-request/:requestId/reject')
    async rejectRequest(
      @Param('requestId') requestId: string,
      @Body('reviewerId') reviewerId: string
    ) {
      return this.employeeService.rejectChangeRequest(requestId, reviewerId);
    }
  
    // HR/Admin: Direct Full Update (Master Data Management)
    @Put(':id/admin-update')
    async adminUpdate(
      @Param('id') id: string,
      @Body() data: any
    ) {
      return this.employeeService.adminUpdateProfile(id, data);
    }
  }