import { 
  Controller, Get, Put, Post, Param, Body, Req, Query, 
  UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeeProfileService } from './employee-profile.service';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CreateChangeRequestDto } from './dto/change-request.dto';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';

@Controller('employee-profile')
export class EmployeeProfileController {
  constructor(private readonly employeeProfileService: EmployeeProfileService) {}

  // ==================================================================
  // ✅ 1. SPECIFIC ROUTES (Must come BEFORE :id)
  // ==================================================================

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMyProfile(@Req() req: any) {
    // 👇 ADD THESE LOGS
    console.log('--- DEBUG: /me route hit ---');
    console.log('User from Token:', req.user);
    
    const userId = req.user?.userId || req.user?.sub;
    console.log('Extracted UserID:', userId);

    return this.employeeProfileService.getProfileWithRole(userId);
  }

  @Get('search') // <--- Moved UP here so it doesn't get caught by :id
  async searchEmployees(@Query('q') query: string) {
    return this.employeeProfileService.searchEmployees(query);
  }

  @Get('team/:managerId')
  async getTeam(@Param('managerId') managerId: string) {
    return this.employeeProfileService.getTeamProfiles(managerId);
  }

  @Put('me/password')
  async changeMyPassword(@Body() body: any, @Req() req: any) {
    const userId = req?.user?.userId;
    const { oldPassword, newPassword } = body;
    return this.employeeProfileService.changePassword(userId, oldPassword, newPassword);
  }

  @Post('change-request/:requestId/approve')
  async approveRequest(@Param('requestId') requestId: string) {
    return this.employeeProfileService.approveChangeRequest(requestId);
  }
  
  @Put('admin/:id')
  async adminUpdate(
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.employeeProfileService.adminUpdateProfile(id, dto);
  }

  // ==================================================================
  // ✅ 2. WILDCARD ROUTES (Must come LAST)
  // ==================================================================

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.employeeProfileService.getProfile(id);
  }

  @Put(':id/contact')
  async updateContactInfo(
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
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

  @Post(':id/upload-photo')
  @UseInterceptors(FileInterceptor('file')) // 'file' matches the form-data key
  async uploadProfilePicture(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // Limit: 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }), // Limit: Images only
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    // In a real app, you would generate a full URL (e.g., http://localhost:3000/uploads/...)
    // For now, we store the filename/path
    return this.employeeProfileService.updateProfilePicture(id, file.path);
  }
}