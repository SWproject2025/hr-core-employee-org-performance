import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  LeaveRequest,
  LeaveRequestDocument,
} from './models/leave-request.schema'; // Ensure this file exists and is correctly exported
// If the file does not exist, create it or correct the import path.
import { LeaveType, LeaveTypeDocument } from './models/leave-type.schema';
import {
  LeaveEntitlement,
  LeaveEntitlementDocument,
} from './models/leave-entitlement.schema';
import { LeavePolicy, LeavePolicyDocument } from './models/leave-policy.schema';
import {
  LeaveAdjustment,
  LeaveAdjustmentDocument,
} from './models/leave-adjustment.schema';
import { Calendar, CalendarDocument } from './models/calendar.schema';
import { LeaveStatus } from './enums/leave-status.enum'; // Adjusted path to the correct location
import { AccrualMethod } from './enums/accrual-method.enum'; // Adjust the path if necessary
import {
  CreateLeaveRequestDto,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  UpdateLeaveRequestDto,
  ApproveLeaveRequestDto,
  RejectLeaveRequestDto,
} from './dto/leave-request.dto';

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveTypeDocument>,
    @InjectModel(LeaveEntitlement.name)
    private leaveEntitlementModel: Model<LeaveEntitlementDocument>,
    @InjectModel(LeavePolicy.name)
    private leavePolicyModel: Model<LeavePolicyDocument>,
    @InjectModel(LeaveAdjustment.name)
    private leaveAdjustmentModel: Model<LeaveAdjustmentDocument>,
    @InjectModel(Calendar.name)
    private calendarModel: Model<CalendarDocument>,
  ) {}

  // ==================== EMPLOYEE SERVICES ====================

  /**
   * Create leave request (REQ-015)
   */
  async createLeaveRequest(employeeId: string, createDto: CreateLeaveRequestDto) {
    // Validate leave type
    const leaveType = await this.leaveTypeModel.findById(createDto.leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Calculate duration
    const fromDate = new Date(createDto.fromDate);
    const toDate = new Date(createDto.toDate);
    const durationDays = await this.calculateLeaveDuration(fromDate, toDate);

    if (durationDays <= 0) {
      throw new BadRequestException('Invalid date range');
    }

    // Check eligibility (BR 8)
    await this.checkLeaveEligibility(employeeId, createDto.leaveTypeId);

    // Check balance (BR 31)
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(createDto.leaveTypeId),
    });

    if (!entitlement) {
      throw new BadRequestException('No leave entitlement found for this leave type');
    }

    // Check if sufficient balance
    const availableBalance = entitlement.remaining - entitlement.pending;
    if (durationDays > availableBalance) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${availableBalance} days, Requested: ${durationDays} days`
      );
    }

    // Check for overlapping leave requests (BR 28)
    await this.checkOverlappingLeaves(employeeId, fromDate, toDate);

    // Create leave request
    const leaveRequest = new this.leaveRequestModel({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(createDto.leaveTypeId),
      dates: { from: fromDate, to: toDate },
      durationDays,
      justification: createDto.justification,
      attachmentId: createDto.attachmentId ? new Types.ObjectId(createDto.attachmentId) : undefined,
      status: LeaveStatus.PENDING,
      approvalFlow: [
        {
          role: 'line_manager',
          status: LeaveStatus.PENDING,
        },
      ],
    });

    const savedRequest = await leaveRequest.save();

    // Update pending balance
    entitlement.pending += durationDays;
    await entitlement.save();

    return savedRequest.populate([
      { path: 'leaveTypeId', select: 'code name' },
      { path: 'employeeId', select: 'employeeNumber firstName lastName' },
    ]);
  }

  /**
   * Get leave requests for employee (REQ-020)
   */
  async getEmployeeLeaveRequests(employeeId: string, filters?: { status?: LeaveStatus; page?: number; limit?: number }) {
    const { status, page = 1, limit = 10 } = filters || {};
    const query: any = { employeeId: new Types.ObjectId(employeeId) };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.leaveRequestModel
        .find(query)
        .populate('leaveTypeId', 'code name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.leaveRequestModel.countDocuments(query),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get leave balance for employee (REQ-003)
   */
  async getEmployeeLeaveBalance(employeeId: string, leaveTypeId?: string) {
    const query: any = { employeeId: new Types.ObjectId(employeeId) };
    if (leaveTypeId) {
      query.leaveTypeId = new Types.ObjectId(leaveTypeId);
    }

    const entitlements = await this.leaveEntitlementModel
      .find(query)
      .populate('leaveTypeId', 'code name paid deductible')
      .lean();

    return entitlements.map((ent) => ({
      leaveType: ent.leaveTypeId,
      yearlyEntitlement: ent.yearlyEntitlement,
      accruedActual: ent.accruedActual,
      accruedRounded: ent.accruedRounded,
      carryForward: ent.carryForward,
      taken: ent.taken,
      pending: ent.pending,
      remaining: ent.remaining,
      lastAccrualDate: ent.lastAccrualDate,
      nextResetDate: ent.nextResetDate,
    }));
  }

  /**
   * Cancel leave request (REQ-019)
   */
  async cancelLeaveRequest(employeeId: string, requestId: string) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.employeeId.toString() !== employeeId) {
      throw new ForbiddenException('You can only cancel your own leave requests');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel leave request with status: ${request.status}`);
    }

    // Update request status
    request.status = LeaveStatus.CANCELLED;
    await request.save();

    // Update pending balance
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: request.leaveTypeId,
    });

    if (entitlement) {
      entitlement.pending -= request.durationDays;
      await entitlement.save();
    }

    return request;
  }

  // ==================== MANAGER SERVICES ====================

  /**
   * Get pending leave requests for approval (REQ-020)
   */
  async getPendingLeaveRequests(managerId: string, filters?: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = filters || {};

    // Get employees reporting to this manager
    // This would typically come from organization structure
    // For now, we'll get all pending requests (simplified)
    const query = {
      status: LeaveStatus.PENDING,
      'approvalFlow.role': 'line_manager',
      'approvalFlow.status': LeaveStatus.PENDING,
    };

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.leaveRequestModel
        .find(query)
        .populate('leaveTypeId', 'code name')
        .populate('employeeId', 'employeeNumber firstName lastName')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.leaveRequestModel.countDocuments(query),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve leave request by manager (REQ-021)
   */
  async approveLeaveRequestByManager(requestId: string, managerId: string, approveDto: ApproveLeaveRequestDto) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Cannot approve request with status: ${request.status}`);
    }

    // Update approval flow
    const managerApproval = request.approvalFlow.find((flow) => flow.role === 'line_manager');
    if (managerApproval) {
      managerApproval.status = LeaveStatus.APPROVED;
      managerApproval.decidedBy = new Types.ObjectId(managerId);
      managerApproval.decidedAt = new Date();
    }

    // Add HR approval step
    request.approvalFlow.push({
      role: 'hr_admin',
      status: LeaveStatus.PENDING,
    });

    await request.save();

    return request.populate([
      { path: 'leaveTypeId', select: 'code name' },
      { path: 'employeeId', select: 'employeeNumber firstName lastName' },
    ]);
  }

  /**
   * Reject leave request by manager (REQ-022)
   */
  async rejectLeaveRequestByManager(requestId: string, managerId: string, rejectDto: RejectLeaveRequestDto) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException(`Cannot reject request with status: ${request.status}`);
    }

    // Update status
    request.status = LeaveStatus.REJECTED;

    // Update approval flow
    const managerApproval = request.approvalFlow.find((flow) => flow.role === 'line_manager');
    if (managerApproval) {
      managerApproval.status = LeaveStatus.REJECTED;
      managerApproval.decidedBy = new Types.ObjectId(managerId);
      managerApproval.decidedAt = new Date();
    }

    await request.save();

    // Update pending balance
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
    });

    if (entitlement) {
      entitlement.pending -= request.durationDays;
      await entitlement.save();
    }

    return request;
  }

  // ==================== HR ADMIN SERVICES ====================

  /**
   * Get all leave requests for HR review (REQ-025)
   */
  async getAllLeaveRequestsForHR(filters?: { status?: LeaveStatus; page?: number; limit?: number }) {
    const { status, page = 1, limit = 10 } = filters || {};
    const query: any = {};

    if (status) {
      query.status = status;
    } else {
      // Default to requests needing HR approval
      query['approvalFlow.role'] = 'hr_admin';
      query['approvalFlow.status'] = LeaveStatus.PENDING;
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.leaveRequestModel
        .find(query)
        .populate('leaveTypeId', 'code name')
        .populate('employeeId', 'employeeNumber firstName lastName')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.leaveRequestModel.countDocuments(query),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Final approval by HR Admin (REQ-025)
   */
  async approveLeaveRequestByHR(requestId: string, hrAdminId: string, approveDto: ApproveLeaveRequestDto) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    // Check if manager approved
    const managerApproval = request.approvalFlow.find((flow) => flow.role === 'line_manager');
    if (!managerApproval || managerApproval.status !== LeaveStatus.APPROVED) {
      throw new BadRequestException('Leave request must be approved by manager first');
    }

    // Update approval flow
    const hrApproval = request.approvalFlow.find((flow) => flow.role === 'hr_admin');
    if (hrApproval) {
      hrApproval.status = LeaveStatus.APPROVED;
      hrApproval.decidedBy = new Types.ObjectId(hrAdminId);
      hrApproval.decidedAt = new Date();
    }

    // Final approval
    request.status = LeaveStatus.APPROVED;
    await request.save();

    // Update leave balance (REQ-029)
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
    });

    if (entitlement) {
      entitlement.pending -= request.durationDays;
      entitlement.taken += request.durationDays;
      entitlement.remaining = entitlement.accruedRounded + entitlement.carryForward - entitlement.taken;
      await entitlement.save();
    }

    // TODO: Sync with Time Management module (REQ-042)
    // TODO: Sync with Payroll module (REQ-042)

    return request.populate([
      { path: 'leaveTypeId', select: 'code name' },
      { path: 'employeeId', select: 'employeeNumber firstName lastName' },
    ]);
  }

  /**
   * Override rejection by HR Admin (REQ-026)
   */
  async overrideLeaveRequestByHR(requestId: string, hrAdminId: string, approveDto: ApproveLeaveRequestDto) {
    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    // HR can override manager rejection
    request.status = LeaveStatus.APPROVED;

    // Update all approval flows to approved
    request.approvalFlow.forEach((flow) => {
      flow.status = LeaveStatus.APPROVED;
      if (flow.role === 'hr_admin') {
        flow.decidedBy = new Types.ObjectId(hrAdminId);
        flow.decidedAt = new Date();
      }
    });

    await request.save();

    // Update leave balance
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: request.employeeId,
      leaveTypeId: request.leaveTypeId,
    });

    if (entitlement) {
      entitlement.pending -= request.durationDays;
      entitlement.taken += request.durationDays;
      entitlement.remaining = entitlement.accruedRounded + entitlement.carryForward - entitlement.taken;
      await entitlement.save();
    }

    return request;
  }

  /**
   * Create manual leave adjustment (REQ-013)
   */
  async createLeaveAdjustment(
    employeeId: string,
    leaveTypeId: string,
    adjustmentType: string,
    amount: number,
    reason: string,
    hrUserId: string,
  ) {
    const adjustment = new this.leaveAdjustmentModel({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
      adjustmentType,
      amount,
      reason,
      hrUserId: new Types.ObjectId(hrUserId),
    });

    await adjustment.save();

    // Update entitlement
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
    });

    if (entitlement) {
      if (adjustmentType === 'ADD') {
        entitlement.yearlyEntitlement += amount;
        entitlement.remaining += amount;
      } else if (adjustmentType === 'DEDUCT') {
        entitlement.yearlyEntitlement -= amount;
        entitlement.remaining -= amount;
      }
      await entitlement.save();
    }

    return adjustment;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate leave duration excluding weekends and holidays (BR 23)
   */
  private async calculateLeaveDuration(fromDate: Date, toDate: Date): Promise<number> {
    let duration = 0;
    const currentDate = new Date(fromDate);

    // Get holidays for the period
    const holidays = await this.calendarModel.find({
      'holidays': {
        $exists: true,
      },
    }).lean();

    const holidayDates = new Set<string>();
    holidays.forEach((calendar) => {
      // Extract holiday dates (simplified)
      // In production, you'd properly parse the holiday dates
    });

    while (currentDate <= toDate) {
      const dayOfWeek = currentDate.getDay();
      const dateString = currentDate.toISOString().split('T')[0];

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Skip holidays
        if (!holidayDates.has(dateString)) {
          duration++;
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return duration;
  }

  /**
   * Check leave eligibility (BR 8)
   */
  private async checkLeaveEligibility(employeeId: string, leaveTypeId: string): Promise<void> {
    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Check minimum tenure if required
    if (leaveType.minTenureMonths) {
      // This would check employee's hire date vs current date
      // Simplified for now
    }

    // Check other eligibility criteria based on leave policy
    const policy = await this.leavePolicyModel.findOne({ leaveTypeId: new Types.ObjectId(leaveTypeId) });
    if (policy?.eligibility) {
      // Validate eligibility criteria
      // Simplified for now
    }
  }

  /**
   * Check for overlapping leave requests (BR 28)
   */
  private async checkOverlappingLeaves(employeeId: string, fromDate: Date, toDate: Date): Promise<void> {
    const overlapping = await this.leaveRequestModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      $or: [
        {
          'dates.from': { $lte: toDate },
          'dates.to': { $gte: fromDate },
        },
      ],
    });

    if (overlapping) {
      throw new BadRequestException('Leave request overlaps with existing leave');
    }
  }

  /**
   * Process leave accrual (REQ-040)
   */
  async processLeaveAccrual(employeeId: string, leaveTypeId: string): Promise<void> {
    const policy = await this.leavePolicyModel.findOne({ leaveTypeId: new Types.ObjectId(leaveTypeId) });
    if (!policy) {
      return;
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
    });

    if (!entitlement) {
      return;
    }

    // Calculate accrual based on method
    let accrualAmount = 0;
    if (policy.accrualMethod === AccrualMethod.MONTHLY) {
      accrualAmount = policy.monthlyRate;
    } else if (policy.accrualMethod === AccrualMethod.YEARLY) {
      accrualAmount = policy.yearlyRate / 12; // Monthly equivalent
    }

    // Update entitlement
    entitlement.accruedActual += accrualAmount;
    entitlement.accruedRounded = Math.floor(entitlement.accruedActual); // Apply rounding rule
    entitlement.remaining = entitlement.accruedRounded + entitlement.carryForward - entitlement.taken;
    entitlement.lastAccrualDate = new Date();

    await entitlement.save();
  }

  /**
   * Process year-end carry forward (REQ-041)
   */
  async processYearEndCarryForward(employeeId: string, leaveTypeId: string): Promise<void> {
    const policy = await this.leavePolicyModel.findOne({ leaveTypeId: new Types.ObjectId(leaveTypeId) });
    if (!policy || !policy.carryForwardAllowed) {
      return;
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
    });

    if (!entitlement) {
      return;
    }

    // Calculate carry forward amount
    let carryForwardAmount = entitlement.remaining;
    
    // Apply max carry forward cap (e.g., 45 days)
    if (policy.maxCarryForward > 0) {
      carryForwardAmount = Math.min(carryForwardAmount, policy.maxCarryForward);
    }

    // Reset for new year
    entitlement.carryForward = carryForwardAmount;
    entitlement.accruedActual = 0;
    entitlement.accruedRounded = 0;
    entitlement.taken = 0;
    entitlement.pending = 0;
    entitlement.remaining = carryForwardAmount;
    entitlement.nextResetDate = new Date(new Date().getFullYear() + 1, 0, 1); // Next year Jan 1

    await entitlement.save();
  }
}


