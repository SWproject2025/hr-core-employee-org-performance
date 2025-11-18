import { Test, TestingModule } from '@nestjs/testing';
import { PayrollDisputeService } from './payroll-dispute.service';

describe('PayrollDisputeService', () => {
  let service: PayrollDisputeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollDisputeService],
    }).compile();

    service = module.get<PayrollDisputeService>(PayrollDisputeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
