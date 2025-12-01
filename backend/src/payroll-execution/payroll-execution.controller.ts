import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { PayrollExecutionService } from './payroll-execution.service';
import { EditSigningBonusDto } from './dto/editSigningBonusDto'; 
import { EditBenefitDto } from './dto/editBenefitDto';
import { ValidatePayrollPeriodDto } from './dto/validatePayrollPeriodDto';
import { ApprovePayrollPeriodDto } from './dto/approvePayrollPeriodDto';
import { RejectPayrollPeriodDto } from './dto/rejectPayrollPeriodDto';
import { EditPayrollPeriodDto } from './dto/editPayrollPeriodDto';
import { StartPayrollInitiationDto } from './dto/startPayrollInitiationDto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payroll-execution')
@UseGuards(JwtAuthGuard)
export class PayrollExecutionController {
  constructor(private readonly payrollExecutionService: PayrollExecutionService) {}

  @Get('signing-bonuses/pending')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async getPendingSigningBonuses() {
    return await this.payrollExecutionService.getPendingSigningBonuses();
  }

  @Get('signing-bonuses/:id')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async getSigningBonusById(@Param('id') id: string) {
    return await this.payrollExecutionService.getSigningBonusById(id);
  }

  @Patch('signing-bonuses/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async approveSigningBonus(@Param('id') id: string) {
    return await this.payrollExecutionService.approveSigningBonus(id);
  }

  @Patch('signing-bonuses/:id/reject')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async rejectSigningBonus(@Param('id') id: string) {
    return await this.payrollExecutionService.rejectSigningBonus(id);
  }

  @Patch('signing-bonuses/:id/edit')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async editSigningBonus(
    @Param('id') id: string,
    @Body() editSigningBonusDto: EditSigningBonusDto,
  ) {
    return await this.payrollExecutionService.editSigningBonus(
      id,
      editSigningBonusDto.givenAmount,
      editSigningBonusDto.paymentDate,
    );
  }

  @Get('benefits/pending')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async getPendingBenefits() {
    return await this.payrollExecutionService.getPendingBenefits();
  }

  @Get('benefits/:id')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async getBenefitById(@Param('id') id: string) {
    return await this.payrollExecutionService.getBenefitById(id);
  }

  @Patch('benefits/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async approveBenefit(@Param('id') id: string) {
    return await this.payrollExecutionService.approveBenefit(id);
  }

  @Patch('benefits/:id/reject')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async rejectBenefit(@Param('id') id: string) {
    return await this.payrollExecutionService.rejectBenefit(id);
  }

  @Patch('benefits/:id/edit')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async editBenefit(
    @Param('id') id: string,
    @Body() editBenefitDto: EditBenefitDto,
  ) {
    return await this.payrollExecutionService.editBenefit(id, editBenefitDto.givenAmount);
  }

  @Get('payroll-period/suggested')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async getSuggestedPayrollPeriod() {
    return await this.payrollExecutionService.getSuggestedPayrollPeriod();
  }

  @Post('payroll-period/validate')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async validatePayrollPeriod(@Body() validatePayrollPeriodDto: ValidatePayrollPeriodDto) {
    return await this.payrollExecutionService.validatePayrollPeriod(
      validatePayrollPeriodDto.payrollPeriod,
    );
  }

  @Get('payroll-runs/:id')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST', 'PAYROLL_MANAGER')
  async getPayrollRunById(@Param('id') id: string) {
    return await this.payrollExecutionService.getPayrollRunById(id);
  }

  @Patch('payroll-runs/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_MANAGER')
  async approvePayrollPeriod(
    @Param('id') id: string,
    @Body() approvePayrollPeriodDto: ApprovePayrollPeriodDto,
  ) {
    return await this.payrollExecutionService.approvePayrollPeriod(
      id,
      approvePayrollPeriodDto.payrollManagerId,
    );
  }

  @Patch('payroll-runs/:id/reject')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_MANAGER')
  async rejectPayrollPeriod(
    @Param('id') id: string,
    @Body() rejectPayrollPeriodDto: RejectPayrollPeriodDto,
  ) {
    return await this.payrollExecutionService.rejectPayrollPeriod(
      id,
      rejectPayrollPeriodDto.rejectionReason,
    );
  }

  @Patch('payroll-runs/:id/edit')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async editPayrollPeriod(
    @Param('id') id: string,
    @Body() editPayrollPeriodDto: EditPayrollPeriodDto,
  ) {
    return await this.payrollExecutionService.editPayrollPeriod(
      id,
      editPayrollPeriodDto.payrollPeriod,
    );
  }

  @Post('payroll-runs/start')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async startPayrollInitiation(@Body() startPayrollInitiationDto: StartPayrollInitiationDto) {
    return await this.payrollExecutionService.startPayrollInitiation(
      startPayrollInitiationDto.runId,
      startPayrollInitiationDto.payrollPeriod,
      startPayrollInitiationDto.payrollSpecialistId,
      startPayrollInitiationDto.entity,
    );
  }

  @Get('pre-run-check')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async checkPreRunApprovalsComplete() {
    return await this.payrollExecutionService.checkPreRunApprovalsComplete();
  }

