import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PayrollDisputeService } from './payroll-dispute.service';
import { CreatePayrollDisputeDto } from './dto/create-payroll-dispute.dto';
import { UpdatePayrollDisputeDto } from './dto/update-payroll-dispute.dto';

@Controller('payroll-dispute')
export class PayrollDisputeController {
  constructor(private readonly payrollDisputeService: PayrollDisputeService) {}

  @Post()
  create(@Body() createPayrollDisputeDto: CreatePayrollDisputeDto) {
    return this.payrollDisputeService.create(createPayrollDisputeDto);
  }

  @Get()
  findAll() {
    return this.payrollDisputeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payrollDisputeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePayrollDisputeDto: UpdatePayrollDisputeDto) {
    return this.payrollDisputeService.update(+id, updatePayrollDisputeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.payrollDisputeService.remove(+id);
  }
}
