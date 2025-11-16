// Main exports for this subsystem
// This allows other subsystems to easily import modules and services

// Common utilities (enums, decorators, guards)
export * from './common';

// Auth Module
export * from './auth';

// Users Module
export * from './users';

// Employee Profile Module
export * from './employee-profile';

// Organization Structure Module
export * from './organization-structure';

// Performance Module
export * from './performance';

// Database Module
export * from './database';

// App Module
export { AppModule } from './app.module';
export { AppService } from './app.service';

