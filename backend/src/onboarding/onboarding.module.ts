import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import {
  OnboardingCase,
  OnboardingCaseSchema,
} from './schemas/onboarding-case.schema';
import {
  OnboardingTask,
  OnboardingTaskSchema,
} from './schemas/onboarding-task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnboardingCase.name, schema: OnboardingCaseSchema },
      { name: OnboardingTask.name, schema: OnboardingTaskSchema },
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}