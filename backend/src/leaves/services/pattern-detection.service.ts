import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LeaveRequest } from '../models/leave-request.schema';
import { LeaveStatus } from '../enums/leave-status.enum';
import { EmailService } from '../../Common/email/email.service';
import { EmployeeProfileService } from '../../employee-profile/employee-profile.service';

@Injectable()
export class PatternDetectionService {
  private readonly logger = new Logger(PatternDetectionService.name);

  constructor(
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequest>,
    private emailService: EmailService,
    private employeeService: EmployeeProfileService,
  ) {}

  /**
   * Detect irregular leave patterns
   * - Frequent Mondays/Fridays
   * - Leaves adjacent to holidays (future enhancement)
   */
  async detectIrregularPatterns(): Promise<void> {
    this.logger.log('Starting irregular pattern detection...');
    
    // Look back 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const requests = await this.leaveRequestModel.find({
      status: LeaveStatus.APPROVED,
      'dates.from': { $gte: threeMonthsAgo },
    }).populate('employeeId');

    // Group by employee
    const employeeRequests: Record<string, any[]> = {};
    requests.forEach(req => {
      const empId = (req.employeeId as any)._id.toString();
      if (!employeeRequests[empId]) employeeRequests[empId] = [];
      employeeRequests[empId].push(req);
    });

    // Analyze each employee
    for (const empId in employeeRequests) {
      await this.analyzeEmployeePattern(empId, employeeRequests[empId]);
    }
  }

  private async analyzeEmployeePattern(employeeId: string, requests: any[]) {
    let mondayFridayCount = 0;

    for (const req of requests) {
      const from = new Date(req.dates.from);
      const to = new Date(req.dates.to);
      
      // extensive check for every day in the leave
      const current = new Date(from);
      while (current <= to) {
        const day = current.getDay();
        if (day === 1 || day === 5) { // Monday or Friday
            mondayFridayCount++;
        }
        current.setDate(current.getDate() + 1);
      }
    }

    // Threshold: e.g., > 5 Mondays/Fridays in 3 months
    if (mondayFridayCount > 5) {
       this.logger.warn(`Irregular Pattern Detected: Employee ${employeeId} has taken ${mondayFridayCount} Mondays/Fridays off in last 3 months.`);
       // Notify Manager (Optional, implementation depends on EmailService capabilities)
       // this.notifyManager(employeeId, mondayFridayCount);
    }
  }
}
