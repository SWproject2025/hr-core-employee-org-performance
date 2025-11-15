import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { Job, JobSchema } from './schemas/job.schema';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { Application, ApplicationSchema } from './schemas/application.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: Application.name, schema: ApplicationSchema },
    ]),
  ],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
