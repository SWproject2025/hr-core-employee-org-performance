import { AppraisalTemplateType } from '../enums/performance.enums';

export class CycleTemplateAssignmentDto {
  // AppraisalTemplate _id
  templateId: string;

  // Departments this template applies to in this cycle
  departmentIds?: string[];
}

// 🔹 New: seed data for auto-creating assignments
export class SeedAssignmentDto {
  employeeProfileId: string;   // EmployeeProfile _id
  managerProfileId: string;    // Manager's EmployeeProfile _id
  templateId: string;          // AppraisalTemplate _id
}

export class CreateAppraisalCycleDto {
  name: string;
  description?: string;

  // Annual / Probationary / etc.
  cycleType: AppraisalTemplateType;

  // Dates as ISO strings – Mongoose will cast to Date
  startDate: string;
  endDate: string;

  // Optional deadlines
  managerDueDate?: string;
  employeeAcknowledgementDueDate?: string;

  // Mapping between templates and departments within this cycle
  templateAssignments?: CycleTemplateAssignmentDto[];

  // 🔹 New: optional seed list to auto-create AppraisalAssignment records
  seedingAssignments?: SeedAssignmentDto[];
}
