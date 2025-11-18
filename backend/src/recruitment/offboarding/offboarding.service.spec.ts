import { Test, TestingModule } from '@nestjs/testing';
import { OffboardingService } from './offboarding.service';

describe('OffboardingService', () => {
  let service: OffboardingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OffboardingService],
    }).compile();

    service = module.get<OffboardingService>(OffboardingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
