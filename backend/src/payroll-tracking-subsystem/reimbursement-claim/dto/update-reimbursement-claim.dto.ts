import { PartialType } from '@nestjs/mapped-types';
import { CreateReimbursementClaimDto } from './create-reimbursement-claim.dto';

export class UpdateReimbursementClaimDto extends PartialType(CreateReimbursementClaimDto) {}
