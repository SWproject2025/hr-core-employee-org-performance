import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { CreateAppraisalTemplateDto } from './dto/create-appraisal-template.dto';
import { UpdateAppraisalTemplateDto } from './dto/update-appraisal-template.dto';
import { CreateAppraisalCycleDto } from './dto/create-appraisal-cycle.dto';
import { SubmitAppraisalDto } from './dto/submit-appraisal.dto';
// ⚠️ Removed SubmitDisputeDto import
import { ResolveDisputeDto } from './dto/ResolveDisputeDto';

@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ================
  // TEMPLATES
  // ================

  @Post('templates')
  createTemplate(@Body() dto: CreateAppraisalTemplateDto) {
    return this.performanceService.createTemplate(dto);
  }

  @Get('templates')
  getAllTemplates() {
    return this.performanceService.getAllTemplates();
  }

  @Get('templates/:id')
  getTemplateById(@Param('id') id: string) {
    return this.performanceService.getTemplateById(id);
  }

  @Patch('templates/:id')
  updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateAppraisalTemplateDto,
  ) {
    return this.performanceService.updateTemplate(id, dto);
  }

  // ================
  // CYCLES
  // ================

  @Post('cycles')
  createCycle(@Body() dto: CreateAppraisalCycleDto) {
    return this.performanceService.createCycle(dto);
  }

  @Get('cycles')
  getAllCycles() {
    return this.performanceService.getAllCycles();
  }

  @Get('cycles/:id')
  getCycleById(@Param('id') id: string) {
    return this.performanceService.getCycleById(id);
  }

  // ================
  // MANAGER – ASSIGNMENTS & SUBMISSION
  // ================

  @Get('manager/:managerProfileId/assignments')
  getManagerAssignments(
    @Param('managerProfileId') managerProfileId: string,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.performanceService.getAssignmentsForManager(
      managerProfileId,
      cycleId,
    );
  }

  @Get('manager/assignments/:assignmentId')
  getManagerAssignmentDetails(
    @Param('assignmentId') assignmentId: string,
  ) {
    return this.performanceService.getAssignmentDetailsForManager(
      assignmentId,
    );
  }

  @Post('manager/assignments/:assignmentId/submit')
  submitManagerAppraisal(
    @Param('assignmentId') assignmentId: string,
    @Body() dto: SubmitAppraisalDto,
  ) {
    return this.performanceService.submitManagerAppraisal(
      assignmentId,
      dto,
    );
  }

  // ================
  // HR – PUBLISH APPRAISAL
  // ================

  @Post('hr/assignments/:assignmentId/publish')
  publishAppraisal(@Param('assignmentId') assignmentId: string) {
    return this.performanceService.publishAppraisal(assignmentId);
  }

  // ================
  // EMPLOYEE – VIEW & ACK
  // ================

  @Get('employee/:employeeProfileId/appraisals')
  getEmployeeAppraisals(
    @Param('employeeProfileId') employeeProfileId: string,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.performanceService.getAppraisalsForEmployee(
      employeeProfileId,
      cycleId,
    );
  }

  @Get('employee/appraisals/:assignmentId')
  getEmployeeAppraisal(@Param('assignmentId') assignmentId: string) {
    return this.performanceService.getEmployeeAppraisal(assignmentId);
  }

  @Post('employee/appraisals/:assignmentId/acknowledge')
  acknowledgeAppraisal(@Param('assignmentId') assignmentId: string) {
    return this.performanceService.acknowledgeAppraisal(assignmentId);
  }

  // ================
  // EMPLOYEE – DISPUTE
  // ================

  @Post('employee/appraisals/:assignmentId/dispute')
  submitDispute(
    @Param('assignmentId') assignmentId: string,
    @Body()
    dto: {
      employeeProfileId: string;
      reason: string;
      employeeComments?: string;
    },
  ) {
    return this.performanceService.submitDispute(
      assignmentId,
      dto.employeeProfileId,
      { reason: dto.reason, employeeComments: dto.employeeComments },
    );
  }

  // ================
  // HR – RESOLVE DISPUTE
  // ================

  @Post('hr/disputes/:disputeId/resolve')
  resolveDispute(
    @Param('disputeId') disputeId: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.performanceService.resolveDispute(disputeId, dto);
  }
}
