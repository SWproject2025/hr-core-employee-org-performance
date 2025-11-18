import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollRun, PayrollRunSchema } from './schemas/payroll-run.schema';
import { PayrollDraft, PayrollDraftSchema } from './schemas/payroll-draft.schema';
import { PayrollLineItem, PayrollLineItemSchema } from './schemas/payroll-line-item.schema';
import { PayrollApproval, PayrollApprovalSchema } from './schemas/payroll-approval.schema';
import { PayrollAdjustment, PayrollAdjustmentSchema } from './schemas/payroll-adjustment.schema';
import { PayrollException, PayrollExceptionSchema } from './schemas/payroll-exception.schema';
import { Payslip, PayslipSchema } from './schemas/payslip.schema';
import { SigningBonus, SigningBonusSchema } from './schemas/signing-bonus.schema';
import { ResignationBenefit, ResignationBenefitSchema } from './schemas/resignation-benefit.schema';
import { TerminationBenefit, TerminationBenefitSchema } from './schemas/termination-benefit.schema';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { OrganizationStructureModule } from '../organization-structure/organization-structure.module';
import { TimeMangmentModule } from '../time-mangment/time-mangment.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PayrollRun.name, schema: PayrollRunSchema },
      { name: PayrollDraft.name, schema: PayrollDraftSchema },
      { name: PayrollLineItem.name, schema: PayrollLineItemSchema },
      { name: PayrollApproval.name, schema: PayrollApprovalSchema },
      { name: PayrollAdjustment.name, schema: PayrollAdjustmentSchema },
      { name: PayrollException.name, schema: PayrollExceptionSchema },
      { name: Payslip.name, schema: PayslipSchema },
      { name: SigningBonus.name, schema: SigningBonusSchema },
      { name: ResignationBenefit.name, schema: ResignationBenefitSchema },
      { name: TerminationBenefit.name, schema: TerminationBenefitSchema },
    ]),
    EmployeeProfileModule,
    OrganizationStructureModule,
    TimeMangmentModule,
  ],
  controllers: [],
  providers: [],
  exports: [MongooseModule],
})
export class PayrollExecutionModule {}