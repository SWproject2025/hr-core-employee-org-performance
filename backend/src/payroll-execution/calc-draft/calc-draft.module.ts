import { Module } from '@nestjs/common';
import { CalcDraftService } from './calc-draft.service';
import { CalcDraftController } from './calc-draft.controller';

@Module({
  controllers: [CalcDraftController],
  providers: [CalcDraftService],
})
export class CalcDraftModule {}
