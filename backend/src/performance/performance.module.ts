import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appraisal, AppraisalSchema } from './schemas/appraisal.schema';
import { AppraisalCycle, AppraisalCycleSchema } from './schemas/appraisal-cycle.schema';
import { AppraisalTemplate, AppraisalTemplateSchema } from './schemas/appraisal-template.schema';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appraisal.name, schema: AppraisalSchema },
      { name: AppraisalCycle.name, schema: AppraisalCycleSchema },
      { name: AppraisalTemplate.name, schema: AppraisalTemplateSchema },
    ]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [MongooseModule, PerformanceService],
})
export class PerformanceModule {}

