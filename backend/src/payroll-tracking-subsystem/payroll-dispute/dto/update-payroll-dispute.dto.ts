import { PartialType } from '@nestjs/mapped-types';
import { CreatePayrollDisputeDto } from './create-payroll-dispute.dto';

export class UpdatePayrollDisputeDto extends PartialType(CreatePayrollDisputeDto) {}
