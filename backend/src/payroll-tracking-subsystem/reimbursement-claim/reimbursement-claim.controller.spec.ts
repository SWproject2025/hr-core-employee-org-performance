import { Test, TestingModule } from '@nestjs/testing';
import { ReimbursementClaimController } from './reimbursement-claim.controller';
import { ReimbursementClaimService } from './reimbursement-claim.service';

describe('ReimbursementClaimController', () => {
  let controller: ReimbursementClaimController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReimbursementClaimController],
      providers: [ReimbursementClaimService],
    }).compile();

    controller = module.get<ReimbursementClaimController>(ReimbursementClaimController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
