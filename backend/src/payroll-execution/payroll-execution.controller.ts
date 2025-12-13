import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { PayrollExecutionService } from './payroll-execution.service';
import { CalcDraftService } from './calc-draft/calc-draft.service';
import { EditSigningBonusDto } from './dto/editSigningBonusDto'; 
import { EditBenefitDto } from './dto/editBenefitDto';
import { ValidatePayrollPeriodDto } from './dto/validatePayrollPeriodDto';
import { ApprovePayrollPeriodDto } from './dto/approvePayrollPeriodDto';
import { RejectPayrollPeriodDto } from './dto/rejectPayrollPeriodDto';
import { EditPayrollPeriodDto } from './dto/editPayrollPeriodDto';
import { StartPayrollInitiationDto } from './dto/startPayrollInitiationDto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { RolesGuard } from '../Common/Gaurds/roles.gaurd';
import { Roles } from '../Common/Decorators/roles.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { employeePayrollDetails, employeePayrollDetailsDocument } from './models/employeePayrollDetails.schema';
import { paySlip, PayslipDocument } from './models/payslip.schema';
import { payrollRuns, payrollRunsDocument } from './models/payrollRuns.schema';
import mongoose from 'mongoose';

@Controller('payroll-execution')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class PayrollExecutionController {
  constructor(
    private readonly payrollExecutionService: PayrollExecutionService,
    private readonly calcDraftService: CalcDraftService,
    @InjectModel(employeePayrollDetails.name) private employeePayrollDetailsModel: Model<employeePayrollDetailsDocument>,
    @InjectModel(paySlip.name) private paySlipModel: Model<PayslipDocument>,
    @InjectModel(payrollRuns.name) private payrollRunsModel: Model<payrollRunsDocument>,
  ) {}

  // ============ PRE-RUN APPROVALS ============
  
  @Get('signing-bonuses/pending')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async getPendingSigningBonuses() {
    return await this.payrollExecutionService.getPendingSigningBonuses();
  }


  @Get('signing-bonuses/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async getSigningBonusById(@Param('id') id: string) {
    return await this.payrollExecutionService.getSigningBonusById(id);
  }

  @Patch('signing-bonuses/:id/approve')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async approveSigningBonus(@Param('id') id: string) {
    return await this.payrollExecutionService.approveSigningBonus(id);
  }

  @Patch('signing-bonuses/:id/reject')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async rejectSigningBonus(@Param('id') id: string) {
    return await this.payrollExecutionService.rejectSigningBonus(id);
  }

  @Patch('signing-bonuses/:id/edit')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
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
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async getPendingBenefits() {
    return await this.payrollExecutionService.getPendingBenefits();
  }

  @Get('benefits/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async getBenefitById(@Param('id') id: string) {
    return await this.payrollExecutionService.getBenefitById(id);
  }

  @Patch('benefits/:id/approve')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async approveBenefit(@Param('id') id: string) {
    return await this.payrollExecutionService.approveBenefit(id);
  }

  @Patch('benefits/:id/reject')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async rejectBenefit(@Param('id') id: string) {
    return await this.payrollExecutionService.rejectBenefit(id);
  }

  @Patch('benefits/:id/edit')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async editBenefit(
    @Param('id') id: string,
    @Body() editBenefitDto: EditBenefitDto,
  ) {
    return await this.payrollExecutionService.editBenefit(id, editBenefitDto.givenAmount);
  }

  @Get('pre-run-check')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async checkPreRunApprovalsComplete() {
    return await this.payrollExecutionService.checkPreRunApprovalsComplete();
  }

  // ============ PAYROLL PERIOD ============
  
  @Get('payroll-period/suggested')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async getSuggestedPayrollPeriod() {
    return await this.payrollExecutionService.getSuggestedPayrollPeriod();
  }

  @Post('payroll-period/validate')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async validatePayrollPeriod(@Body() validatePayrollPeriodDto: ValidatePayrollPeriodDto) {
    return await this.payrollExecutionService.validatePayrollPeriod(
      validatePayrollPeriodDto.payrollPeriod,
    );
  }

  // ============ PAYROLL RUNS - CRUD ============
  
  @Get('payroll-runs')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async getAllPayrollRuns(
    @Query('status') status?: string,
    @Query('entity') entity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = { status, entity, startDate, endDate };
    return await this.payrollExecutionService.getAllPayrollRuns(filters);
  }

  @Get('payroll-runs/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async getPayrollRunById(@Param('id') id: string) {
    return await this.payrollExecutionService.getPayrollRunById(id);
  }

  @Post('payroll-runs/start')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async startPayrollInitiation(@Body() startPayrollInitiationDto: StartPayrollInitiationDto) {
    return await this.payrollExecutionService.startPayrollInitiation(
      startPayrollInitiationDto.runId,
      startPayrollInitiationDto.payrollPeriod,
      startPayrollInitiationDto.payrollSpecialistId,
      startPayrollInitiationDto.entity,
    );
  }

  @Patch('payroll-runs/:id/edit')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async editPayrollPeriod(
    @Param('id') id: string,
    @Body() editPayrollPeriodDto: EditPayrollPeriodDto,
  ) {
    return await this.payrollExecutionService.editPayrollPeriod(
      id,
      editPayrollPeriodDto.payrollPeriod,
    );
  }

  @Delete('payroll-runs/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async deletePayrollRun(@Param('id') id: string) {
    try {
      const run = await this.payrollExecutionService.getPayrollRunById(id);
      
      if (!['draft', 'rejected'].includes(run.status.toLowerCase())) {
        throw new BadRequestException(`Cannot delete payroll run with status: ${run.status}. Only draft or rejected runs can be deleted.`);
      }

      const objectId = new mongoose.Types.ObjectId(id);
      
      // Delete associated employee payroll details
      await this.employeePayrollDetailsModel.deleteMany({ payrollRunId: objectId });
      
      // Delete the payroll run itself
      await this.payrollRunsModel.findByIdAndDelete(objectId);
      
      return { 
        success: true, 
        message: 'Payroll run and related data deleted successfully',
        deletedId: id
      };
    } catch (error) {
      throw new BadRequestException(`Failed to delete payroll run: ${error.message}`);
    }
  }

  @Patch('payroll-runs/:id/approve')
  @Roles(SystemRole.PAYROLL_MANAGER)
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
  @Roles(SystemRole.PAYROLL_MANAGER)
  async rejectPayrollPeriod(
    @Param('id') id: string,
    @Body() rejectPayrollPeriodDto: RejectPayrollPeriodDto,
  ) {
    return await this.payrollExecutionService.rejectPayrollPeriod(
      id,
      rejectPayrollPeriodDto.rejectionReason,
    );
  }

  // ============ DRAFT REVIEW ============
  
  @Get('payroll-runs/:runId/review/draft')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async reviewPayrollDraft(@Param('runId') runId: string) {
    try {
      const objectId = new mongoose.Types.ObjectId(runId);
      
      const run = await this.payrollExecutionService.getPayrollRunById(runId);
      
      const employeePayrollDetails = await this.employeePayrollDetailsModel
        .find({ payrollRunId: objectId })
        .populate('employeeId')
        .exec();
      
      const exceptions = await this.calcDraftService.getExceptionsByRun(objectId);
      
      const summary = {
        totalEmployees: run.employees || 0,
        totalExceptions: run.exceptions || 0,
        totalNetPay: run.totalnetpay || 0,
        totalGrossPay: employeePayrollDetails.reduce((sum, emp) => 
          sum + (emp.baseSalary || 0) + (emp.allowances || 0) + (emp.bonus || 0) + (emp.benefit || 0), 0
        ),
        totalDeductions: employeePayrollDetails.reduce((sum, emp) => sum + (emp.deductions || 0), 0),
      };
      
      return {
        run,
        employeePayrollDetails,
        exceptions,
        summary
      };
    } catch (error) {
      throw new BadRequestException(`Failed to review payroll draft: ${error.message}`);
    }
  }

  @Get('payroll-runs/:runId/review/manager')
  @Roles(SystemRole.PAYROLL_MANAGER)
  async getPayrollForManagerReview(@Param('runId') runId: string) {
    return await this.payrollExecutionService.getPayrollForManagerReview(runId);
  }

  @Get('payroll-runs/:runId/review/finance')
  @Roles(SystemRole.FINANCE_STAFF)
  async getPayrollForFinanceReview(@Param('runId') runId: string) {
    return await this.payrollExecutionService.getPayrollForFinanceReview(runId);
  }

  // ============ EXCEPTIONS ============
  
  @Get('payroll-runs/:runId/exceptions')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async getPayrollRunExceptions(@Param('runId') runId: string) {
    try {
      const objectId = new mongoose.Types.ObjectId(runId);
      
      const populatedExceptions = await this.employeePayrollDetailsModel
        .find({ 
          payrollRunId: objectId,
          exceptions: { $exists: true, $ne: null }
        })
        .populate('employeeId')
        .exec();
      
      return populatedExceptions.map(exc => {
        const employee = exc.employeeId as any;
        return {
          _id: exc._id,
          employeeId: employee?._id,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown',
          payrollRunId: exc.payrollRunId,
          exceptions: exc.exceptions,
          bankStatus: exc.bankStatus,
          netPay: exc.netPay,
          status: 'open',
          type: this.extractExceptionType(exc.exceptions || ''),
        };
      });
    } catch (error) {
      throw new BadRequestException(`Failed to get exceptions: ${error.message}`);
    }
  }

  @Post('payroll-runs/:runId/exceptions/flag')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async flagPayrollExceptions(@Param('runId') runId: string) {
    return await this.payrollExecutionService.flagPayrollExceptions(runId);
  }

  @Patch('payroll-runs/:runId/exceptions/:employeeId/resolve')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async resolveException(
    @Param('runId') runId: string,
    @Param('employeeId') employeeId: string,
    @Body() body: { resolutionNote?: string; updatedEmployeeData?: any },
  ) {
    try {
      const runObjectId = new mongoose.Types.ObjectId(runId);
      const employeeObjectId = new mongoose.Types.ObjectId(employeeId);
      
      if (body.updatedEmployeeData) {
        await this.calcDraftService.recalculateEmployeeSalary(
          runObjectId,
          employeeObjectId,
          body.updatedEmployeeData
        );
      }
      
      const payrollDetail = await this.employeePayrollDetailsModel.findOne({
        payrollRunId: runObjectId,
        employeeId: employeeObjectId
      });
      
      if (!payrollDetail) {
        throw new NotFoundException('Payroll detail not found');
      }
      
      payrollDetail.exceptions = undefined;
      await payrollDetail.save();
      
      return {
        success: true,
        message: 'Exception resolved successfully',
        resolutionNote: body.resolutionNote
      };
    } catch (error) {
      throw new BadRequestException(`Failed to resolve exception: ${error.message}`);
    }
  }

  // ============ ADJUSTMENTS ============
  
  @Post('payroll-runs/:runId/adjustments')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async createPayrollAdjustment(
    @Param('runId') runId: string,
    @Body() body: { 
      employeeId: string; 
      type: 'bonus' | 'deduction' | 'benefit'; 
      amount: number; 
      reason?: string 
    },
  ) {
    return await this.payrollExecutionService.createPayrollAdjustment(
      runId,
      body.employeeId,
      body.type,
      body.amount,
      body.reason,
    );
  }

  // ============ APPROVAL WORKFLOW ============
  
  @Patch('payroll-runs/:runId/publish')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async publishDraftForApproval(@Param('runId') runId: string) {
    return await this.payrollExecutionService.publishDraftForApproval(runId);
  }

  @Patch('payroll-runs/:runId/manager-approve')
  @Roles(SystemRole.PAYROLL_MANAGER)
  async approveByPayrollManager(
    @Param('runId') runId: string,
    @Body() body: { approverId?: string },
  ) {
    return await this.payrollExecutionService.approveByPayrollManager(runId, body.approverId);
  }

  @Patch('payroll-runs/:runId/manager-reject')
  @Roles(SystemRole.PAYROLL_MANAGER)
  async rejectByPayrollManager(
    @Param('runId') runId: string,
    @Body() body: { reason: string; approverId?: string },
  ) {
    return await this.payrollExecutionService.rejectByPayrollManager(runId, body.reason, body.approverId);
  }

  @Patch('payroll-runs/:runId/finance-approve')
  @Roles(SystemRole.FINANCE_STAFF)
  async approveByFinanceStaff(
    @Param('runId') runId: string,
    @Body() body: { approverId?: string },
  ) {
    return await this.payrollExecutionService.approveByFinanceStaff(runId, body.approverId);
  }

  @Patch('payroll-runs/:runId/finance-reject')
  @Roles(SystemRole.FINANCE_STAFF)
  async rejectByFinanceStaff(
    @Param('runId') runId: string,
    @Body() body: { reason: string; approverId?: string },
  ) {
    return await this.payrollExecutionService.rejectByFinanceStaff(runId, body.reason, body.approverId);
  }

  @Get('payroll-runs/:runId/approvals')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  async getApprovalsByRunId(@Param('runId') runId: string) {
    return await this.payrollExecutionService.getApprovalsByRunId(runId);
  }

  // ============ FREEZE/UNFREEZE ============
  
  @Patch('payroll-runs/:runId/freeze')
  @Roles(SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  async freezePayroll(
    @Param('runId') runId: string,
    @Body() body: { reason?: string },
  ) {
    return await this.payrollExecutionService.freezePayroll(runId, body.reason);
  }

  @Patch('payroll-runs/:runId/unfreeze')
  @Roles(SystemRole.PAYROLL_MANAGER, SystemRole.FINANCE_STAFF)
  async unfreezePayroll(
    @Param('runId') runId: string,
    @Body() body: { unlockReason?: string },
  ) {
    return await this.payrollExecutionService.unfreezePayroll(runId, body.unlockReason);
  }

  // ============ PAYSLIPS ============
  
  @Post('payroll-runs/:runId/payslips/generate')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async generatePayslips(@Param('runId') runId: string) {
    try {
      const runObjectId = new mongoose.Types.ObjectId(runId);
      
      const employeePayrollDetails = await this.employeePayrollDetailsModel
        .find({ payrollRunId: runObjectId })
        .exec();
      
      const generatedPayslips: any[] = [];
      for (const detail of employeePayrollDetails) {
        const payslip = await this.calcDraftService.generatePayslip(
          runObjectId,
          new mongoose.Types.ObjectId(detail.employeeId)
        );
        generatedPayslips.push(payslip);
      }
      
      return {
        success: true,
        message: `Generated ${generatedPayslips.length} payslips`,
        count: generatedPayslips.length,
        payslips: generatedPayslips
      };
    } catch (error) {
      throw new BadRequestException(`Failed to generate payslips: ${error.message}`);
    }
  }

// Fixed getAllPayslips endpoint in PayrollExecutionController
// Replace the existing method starting at line ~295 in your controller

@Get('payslips')
@Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
async getAllPayslips(
  @Query('runId') runId?: string,
  @Query('employeeName') employeeName?: string,
  @Query('department') department?: string,
  @Query('startDate') startDate?: string,
  @Query('endDate') endDate?: string,
) {
  try {
    const query: any = {};
    
    if (runId) {
      query.payrollRunId = new mongoose.Types.ObjectId(runId);
    }
    
    const payslips = await this.paySlipModel
      .find(query)
      .populate('employeeId')
      .populate('payrollRunId')
      .exec();
    
    let filteredPayslips = payslips;
    
    // Filter by employee name
    if (employeeName) {
      filteredPayslips = payslips.filter(payslip => {
        const emp = payslip.employeeId as any;
        if (!emp) return false;
        const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
        return fullName.includes(employeeName.toLowerCase());
      });
    }
    
    // Filter by department
    if (department) {
      filteredPayslips = filteredPayslips.filter(payslip => {
        const emp = payslip.employeeId as any;
        return emp && emp.department === department;
      });
    }
    
    // Map to frontend format - FIXED VERSION
    return filteredPayslips.map(payslip => {
      const emp = payslip.employeeId as any;
      const run = payslip.payrollRunId as any;
      
      // Calculate allowances
      const allowancesTotal = Array.isArray(payslip.earningsDetails?.allowances)
        ? payslip.earningsDetails.allowances.reduce((sum, a: any) => sum + (a.amount || 0), 0)
        : 0;
      
      // Calculate bonuses - use givenAmount for signingBonus schema
      const bonusesTotal = Array.isArray(payslip.earningsDetails?.bonuses)
        ? payslip.earningsDetails.bonuses.reduce((sum, b: any) => sum + (b.givenAmount || 0), 0)
        : 0;
      
      // Calculate benefits - use givenAmount for terminationAndResignationBenefits schema
      const benefitsTotal = Array.isArray(payslip.earningsDetails?.benefits)
        ? payslip.earningsDetails.benefits.reduce((sum, b: any) => sum + (b.givenAmount || 0), 0)
        : 0;
      
      // Calculate refunds
      const refundsTotal = Array.isArray(payslip.earningsDetails?.refunds)
        ? payslip.earningsDetails.refunds.reduce((sum, r: any) => sum + (r.amount || 0), 0)
        : 0;
      
      // Calculate taxes
      const taxesTotal = Array.isArray(payslip.deductionsDetails?.taxes) 
        ? payslip.deductionsDetails.taxes.reduce((sum, t: any) => sum + (t.amount || 0), 0) 
        : 0;
      
      // Calculate insurance
      const insuranceTotal = Array.isArray(payslip.deductionsDetails?.insurances) 
        ? payslip.deductionsDetails.insurances.reduce((sum, i: any) => sum + (i.amount || 0), 0) 
        : 0;
      
      // Calculate penalties - employeePenalties has nested penalties array
      let penaltiesTotal = 0;
      if (payslip.deductionsDetails?.penalties) {
        const penalties = payslip.deductionsDetails.penalties as any;
        if (Array.isArray(penalties.penalties)) {
          penaltiesTotal = penalties.penalties.reduce(
            (sum: number, p: any) => sum + (p.amount || 0),
            0
          );
        }
      }
      
      return {
        _id: payslip._id,
        employeeId: emp?._id,
        employeeName: emp ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim() : 'Unknown',
        employeeCode: emp?.code || emp?._id || 'N/A',
        department: emp?.department || 'N/A',
        runPeriod: run?.payrollPeriod || new Date(),
        grossSalary: payslip.totalGrossSalary || 0,
        deductions: payslip.totaDeductions || 0,
        netPay: payslip.netPay || 0,
        status: payslip.paymentStatus || 'pending',
        earnings: {
          baseSalary: payslip.earningsDetails?.baseSalary || 0,
          allowances: allowancesTotal,
          bonuses: bonusesTotal,
          benefits: benefitsTotal,
          refunds: refundsTotal,
        },
        deductionsBreakdown: {
          taxes: taxesTotal,
          insurance: insuranceTotal,
          penalties: penaltiesTotal,
        }
      };
    });
  } catch (error) {
    throw new BadRequestException(`Failed to get payslips: ${error.message}`);
  }
}

  @Get('payslips/:id')
  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  async getPayslipById(@Param('id') id: string) {
    const payslip = await this.paySlipModel
      .findById(id)
      .populate('employeeId')
      .populate('payrollRunId')
      .exec();
    
    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }
    
    return payslip;
  }

  @Patch('payroll-runs/:runId/payslips/distribute')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async distributePayslips(@Param('runId') runId: string) {
    return await this.payrollExecutionService.distributePayslips(runId);
  }

  @Post('payslips/:id/resend')
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  async resendPayslip(@Param('id') id: string) {
    // TODO: Implement email sending logic
    return {
      success: true,
      message: 'Payslip resent successfully',
      payslipId: id
    };
  }

  @Patch('payroll-runs/:runId/mark-paid')
  @Roles(SystemRole.FINANCE_STAFF)
  async markPayrollAsPaid(@Param('runId') runId: string) {
    return await this.payrollExecutionService.markPayrollAsPaid(runId);
  }

  // ============ HELPER METHODS ============
  
  private extractExceptionType(exceptionString: string): string {
    if (!exceptionString) return 'UNKNOWN';
    
    if (exceptionString.includes('MISSING_BANK_DETAILS')) return 'MISSING_BANK_DETAILS';
    if (exceptionString.includes('NEGATIVE_NET_PAY')) return 'NEGATIVE_NET_PAY';
    if (exceptionString.includes('EXCESSIVE_PENALTIES')) return 'EXCESSIVE_PENALTIES';
    if (exceptionString.includes('ZERO_BASE_SALARY')) return 'ZERO_BASE_SALARY';
    if (exceptionString.includes('CALCULATION_ERROR')) return 'CALCULATION_ERROR';
    
    return 'UNKNOWN';
  }
}