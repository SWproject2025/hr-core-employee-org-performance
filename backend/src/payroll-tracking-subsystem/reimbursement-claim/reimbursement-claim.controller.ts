import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReimbursementClaimService } from './reimbursement-claim.service';
import { CreateReimbursementClaimDto } from './dto/create-reimbursement-claim.dto';
import { UpdateReimbursementClaimDto } from './dto/update-reimbursement-claim.dto';

@Controller('reimbursement-claim')
export class ReimbursementClaimController {
  constructor(private readonly reimbursementClaimService: ReimbursementClaimService) {}

  @Post()
  create(@Body() createReimbursementClaimDto: CreateReimbursementClaimDto) {
    return this.reimbursementClaimService.create(createReimbursementClaimDto);
  }

  @Get()
  findAll() {
    return this.reimbursementClaimService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reimbursementClaimService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReimbursementClaimDto: UpdateReimbursementClaimDto) {
    return this.reimbursementClaimService.update(+id, updateReimbursementClaimDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reimbursementClaimService.remove(+id);
  }
}
