import { Test, TestingModule } from '@nestjs/testing';
import { LegalRulesController } from './legal-rules.controller';
import { PayrollConfigurationService } from '../../payroll-configuration.service';

describe('LegalRulesController', () => {
  let controller: LegalRulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalRulesController],
      providers: [
        {
          // We must provide the Service because the Controller requests it in the constructor
          provide: PayrollConfigurationService,
          // We use a mock value so we don't need a real database connection
          useValue: {
            updateLegalRule: jest.fn(),
            findAllLegalRules: jest.fn(),
            findOneLegalRule: jest.fn(),
            createLegalRule: jest.fn(),
            deleteLegalRule: jest.fn(),
            createTaxRules: jest.fn(),
            updateTaxRule: jest.fn(),
            deleteTaxRule: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LegalRulesController>(LegalRulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});