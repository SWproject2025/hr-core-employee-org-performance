import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Refund, RefundSchema } from './models/refund.schema';
import { RefundService } from './refund.service';
import { RefundController } from './refund.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Refund.name, schema: RefundSchema }]),
  ],
  controllers: [RefundController],
  providers: [RefundService],
  exports: [MongooseModule],
})
export class RefundModule {}
