import { Module } from '@nestjs/common';

import { PayrollConfigurationService } from './payroll-configuration.service';
import { CompanyWideSettings, CompanyWideSettingsSchema } from './models/CompanyWideSettings.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { allowance, allowanceSchema } from './models/allowance.schema';
import { insuranceBrackets, insuranceBracketsSchema } from './models/insuranceBrackets.schema';
import { payrollPolicies, payrollPoliciesSchema } from './models/payrollPolicies.schema';
import { payType, payTypeSchema } from './models/payType.schema';
import { signingBonus, signingBonusSchema } from './models/signingBonus.schema';
import { taxRules, taxRulesSchema } from './models/taxRules.schema';
import { terminationAndResignationBenefits, terminationAndResignationBenefitsSchema } from './models/terminationAndResignationBenefits';
import { payGrade } from './models/payGrades.schema';
//gaurd
import { RolesGuard } from '../Common/Gaurds/roles.gaurd';
//controllers
import { PayrollPolicyController } from './Controllers/payroll-policy/payroll-policy.controller';
import { AllowanceController } from './Controllers/allowance/allowance.controller';
import { PayGradeController } from './Controllers/pay-grade/pay-grade.controller';
import {InsuranceBracketController} from "./Controllers/insurance-bracket/insurance-bracket.controller";
import { LegalRulesController } from './Controllers/legal-rules/legal-rules.controller';
import { CompanyWideSettingsController } from './Controllers/company-wide-settings/company-wide-settings.controller';
import { PayTypeController } from './Controllers/pay-type/pay-type.controller';
import { SigningBonusController } from './Controllers/signing-bonus/signing-bonus.controller';
import { TerminationResignationBenefitsController } from './Controllers/termination-resignation-benefits/termination-resignation-benefits.controller';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: allowance.name, schema: allowanceSchema },
      { name: signingBonus.name, schema: signingBonusSchema },
      { name: taxRules.name, schema: taxRulesSchema },
      { name: insuranceBrackets.name, schema: insuranceBracketsSchema },
      { name: payType.name, schema: payTypeSchema },
      { name: payrollPolicies.name, schema: payrollPoliciesSchema },
      { name: terminationAndResignationBenefits.name, schema: terminationAndResignationBenefitsSchema },
      { name: CompanyWideSettings.name, schema: CompanyWideSettingsSchema },
      { name: payGrade.name, schema: payTypeSchema }
    ]),
  ],
  controllers: [PayrollPolicyController, AllowanceController, PayGradeController, InsuranceBracketController, CompanyWideSettingsController,
    LegalRulesController, PayTypeController, SigningBonusController, TerminationResignationBenefitsController,

  ],
  providers: [PayrollConfigurationService, RolesGuard],
  exports:[PayrollConfigurationService]
})
export class PayrollConfigurationModule { }