  @Patch('payroll-runs/:runId/publish')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async publishDraftForApproval(@Param('runId') runId: string) {
    return await this.payrollExecutionService.publishDraftForApproval(runId);
  }

  @Patch('payroll-runs/:runId/manager-approve')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_MANAGER')
  async approveByPayrollManager(
    @Param('runId') runId: string,
    @Body() body: { approverId?: string },
  ) {
    return await this.payrollExecutionService.approveByPayrollManager(runId, body.approverId);
  }

  @Patch('payroll-runs/:runId/manager-reject')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_MANAGER')
  async rejectByPayrollManager(
    @Param('runId') runId: string,
    @Body() body: { reason: string; approverId?: string },
  ) {
    return await this.payrollExecutionService.rejectByPayrollManager(runId, body.reason, body.approverId);
  }

  @Patch('payroll-runs/:runId/finance-approve')
  @UseGuards(RolesGuard)
  @Roles('FINANCE_STAFF')
  async approveByFinanceStaff(
    @Param('runId') runId: string,
    @Body() body: { approverId?: string },
  ) {
    return await this.payrollExecutionService.approveByFinanceStaff(runId, body.approverId);
  }

  @Patch('payroll-runs/:runId/finance-reject')
  @UseGuards(RolesGuard)
  @Roles('FINANCE_STAFF')
  async rejectByFinanceStaff(
    @Param('runId') runId: string,
    @Body() body: { reason: string; approverId?: string },
  ) {
    return await this.payrollExecutionService.rejectByFinanceStaff(runId, body.reason, body.approverId);
  }

  @Patch('payroll-runs/:runId/freeze')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_MANAGER', 'FINANCE_STAFF')
  async freezePayroll(
    @Param('runId') runId: string,
    @Body() body: { reason?: string },
  ) {
    return await this.payrollExecutionService.freezePayroll(runId, body.reason);
  }

  @Patch('payroll-runs/:runId/unfreeze')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_MANAGER', 'FINANCE_STAFF')
  async unfreezePayroll(
    @Param('runId') runId: string,
    @Body() body: { unlockReason?: string },
  ) {
    return await this.payrollExecutionService.unfreezePayroll(runId, body.unlockReason);
  }

  @Get('payroll-runs/:runId/approvals')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST', 'PAYROLL_MANAGER', 'FINANCE_STAFF')
  async getApprovalsByRunId(@Param('runId') runId: string) {
    return await this.payrollExecutionService.getApprovalsByRunId(runId);
  }

  @Post('payroll-runs/:runId/adjustments')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async createPayrollAdjustment(
    @Param('runId') runId: string,
    @Body() body: { employeeId: string; type: 'bonus' | 'deduction' | 'benefit'; amount: number; reason?: string },
  ) {
    return await this.payrollExecutionService.createPayrollAdjustment(
      runId,
      body.employeeId,
      body.type,
      body.amount,
      body.reason,
    );
  }

  @Patch('payroll-runs/:runId/exceptions/:employeeId/resolve')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async resolveException(
    @Param('runId') runId: string,
    @Param('employeeId') employeeId: string,
    @Body() body: { resolutionNote?: string },
  ) {
    return await this.payrollExecutionService.resolveException(runId, employeeId, body.resolutionNote);
  }

  @Post('payroll-runs/:runId/payslips/generate')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async generatePayslips(@Param('runId') runId: string) {
    return await this.payrollExecutionService.generatePayslips(runId);
  }

  @Patch('payroll-runs/:runId/payslips/distribute')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async distributePayslips(@Param('runId') runId: string) {
    return await this.payrollExecutionService.distributePayslips(runId);
  }

  @Patch('payroll-runs/:runId/mark-paid')
  @UseGuards(RolesGuard)
  @Roles('FINANCE_STAFF')
  async markPayrollAsPaid(@Param('runId') runId: string) {
    return await this.payrollExecutionService.markPayrollAsPaid(runId);
  }

  @Post('payroll-runs/:runId/exceptions/flag')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async flagPayrollExceptions(@Param('runId') runId: string) {
    return await this.payrollExecutionService.flagPayrollExceptions(runId);
  }

  @Get('payroll-runs/:runId/exceptions')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST', 'PAYROLL_MANAGER')
  async getPayrollRunExceptions(@Param('runId') runId: string) {
    return await this.payrollExecutionService.getPayrollRunExceptions(runId);
  }

  @Get('payroll-runs/:runId/review/draft')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_SPECIALIST')
  async reviewPayrollDraft(@Param('runId') runId: string) {
    return await this.payrollExecutionService.reviewPayrollDraft(runId);
  }

  @Get('payroll-runs/:runId/review/manager')
  @UseGuards(RolesGuard)
  @Roles('PAYROLL_MANAGER')
  async getPayrollForManagerReview(@Param('runId') runId: string) {
    return await this.payrollExecutionService.getPayrollForManagerReview(runId);
  }

  @Get('payroll-runs/:runId/review/finance')
  @UseGuards(RolesGuard)
  @Roles('FINANCE_STAFF')
  async getPayrollForFinanceReview(@Param('runId') runId: string) {
    return await this.payrollExecutionService.getPayrollForFinanceReview(runId);
  }
}
