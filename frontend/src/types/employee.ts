export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export interface Address {
  city?: string;
  streetAddress?: string;
  country?: string;
}

export interface EmployeeProfile {
  _id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  workEmail?: string;
  personalEmail?: string;
  mobilePhone?: string;
  homePhone?: string;
  address?: Address;
  profilePictureUrl?: string;
  dateOfHire: string;
  status: EmployeeStatus;
  primaryPositionId?: string;
  primaryDepartmentId?: string;
  biography?: string;
}

export interface UpdateContactDto {
  mobilePhone?: string;
  homePhone?: string;
  personalEmail?: string;
  address?: Address;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}