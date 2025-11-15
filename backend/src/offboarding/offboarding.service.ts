import { Injectable } from '@nestjs/common';

@Injectable()
export class OffboardingService {
  getDummyOffboardingCases() {
    return [
      {
        id: 'OFF-001',
        employeeId: 'EMP-001',
        exitType: 'resignation',
        status: 'in-progress',
        tasks: [
          { name: 'Revoke system access', status: 'pending', responsibleTeam: 'IT' },
          { name: 'Collect company assets', status: 'pending', responsibleTeam: 'Admin' },
          { name: 'Finalize payroll settlement', status: 'pending', responsibleTeam: 'Payroll' },
        ],
      },
    ];
  }
}
