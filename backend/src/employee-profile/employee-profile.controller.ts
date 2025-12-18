import { Controller, Get, Put, Post, Param, Body, Req } from '@nestjs/common';
import { EmployeeProfileService } from './employee-profile.service';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateChangeRequestDto } from './dto/change-request.dto';

@Controller('employee-profile')
export class EmployeeProfileController {
  constructor(private readonly employeeProfileService: EmployeeProfileService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.employeeProfileService.getProfile(id);
  }

  @Put(':id/contact')
  async updateContactInfo(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @Req() req: any,
  ) {
    return this.employeeProfileService.updateContactInfo(id, dto);
  }

  @Post(':id/change-request')
  async submitChangeRequest(
    @Param('id') id: string,
    @Body() dto: CreateChangeRequestDto,
  ) {
    return this.employeeProfileService.submitChangeRequest(
      id,
      dto.changes,
      dto.reason,
    );
  }

  @Get('team/:managerId')
  async getTeam(@Param('managerId') managerId: string) {
    return this.employeeProfileService.getTeamProfiles(managerId);
  }

  @Post('change-request/:requestId/approve')
  async approveRequest(
    @Param('requestId') requestId: string,
    @Param('adminId') adminId: string,
  ) {
    return this.employeeProfileService.approveChangeRequest(requestId);
  }

  @Put('admin/:id')
  async adminUpdate(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    return this.employeeProfileService.adminUpdateProfile(id, dto);
  }
}
