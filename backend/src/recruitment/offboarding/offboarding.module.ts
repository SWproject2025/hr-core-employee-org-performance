import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OffboardingController } from './offboarding.controller';
import { OffboardingService } from './offboarding.service';
import {
  OffboardingCase,
  OffboardingCaseSchema,
} from './schemas/offboarding-case.schema';
import {
  OffboardingTask,
  OffboardingTaskSchema,
} from './schemas/offboarding-task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OffboardingCase.name, schema: OffboardingCaseSchema },
      { name: OffboardingTask.name, schema: OffboardingTaskSchema },
    ]),
  ],
  controllers: [OffboardingController],
  providers: [OffboardingService],
  exports: [OffboardingService],
})
export class OffboardingModule {}
