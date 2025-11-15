import { Controller, Get, Param } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private readonly recruitmentService: RecruitmentService) {}

  @Get('jobs')
  getJobs() {
    return this.recruitmentService.getDummyJobs();
  }

  @Get('candidates')
  getCandidates() {
    return this.recruitmentService.getDummyCandidates();
  }

  @Get('applications')
  getApplications() {
    return this.recruitmentService.getDummyApplications();
  }

  @Get('applications/job/:jobId')
  getApplicationsForJob(@Param('jobId') jobId: string) {
    return this.recruitmentService.getDummyApplicationsForJob(jobId);
  }
}
