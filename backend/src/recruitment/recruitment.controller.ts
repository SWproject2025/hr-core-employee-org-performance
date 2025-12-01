import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';

import { RecruitmentService } from './recruitment.service';

import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';

import { CreateJobRequisitionDto } from './dto/create-job-requisition.dto';
import { UpdateJobRequisitionDto } from './dto/update-job-requisition.dto';

import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UpdateApplicationStageDto } from './dto/update-application-stage.dto';
import { RejectApplicationDto } from './dto/reject-application.dto';
import { WithdrawApplicationDto } from './dto/withdraw-application.dto';
import { HoldApplicationDto } from './dto/hold-application.dto';

import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';
import { CancelInterviewDto } from './dto/cancel-interview.dto';

import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { UpdateAssessmentResultDto } from './dto/update-assessment-result.dto';

import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';

import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferStatusDto } from './dto/update-offer-status.dto';
import { RespondOfferDto } from './dto/respond-offer.dto';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  // Job Templates
  @Post('job-templates')
  createJobTemplate(@Body() dto: CreateJobTemplateDto) {
    return this.recruitmentService.createJobTemplate(dto);
  }

  @Get('job-templates')
  findAllJobTemplates() {
    return this.recruitmentService.findAllJobTemplates();
  }

  @Get('job-templates/:id')
  findOneJobTemplate(@Param('id') id: string) {
    return this.recruitmentService.findOneJobTemplate(id);
  }

  @Patch('job-templates/:id')
  updateJobTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateJobTemplateDto,
  ) {
    return this.recruitmentService.updateJobTemplate(id, dto);
  }

  @Delete('job-templates/:id')
  removeJobTemplate(@Param('id') id: string) {
    return this.recruitmentService.removeJobTemplate(id);
  }

  // Job Requisitions
  @Post('requisitions')
  createJobRequisition(@Body() dto: CreateJobRequisitionDto) {
    return this.recruitmentService.createJobRequisition(dto);
  }

  @Get('requisitions')
  findAllJobRequisitions() {
    return this.recruitmentService.findAllJobRequisitions();
  }

  @Get('requisitions/:id')
  findOneJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.findOneJobRequisition(id);
  }

  @Patch('requisitions/:id')
  updateJobRequisition(
    @Param('id') id: string,
    @Body() dto: UpdateJobRequisitionDto,
  ) {
    return this.recruitmentService.updateJobRequisition(id, dto);
  }

  @Delete('requisitions/:id')
  removeJobRequisition(@Param('id') id: string) {
    return this.recruitmentService.removeJobRequisition(id);
  }

  // Applications
  @Post('applications')
  createApplication(@Body() dto: CreateApplicationDto) {
    return this.recruitmentService.createApplication(dto);
  }

  @Get('applications')
  findAllApplications() {
    return this.recruitmentService.findAllApplications();
  }

  @Get('applications/:id')
  findOneApplication(@Param('id') id: string) {
    return this.recruitmentService.findOneApplication(id);
  }

  @Get('applications/:id/history')
  getApplicationHistory(@Param('id') id: string) {
    return this.recruitmentService.getApplicationHistory(id);
  }

  @Patch('applications/:id/status')
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.recruitmentService.updateApplicationStatus(id, dto);
  }

  @Patch('applications/:id/stage')
  updateApplicationStage(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStageDto,
  ) {
    return this.recruitmentService.updateApplicationStage(id, dto);
  }

  @Patch('applications/:id/reject')
  rejectApplication(
    @Param('id') id: string,
    @Body() dto: RejectApplicationDto,
  ) {
    return this.recruitmentService.rejectApplication(id, dto);
  }

  @Patch('applications/:id/withdraw')
  withdrawApplication(
    @Param('id') id: string,
    @Body() dto: WithdrawApplicationDto,
  ) {
    return this.recruitmentService.withdrawApplication(id, dto);
  }

  @Patch('applications/:id/hold')
  holdApplication(
    @Param('id') id: string,
    @Body() dto: HoldApplicationDto,
  ) {
    return this.recruitmentService.holdApplication(id, dto);
  }

  // Interviews
  @Post('interviews')
  scheduleInterview(@Body() dto: CreateInterviewDto) {
    return this.recruitmentService.scheduleInterview(dto);
  }

  @Patch('interviews/:id')
  updateInterview(
    @Param('id') id: string,
    @Body() dto: UpdateInterviewDto,
  ) {
    return this.recruitmentService.updateInterview(id, dto);
  }

  @Patch('interviews/:id/cancel')
  cancelInterview(
    @Param('id') id: string,
    @Body() dto: CancelInterviewDto,
  ) {
    return this.recruitmentService.cancelInterview(id, dto);
  }

  @Get('applications/:id/interviews')
  getInterviewsForApplication(@Param('id') id: string) {
    return this.recruitmentService.getInterviewsForApplication(id);
  }

  // Assessments
  @Post('assessments')
  createAssessmentResult(@Body() dto: CreateAssessmentResultDto) {
    return this.recruitmentService.createAssessmentResult(dto);
  }

  @Patch('assessments/:id')
  updateAssessmentResult(
    @Param('id') id: string,
    @Body() dto: UpdateAssessmentResultDto,
  ) {
    return this.recruitmentService.updateAssessmentResult(id, dto);
  }

  @Get('applications/:id/assessments')
  getAssessmentsForApplication(@Param('id') id: string) {
    return this.recruitmentService.getAssessmentsForApplication(id);
  }

  @Get('interviews/:id/assessments')
  getAssessmentsForInterview(@Param('id') id: string) {
    return this.recruitmentService.getAssessmentsForInterview(id);
  }

  // Referrals
  @Post('referrals')
  createReferral(@Body() dto: CreateReferralDto) {
    return this.recruitmentService.createReferral(dto);
  }

  @Patch('referrals/:id')
  updateReferral(
    @Param('id') id: string,
    @Body() dto: UpdateReferralDto,
  ) {
    return this.recruitmentService.updateReferral(id, dto);
  }

  @Get('referrals/:id')
  getReferral(@Param('id') id: string) {
    return this.recruitmentService.getReferral(id);
  }

  @Get('referrals/candidate/:candidateId')
  getReferralsForCandidate(@Param('candidateId') candidateId: string) {
    return this.recruitmentService.getReferralsForCandidate(candidateId);
  }

  @Get('referrals/employee/:employeeId')
  getReferralsByEmployee(@Param('employeeId') employeeId: string) {
    return this.recruitmentService.getReferralsByEmployee(employeeId);
  }

  // Offers
  @Post('offers')
  createOffer(@Body() dto: CreateOfferDto) {
    return this.recruitmentService.createOffer(dto);
  }

  @Patch('offers/:id/status')
  updateOfferStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOfferStatusDto,
  ) {
    return this.recruitmentService.updateOfferStatus(id, dto);
  }

  @Patch('offers/:id/accept')
  acceptOffer(
    @Param('id') id: string,
    @Body() dto: RespondOfferDto,
  ) {
    return this.recruitmentService.acceptOffer(id, dto);
  }

  @Patch('offers/:id/reject')
  rejectOffer(
    @Param('id') id: string,
    @Body() dto: RespondOfferDto,
  ) {
    return this.recruitmentService.rejectOffer(id, dto);
  }

  @Get('applications/:id/offer')
  getOfferForApplication(@Param('id') id: string) {
    return this.recruitmentService.getOfferForApplication(id);
  }
}
