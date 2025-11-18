import { Injectable } from '@nestjs/common';
import { CreateReimbursementClaimDto } from './dto/create-reimbursement-claim.dto';
import { UpdateReimbursementClaimDto } from './dto/update-reimbursement-claim.dto';

@Injectable()
export class ReimbursementClaimService {
  create(createReimbursementClaimDto: CreateReimbursementClaimDto) {
    return 'This action adds a new reimbursementClaim';
  }

  findAll() {
    return `This action returns all reimbursementClaim`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reimbursementClaim`;
  }

  update(id: number, updateReimbursementClaimDto: UpdateReimbursementClaimDto) {
    return `This action updates a #${id} reimbursementClaim`;
  }

  remove(id: number) {
    return `This action removes a #${id} reimbursementClaim`;
  }
}
