// payroll-execution.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollExecutionController } from './payroll-execution.controller';
import { PayrollExecutionService } from './payroll-execution.service';
import { CalcDraftModule } from './calc-draft/calc-draft.module'; // ✅ Import the module

// Import schemas
import { employeeSigningBonusSchema } from './models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignationSchema } from './models/EmployeeTerminationResignation.schema';
import { payrollRunsSchema } from './models/payrollRuns.schema';
import { employeePayrollDetailsSchema } from './models/employeePayrollDetails.schema';
import { employeePenaltiesSchema } from './models/employeePenalties.schema';
import { paySlipSchema } from './models/payslip.schema';
import { EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'employeeSigningBonus', schema: employeeSigningBonusSchema },
      { name: 'EmployeeTerminationResignation', schema: EmployeeTerminationResignationSchema },
      { name: 'payrollRuns', schema: payrollRunsSchema },
      { name: 'employeePayrollDetails', schema: employeePayrollDetailsSchema },
      { name: 'employeePenalties', schema: employeePenaltiesSchema },
      { name: 'paySlip', schema: paySlipSchema },
      { name: 'EmployeeProfile', schema: EmployeeProfileSchema },
    ]),
    CalcDraftModule, // ✅ Import CalcDraftModule (make sure it exports CalcDraftService)
  ],
  controllers: [PayrollExecutionController],
  providers: [PayrollExecutionService], // ✅ Remove CalcDraftService from here
  exports: [PayrollExecutionService],
})
export class PayrollExecutionModule {}