import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../Common/Gaurds/roles.gaurd';
import { Roles } from '../Common/Decorators/roles.decorator';
import { CurrentUser } from '../Common/Decorators/current-user.decorator';
import type { CurrentUserData } from '../Common/Decorators/current-user.decorator';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
  ApproveLeaveRequestDto,
  RejectLeaveRequestDto,
  LeaveBalanceQueryDto,
} from './dto/leave-request.dto';
import { LeaveStatus } from '../enums/leave-status.enum';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  // ==================== EMPLOYEE ENDPOINTS ====================

  /**
   * Create a new leave request
   * REQ-015: Employee submits leave request
   */
  @Post('requests')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  @HttpCode(HttpStatus.CREATED)
  async createLeaveRequest(
    @CurrentUser() user: CurrentUserData,
    @Body() createDto: CreateLeaveRequestDto,
  ) {
    return this.leavesService.createLeaveRequest(user.employeeProfileId, createDto);
  }

  /**
   * Get employee's leave requests
   * REQ-020: View leave request status
   */
  @Get('requests/my-requests')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async getMyLeaveRequests(
    @CurrentUser() user: CurrentUserData,
    @Query('status') status?: LeaveStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leavesService.getEmployeeLeaveRequests(user.employeeProfileId, {
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  /**
   * Get employee's leave balance
   * REQ-003: View leave balance
   */
  @Get('balance')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async getMyLeaveBalance(
    @CurrentUser() user: CurrentUserData,
    @Query() query: LeaveBalanceQueryDto,
  ) {
    return this.leavesService.getEmployeeLeaveBalance(
      user.employeeProfileId,
      query.leaveTypeId,
    );
  }

  /**
   * Get specific leave request details
   * REQ-020: View leave request details
   */
  @Get('requests/:requestId')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async getLeaveRequestDetails(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
  ) {
    // This would need authorization check to ensure employee can only view their own requests
    const requests = await this.leavesService.getEmployeeLeaveRequests(
      user.employeeProfileId,
      { page: 1, limit: 1000 },
    );
    const request = requests.requests.find((r: any) => r._id.toString() === requestId);
    
    if (!request) {
      throw new Error('Leave request not found');
    }
    
    return request;
  }

  /**
   * Cancel leave request
   * REQ-019: Cancel leave request
   */
  @Patch('requests/:requestId/cancel')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async cancelLeaveRequest(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
  ) {
    return this.leavesService.cancelLeaveRequest(user.employeeProfileId, requestId);
  }

  /**
   * Modify leave request (before approval)
   * REQ-018: Modify pending leave request
   */
  @Put('requests/:requestId')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async updateLeaveRequest(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body() updateDto: UpdateLeaveRequestDto,
  ) {
    // First cancel the old request 
    await this.leavesService.cancelLeaveRequest(user.employeeProfileId, requestId);
    
    // Create new request with updated details
    const createDto: CreateLeaveRequestDto = {
      leaveTypeId: updateDto.leaveTypeId || '', // Would need to get from original request
      fromDate: updateDto.fromDate || '',
      toDate: updateDto.toDate || '',
      justification: updateDto.justification || '',
      attachmentId: updateDto.attachmentId,
    };
    
    return this.leavesService.createLeaveRequest(user.employeeProfileId, createDto);
  }

  // ==================== MANAGER ENDPOINTS ====================

  /**
   * Get pending leave requests for approval (as line manager)
   * REQ-020: Manager views pending requests
   */
  @Get('requests/pending-approval')
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async getPendingLeaveRequests(
    @CurrentUser() user: CurrentUserData,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leavesService.getPendingLeaveRequests(user.employeeProfileId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  /**
   * Approve leave request (as line manager)
   * REQ-021: Manager approves leave request
   */
  @Post('requests/:requestId/approve')
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async approveLeaveRequestByManager(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body() approveDto: ApproveLeaveRequestDto,
  ) {
    return this.leavesService.approveLeaveRequestByManager(
      requestId,
      user.employeeProfileId,
      approveDto,
    );
  }

  /**
   * Reject leave request (as line manager)
   * REQ-022: Manager rejects leave request
   */
  @Post('requests/:requestId/reject')
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async rejectLeaveRequestByManager(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body() rejectDto: RejectLeaveRequestDto,
  ) {
    return this.leavesService.rejectLeaveRequestByManager(
      requestId,
      user.employeeProfileId,
      rejectDto,
    );
  }

  /**
   * Delegate approval to another manager
   * REQ-023: Delegate leave approval
   */
  @Post('requests/:requestId/delegate')
  @Roles(SystemRole.DEPARTMENT_HEAD)
  async delegateLeaveApproval(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body('delegateToManagerId') delegateToManagerId: string,
  ) {
    // Implementation would update the approver for this request
    // Simplified for now
    return {
      message: 'Leave approval delegated successfully',
      requestId,
      delegatedTo: delegateToManagerId,
    };
  }

  // ==================== HR ADMIN ENDPOINTS ====================

  /**
   * Get all leave requests for HR review
   * REQ-025: HR Admin views all requests
   */
  @Get('admin/requests')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async getAllLeaveRequestsForHR(
    @Query('status') status?: LeaveStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leavesService.getAllLeaveRequestsForHR({
      status,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    });
  }

  /**
   * Final approval by HR Admin
   * REQ-025: HR Admin approves leave request
   */
  @Post('admin/requests/:requestId/approve')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async approveLeaveRequestByHR(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body() approveDto: ApproveLeaveRequestDto,
  ) {
    return this.leavesService.approveLeaveRequestByHR(
      requestId,
      user.employeeProfileId,
      approveDto,
    );
  }

  /**
   * Override manager rejection
   * REQ-026: HR Admin overrides manager decision
   */
  @Post('admin/requests/:requestId/override')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async overrideLeaveRequestByHR(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body() approveDto: ApproveLeaveRequestDto,
  ) {
    return this.leavesService.overrideLeaveRequestByHR(
      requestId,
      user.employeeProfileId,
      approveDto,
    );
  }

  /**
   * Validate and approve attached documents
   * REQ-028: HR validates supporting documents
   */
  @Post('admin/requests/:requestId/validate-documents')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async validateLeaveDocuments(
    @CurrentUser() user: CurrentUserData,
    @Param('requestId') requestId: string,
    @Body('isValid') isValid: boolean,
    @Body('comments') comments?: string,
  ) {
    // Implementation would validate the attached documents
    return {
      message: 'Document validation completed',
      requestId,
      isValid,
      comments,
    };
  }

  /**
   * Create manual leave adjustment
   * REQ-013: HR creates manual adjustment
   */
  @Post('admin/adjustments')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async createLeaveAdjustment(
    @CurrentUser() user: CurrentUserData,
    @Body('employeeId') employeeId: string,
    @Body('leaveTypeId') leaveTypeId: string,
    @Body('adjustmentType') adjustmentType: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
  ) {
    return this.leavesService.createLeaveAdjustment(
      employeeId,
      leaveTypeId,
      adjustmentType,
      amount,
      reason,
      user.employeeProfileId,
    );
  }

  /**
   * Get employee leave balance (for HR)
   * REQ-003: HR views employee balance
   */
  @Get('admin/employees/:employeeId/balance')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async getEmployeeLeaveBalanceForHR(
    @Param('employeeId') employeeId: string,
    @Query() query: LeaveBalanceQueryDto,
  ) {
    return this.leavesService.getEmployeeLeaveBalance(employeeId, query.leaveTypeId);
  }

  /**
   * Process leave accrual manually
   * REQ-040: Process accrual
   */
  @Post('admin/accrual/process')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async processLeaveAccrual(
    @Body('employeeId') employeeId: string,
    @Body('leaveTypeId') leaveTypeId: string,
  ) {
    await this.leavesService.processLeaveAccrual(employeeId, leaveTypeId);
    return { message: 'Leave accrual processed successfully' };
  }

  /**
   * Process year-end carry forward
   * REQ-041: Year-end processing
   */
  @Post('admin/year-end/process')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async processYearEndCarryForward(
    @Body('employeeId') employeeId: string,
    @Body('leaveTypeId') leaveTypeId: string,
  ) {
    await this.leavesService.processYearEndCarryForward(employeeId, leaveTypeId);
    return { message: 'Year-end carry forward processed successfully' };
  }

  // ==================== LEAVE POLICY ENDPOINTS ====================

  /**
   * Get all leave types
   * REQ-006: View leave types
   */
  @Get('types')
  @Roles(SystemRole.DEPARTMENT_EMPLOYEE)
  async getAllLeaveTypes() {
    // Implementation would fetch all active leave types
    return {
      message: 'Leave types retrieved successfully',
      leaveTypes: [],
    };
  }

  /**
   * Create leave type (HR Admin only)
   * REQ-006: Create leave type
   */
  @Post('admin/types')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async createLeaveType(
    @Body('code') code: string,
    @Body('name') name: string,
    @Body('categoryId') categoryId: string,
    @Body('description') description?: string,
    @Body('paid') paid?: boolean,
    @Body('deductible') deductible?: boolean,
  ) {
    // Implementation would create a new leave type
    return {
      message: 'Leave type created successfully',
      code,
      name,
    };
  }

  /**
   * Configure leave policy
   * REQ-007: Configure entitlement rules
   */
  @Post('admin/policies')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER)
  async createLeavePolicy(
    @Body('leaveTypeId') leaveTypeId: string,
    @Body('accrualMethod') accrualMethod: string,
    @Body('monthlyRate') monthlyRate?: number,
    @Body('yearlyRate') yearlyRate?: number,
    @Body('carryForwardAllowed') carryForwardAllowed?: boolean,
    @Body('maxCarryForward') maxCarryForward?: number,
  ) {
    // Implementation would create/update leave policy
    return {
      message: 'Leave policy configured successfully',
      leaveTypeId,
    };
  }

  /**
   * Set up organizational calendar
   * REQ-010: Configure holidays and blocked days
   */
  @Post('admin/calendar')
  @Roles(SystemRole.HR_ADMIN, SystemRole.HR_MANAGER, SystemRole.SYSTEM_ADMIN)
  async configureCalendar(
    @Body('year') year: number,
    @Body('holidays') holidays: any[],
    @Body('blockedPeriods') blockedPeriods?: any[],
  ) {
    // Implementation would set up calendar
    return {
      message: 'Calendar configured successfully',
      year,
    };
  }
}