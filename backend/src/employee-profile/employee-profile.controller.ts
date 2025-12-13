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

  @Get('me')
  async getMyProfile(@Req() req: any) {
    const userId = req?.user?.userId;
    return this.employeeProfileService.getProfileWithRole(userId);
  }

  @Put(':id/contact')
  async updateContactInfo(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @Req() req: any,
  ) {
    return this.employeeProfileService.updateContactInfo(id, dto);
  }

  @Put('me/password')
  async changeMyPassword(@Body() body: any, @Req() req: any) {
    const userId = req?.user?.userId;
    const { oldPassword, newPassword } = body;
    return this.employeeProfileService.changePassword(userId, oldPassword, newPassword);
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
