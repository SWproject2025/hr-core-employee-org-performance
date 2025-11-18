import { Injectable } from '@nestjs/common';

@Injectable()
export class OnboardingService {
  getDummyOnboardingCases() {
    return [
      {
        id: 'ONB-001',
        candidateId: 'CAND-001',
        employeeId: null,
        status: 'in-progress',
        startDate: new Date('2025-11-15'),
        tasks: [
          { name: 'Submit documents', status: 'done', responsibleTeam: 'HR' },
          { name: 'Create email account', status: 'pending', responsibleTeam: 'IT' },
        ],
      },
      {
        id: 'ONB-002',
        candidateId: 'CAND-002',
        employeeId: null,
        status: 'pending',
        startDate: new Date('2025-11-16'),
        tasks: [
          { name: 'Prepare workstation', status: 'pending', responsibleTeam: 'Admin' },
        ],
      },
    ];
  }
}