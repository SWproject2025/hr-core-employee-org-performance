import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Appraisal } from './schemas/appraisal.schema';
import { AppraisalCycle } from './schemas/appraisal-cycle.schema';
import { AppraisalTemplate } from './schemas/appraisal-template.schema';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectModel(Appraisal.name) private appraisalModel: Model<Appraisal>,
    @InjectModel(AppraisalCycle.name) private cycleModel: Model<AppraisalCycle>,
    @InjectModel(AppraisalTemplate.name) private templateModel: Model<AppraisalTemplate>,
  ) {}
}

