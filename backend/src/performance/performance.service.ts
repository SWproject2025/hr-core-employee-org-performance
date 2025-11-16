// src/performance/performance.service.ts (Partial - showing new method)
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Import the new DTO and schemas
import { SubmitManagerRatingDto, RatingDto } from './dto/submit-manager-rating.dto';
import { Appraisal, Rating } from './schemas/appraisal.schema';
import { AppraisalCycle, CycleStatus } from './schemas/appraisal-cycle.schema';
import { EmployeeProfile } from '../employee-profile/schemas/employee-profile.schema';
import { EmployeeProfileService } from '../employee-profile/employee-profile.service';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(Appraisal.name) private appraisalModel: Model<Appraisal>,
    @InjectModel(AppraisalCycle.name) private cycleModel: Model<AppraisalCycle>,
    
    // Inject the EmployeeProfileService to update history (BR 16)
    private readonly profileService: EmployeeProfileService,
  ) {}

  /**
   * (Phase 2)
   * Manager submits their ratings for an appraisal.
   */
  async submitManagerRating(
    appraisalId: string,
    managerProfileId: string, // Get this from the logged-in user
    dto: SubmitManagerRatingDto,
  ): Promise<Appraisal> {

    const appraisal = await this.appraisalModel.findById(appraisalId);

    if (!appraisal) {
      throw new NotFoundException('Appraisal not found.');
    }
    
    // Security check: Is this manager the correct one?
    if (appraisal.manager.toString() !== managerProfileId) {
      throw new ForbiddenException('You are not authorized to rate this employee.');
    }
    
    // Logic check: Can this appraisal still be edited?
    if (appraisal.status !== 'Pending Manager') {
      throw new ForbiddenException(`Appraisal status is already "${appraisal.status}".`);
    }

    // --- APPLY THE NEW DATA ---
    // Convert DTO ratings to schema ratings, ensuring comment is always a string
    appraisal.ratings = dto.ratings.map((rating): Rating => ({
      section: rating.section,
      score: rating.score,
      comment: rating.comment ?? '',
    }));
    
    // Calculate final score
    appraisal.finalScore = this.calculateFinalScore(dto.ratings);
    
    // Move to the next step in the workflow
    appraisal.status = 'Pending HR Publish';

    return appraisal.save();
  }

  /**
   * (Phase 3)
   * HR publishes the final rating to the employee.
   * This is where the cross-module call to EmployeeProfileService happens.
   */
  async publishAppraisal(appraisalId: string): Promise<Appraisal> {
    const appraisal = await this.appraisalModel.findById(appraisalId)
      .populate('cycle'); // Need cycle info for the history

    if (!appraisal || appraisal.status !== 'Pending HR Publish') {
      throw new NotFoundException('Appraisal not ready for publishing.');
    }

    appraisal.status = 'Published'; // Or 'Closed' if no dispute phase

    // --- CROSS-MODULE CALL (BR 16) ---
    // Get the cycle name (e.g., "Annual Review 2025")
    const cycleName = (appraisal.cycle as any)?.name || 'Appraisal';
    
    await this.profileService.addAppraisalRecord(appraisal.employee, {
      date: new Date(),
      type: cycleName,
      score: appraisal.finalScore,
    });
    // --- END CROSS-MODULE CALL ---

    return appraisal.save();
  }
  
  /**
   * Helper function to average scores.
   * You can make this logic as complex as you need.
   */
  private calculateFinalScore(ratings: RatingDto[]): number {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return sum / ratings.length;
  }
  
  /**
   * Example of how the new 'status' on AppraisalCycle simplifies queries.
   */
  async getActiveCycle(): Promise<AppraisalCycle | null> {
    // No more complex date logic!
    return this.cycleModel.findOne({ status: CycleStatus.ACTIVE }).exec();
  }
}