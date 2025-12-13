import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollExecutionController } from './payroll-execution.controller';
import { PayrollExecutionService } from './payroll-execution.service';
import { CalcDraftService } from './calc-draft/calc-draft.service'; // ✅ Import CalcDraftService

// Import schemas
import { employeeSigningBonus, employeeSigningBonusSchema } from './models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation, EmployeeTerminationResignationSchema } from './models/EmployeeTerminationResignation.schema';
import { payrollRuns, payrollRunsSchema } from './models/payrollRuns.schema';
import { employeePayrollDetails, employeePayrollDetailsSchema } from './models/employeePayrollDetails.schema';
import { employeePenalties, employeePenaltiesSchema } from './models/employeePenalties.schema';
import { paySlip, paySlipSchema } from './models/payslip.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: employeeSigningBonus.name, schema: employeeSigningBonusSchema },
      { name: EmployeeTerminationResignation.name, schema: EmployeeTerminationResignationSchema },
      { name: payrollRuns.name, schema: payrollRunsSchema },
      { name: employeePayrollDetails.name, schema: employeePayrollDetailsSchema },
      { name: employeePenalties.name, schema: employeePenaltiesSchema },
      { name: paySlip.name, schema: paySlipSchema },
    ]),

  ],
  controllers: [PayrollExecutionController],
  providers: [
    PayrollExecutionService,
    CalcDraftService, 
  ],
  exports: [PayrollExecutionService], 
})
export class PayrollExecutionModule {}