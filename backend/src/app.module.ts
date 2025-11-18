import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimeMangmentModule } from './time-mangment/time-mangment.module';
import { UsersModule } from './users/users.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { OrganizationStructureModule } from './organization-structure/organization-structure.module';
import { PerformanceModule } from './performance/performance.module';
import { PayrollExecutionModule } from './payroll-execution/payroll-execution.module';
import { PayrollDisputeModule } from './payroll-tracking-subsystem/payroll-dispute/payroll-dispute.module';
import { RefundModule } from './payroll-tracking-subsystem/refund/refund.module';
import { ReimbursementClaimModule } from './payroll-tracking-subsystem/reimbursement-claim/reimbursement-claim.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI') ?? 'mongodb+srv://abdoelkomy:abdoelkomy@cluster0.vpwn1.mongodb.net/',
      }),
      inject: [ConfigService],
    }),
    TimeMangmentModule,
    UsersModule,
    EmployeeProfileModule,
    OrganizationStructureModule,
    PerformanceModule,
    PayrollExecutionModule,
    PayrollDisputeModule,
    RefundModule,
    ReimbursementClaimModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
