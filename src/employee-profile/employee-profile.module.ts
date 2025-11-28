import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeeProfileController } from './employee-profile.controller';

// Import your Schemas
import { EmployeeProfile, EmployeeProfileSchema } from './models/employee-profile.schema';
import { EmployeeProfileChangeRequest, EmployeeProfileChangeRequestSchema } from './models/ep-change-request.schema';
import { AuditLog, AuditLogSchema } from './models/audit-log.schema';
import { Candidate, CandidateSchema } from './models/candidate.schema';
import { EmployeeSystemRole, EmployeeSystemRoleSchema } from './models/employee-system-role.schema';
import { EmployeeQualification, EmployeeQualificationSchema } from './models/qualification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: EmployeeProfileChangeRequest.name, schema: EmployeeProfileChangeRequestSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
      { name: EmployeeQualification.name, schema: EmployeeQualificationSchema },
    ]),
  ],
  controllers: [EmployeeProfileController],
  providers: [EmployeeProfileService],
  exports: [EmployeeProfileService, MongooseModule],
})
export class EmployeeProfileModule {}