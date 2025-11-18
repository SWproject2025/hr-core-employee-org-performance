import { Injectable } from '@nestjs/common';
import { CreatePayrollDisputeDto } from './dto/create-payroll-dispute.dto';
import { UpdatePayrollDisputeDto } from './dto/update-payroll-dispute.dto';

@Injectable()
export class PayrollDisputeService {
  create(createPayrollDisputeDto: CreatePayrollDisputeDto) {
    return 'This action adds a new payrollDispute';
  }

  findAll() {
    return `This action returns all payrollDispute`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payrollDispute`;
  }

  update(id: number, updatePayrollDisputeDto: UpdatePayrollDisputeDto) {
    return `This action updates a #${id} payrollDispute`;
  }

  remove(id: number) {
    return `This action removes a #${id} payrollDispute`;
  }
}
