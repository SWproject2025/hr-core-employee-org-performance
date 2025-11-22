export { EmployeeProfileModule } from './employee-profile.module';
export { EmployeeProfileService } from './employee-profile.service';
export { EmployeeProfileController } from './employee-profile.controller';
export { EmployeeProfile, EmployeeProfileSchema } from './schemas/employee-profile.schema';
export { CorrectionRequest, CorrectionRequestSchema, RequestStatus } from './schemas/correction-request.schema';

// Export DTOs
export * from './dto/admin-update-profile.dto';
export * from './dto/create-correction-request.dto';
export * from './dto/update-contact.dto';
