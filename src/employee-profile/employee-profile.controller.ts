import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  Put,
  Request, 
  UseGuards 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeeProfileService } from './employee-profile.service';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateChangeRequestDto } from './dto/change-request.dto';

@Controller('employee-profile')
@UseGuards(AuthGuard('jwt')) // <--- PROTECTS ALL ROUTES IN THIS CONTROLLER
export class EmployeeProfileController {
  constructor(private readonly employeeService: EmployeeProfileService) {}

  // 1. Get Profile
  // Now requires a valid Token. User can only see profile if logged in.
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.employeeService.getProfile(id);
  }

  // 2. Update Contact Info (Self-Service)
  // Extracts the logged-in user's ID from the JWT to log "performedBy"
  @Patch(':id/contact-info')
  async updateContactInfo(
    @Param('id') id: string, 
    @Body() updateDto: UpdateContactDto,
    @Request() req: any 
  ) {
    // req.user is populated by the JwtStrategy
    const performedBy = req.user.userId; 
    
    return this.employeeService.updateContactInfo(id, updateDto, performedBy);
  }

  // 3. Submit Change Request
  @Post(':id/change-request')
  async submitChangeRequest(
    @Param('id') id: string, 
    @Body() changeDto: CreateChangeRequestDto
  ) {
    // Optional: You could also grab req.user.userId here if you want to verify the requester
    return this.employeeService.submitChangeRequest(id, changeDto.changes, changeDto.reason);
  }

  // 4. Manager View Team
  @Get('team/:managerId')
  async getTeam(@Param('managerId') managerId: string) {
    return this.employeeService.getTeamProfiles(managerId);
  }

  // 5. Approve Request (HR Admin)
  @Post('change-request/:requestId/approve')
  async approveRequest(
    @Param('requestId') requestId: string,
    @Body('reviewerId') reviewerId: string
  ) {
    // In a real app, 'reviewerId' should come from req.user.userId 
    // to ensure the person approving is actually the one logged in.
    return this.employeeService.approveChangeRequest(requestId, reviewerId);
  }

  // 6. Reject Request (HR Admin)
  @Post('change-request/:requestId/reject')
  async rejectRequest(
    @Param('requestId') requestId: string,
    @Body('reviewerId') reviewerId: string
  ) {
    return this.employeeService.rejectChangeRequest(requestId, reviewerId);
  }

  // 7. Admin Full Update (Master Data)
  @Put(':id/admin-update')
  async adminUpdate(
    @Param('id') id: string,
    @Body() data: any,
    @Request() req: any
  ) {
    const adminId = req.user.userId;
    
    return this.employeeService.adminUpdateProfile(id, data, adminId);
  }
}