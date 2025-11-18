import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollDispute, PayrollDisputeSchema } from './models/payrolldispute.schema';
import { PayrollDisputeService } from './payroll-dispute.service';
import { PayrollDisputeController } from './payroll-dispute.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PayrollDispute.name, schema: PayrollDisputeSchema }]),
  ],
  controllers: [PayrollDisputeController],
  providers: [PayrollDisputeService],
  exports: [MongooseModule],
})
export class PayrollDisputeModule {}
