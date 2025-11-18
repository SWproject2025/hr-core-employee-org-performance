import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReimbursementClaim, ReimbursementClaimSchema } from './models/reimbursementclaim.schema';
import { ReimbursementClaimService } from './reimbursement-claim.service';
import { ReimbursementClaimController } from './reimbursement-claim.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ReimbursementClaim.name, schema: ReimbursementClaimSchema }]),
  ],
  controllers: [ReimbursementClaimController],
  providers: [ReimbursementClaimService],
  exports: [MongooseModule],
})
export class ReimbursementClaimModule {}
