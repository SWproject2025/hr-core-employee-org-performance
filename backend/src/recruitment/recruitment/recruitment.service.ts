import { Injectable } from '@nestjs/common';

@Injectable()
export class RecruitmentService {
  getDummyJobs() {
    return [
      {
        id: 'JOB-001',
        title: 'Software Engineer',
        description: 'Backend-focused engineer for HR system.',
        departmentId: 'DEP-IT',
        positionId: 'POS-SE-1',
        requirements: ['NestJS', 'MongoDB', 'Git'],
        status: 'open',
      },
      {
        id: 'JOB-002',
        title: 'HR Generalist',
        description: 'Handle HR operations and employee relations.',
        departmentId: 'DEP-HR',
        positionId: 'POS-HR-1',
        requirements: ['HR background', 'Communication'],
        status: 'open',
      },
    ];
  }

  getDummyCandidates() {
    return [
      {
        id: 'CAND-001',
        fullName: 'Ali Ahmed',
        email: 'ali.ahmed@example.com',
        phone: '+201000000000',
        cvUrl: 'https://example.com/cv/ali-ahmed.pdf',
        status: 'screening',
      },
      {
        id: 'CAND-002',
        fullName: 'Sara Mohamed',
        email: 'sara.mohamed@example.com',
        phone: '+201100000000',
        cvUrl: 'https://example.com/cv/sara-mohamed.pdf',
        status: 'new',
      },
    ];
  }

  getDummyApplications() {
    return [
      {
        id: 'APP-001',
        jobId: 'JOB-001',
        candidateId: 'CAND-001',
        appliedAt: new Date('2025-11-10'),
        status: 'under-review',
      },
      {
        id: 'APP-002',
        jobId: 'JOB-001',
        candidateId: 'CAND-002',
        appliedAt: new Date('2025-11-12'),
        status: 'shortlisted',
      },
    ];
  }

  getDummyApplicationsForJob(jobId: string) {
    return this.getDummyApplications().filter((app) => app.jobId === jobId);
  }
}