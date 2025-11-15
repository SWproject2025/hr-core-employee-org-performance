import { Test, TestingModule } from '@nestjs/testing';
import { OffboardingController } from './offboarding.controller';

describe('OffboardingController', () => {
  let controller: OffboardingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OffboardingController],
    }).compile();

    controller = module.get<OffboardingController>(OffboardingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
