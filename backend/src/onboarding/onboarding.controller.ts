import { Controller, Get } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('cases')
  getOnboardingCases() {
    return this.onboardingService.getDummyOnboardingCases();
  }
}
