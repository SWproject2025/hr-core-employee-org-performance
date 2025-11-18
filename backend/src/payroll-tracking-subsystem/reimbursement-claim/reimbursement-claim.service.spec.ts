import { Test, TestingModule } from '@nestjs/testing';
import { ReimbursementClaimService } from './reimbursement-claim.service';

describe('ReimbursementClaimService', () => {
  let service: ReimbursementClaimService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReimbursementClaimService],
    }).compile();

    service = module.get<ReimbursementClaimService>(ReimbursementClaimService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
