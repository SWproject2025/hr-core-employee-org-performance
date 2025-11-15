// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeeProfileModule } from './employee-profile/employee-profile.module';
import { OrganizationStructureModule } from './organization-structure/organization-structure.module';
import { PerformanceModule } from './performance/performance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Makes .env variables available globally
    DatabaseModule,
    AuthModule,
    UsersModule,
    EmployeeProfileModule,
    OrganizationStructureModule,
    PerformanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}