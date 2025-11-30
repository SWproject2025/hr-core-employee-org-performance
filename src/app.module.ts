import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// --- Core Modules ---
import { AuthModule } from './auth/auth.module';

// --- Feature Modules ---
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TimeManagementModule } from './time-management/time-management.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { LeavesModule } from './leaves/leaves.module';
import { PayrollTrackingModule } from './payroll-tracking/payroll-tracking.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { OrganizationStructureModule } from './organization-structure/organization-structure.module';
import { PerformanceModule } from './performance/performance.module';
import { TimeManagementModule } from './time-management/time-management.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { LeavesModule } from './leaves/leaves.module';
import { PayrollTrackingModule } from './payroll-tracking/payroll-tracking.module';
import { PayrollConfigurationModule } from './payroll-configuration/payroll-configuration.module';
import { PayrollExecutionModule } from './payroll-execution/payroll-execution.module';

@Module({
  imports: [
    // 1. Global Configuration (Loads .env)
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Database Connection
    MongooseModule.forRoot('mongodb://localhost:27017/hr-system'),

    // 3. Authentication & Core
    AuthModule,

    // 4. Your Feature Modules
    EmployeeProfileModule,
    OrganizationStructureModule,
    PerformanceModule,
    TimeManagementModule,
    RecruitmentModule,
    LeavesModule,
    PayrollConfigurationModule,
    PayrollExecutionModule,
    PayrollTrackingModule,
    // 🔗 Global MongoDB connection (needed for NotificationLogModel, etc.)
    MongooseModule.forRoot(
      process.env.MONGO_URI ??
        'mongodb://127.0.0.1:27017/hr-core-employee-org-performance',
    ),

    TimeManagementModule,
    RecruitmentModule,
    LeavesModule,
    PayrollExecutionModule,
    PayrollConfigurationModule,
    PayrollTrackingModule,
    EmployeeProfileModule,
    OrganizationStructureModule,
    PerformanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}