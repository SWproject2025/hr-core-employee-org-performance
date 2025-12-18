/**
 * Seed Script for Auth & Payroll Tracking Modules
 * 
 * This script clears existing data and populates the database with test data for comprehensive testing.
 * 
 * Usage:
 *   npm run seed:auth-payroll
 *   or
 *   ts-node src/scripts/seed-auth-payroll.ts
 * 
 * WARNING: This script will DELETE all existing data in the following collections:
 *   - employee_profiles
 *   - employee_system_roles
 *   - payslips
 *   - payrollruns
 *   - employeepayrolldetails
 *   - disputes
 *   - claims
 *   - refunds
 * 
 * NOTE: This script will CREATE or UPDATE departments (IT, HR, Finance) and assign
 *       employees to departments for testing the department payroll report feature.
 */

// Load environment variables from .env file
import * as path from 'path';
import * as fs from 'fs';

// Try to load .env file from the backend directory
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  // Use require for dotenv to avoid import issues
  require('dotenv').config({ path: envPath });
  console.log(`✅ Loaded .env file from: ${envPath}`);
} else {
  console.log(`⚠️  .env file not found at: ${envPath}`);
  console.log(`   Using environment variables or default connection string`);
}

// Log the MongoDB URI being used (without password for security)
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-main';
const maskedUri = mongoUri.replace(/:[^:@]+@/, ':****@'); // Mask password in URI
console.log(`📡 Using MongoDB URI: ${maskedUri}\n`);

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { Model, Types } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole } from '../employee-profile/models/employee-system-role.schema';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
import { paySlip } from '../payroll-execution/models/payslip.schema';
import { payrollRuns } from '../payroll-execution/models/payrollRuns.schema';
import { employeePayrollDetails } from '../payroll-execution/models/employeePayrollDetails.schema';
import { PaySlipPaymentStatus, PayRollStatus, PayRollPaymentStatus, BankStatus } from '../payroll-execution/enums/payroll-execution-enum';
import { ConfigStatus } from '../payroll-configuration/enums/payroll-configuration-enums';
import { getModelToken } from '@nestjs/mongoose';
import { disputes } from '../payroll-tracking/models/disputes.schema';
import { claims } from '../payroll-tracking/models/claims.schema';
import { refunds } from '../payroll-tracking/models/refunds.schema';
import { DisputeStatus, ClaimStatus, RefundStatus } from '../payroll-tracking/enums/payroll-tracking-enum';
import { Department, DepartmentDocument } from '../organization-structure/models/department.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get(AuthService);
  const employeeModel = app.get(getModelToken(EmployeeProfile.name)) as Model<EmployeeProfile>;
  const systemRoleModel = app.get(getModelToken(EmployeeSystemRole.name)) as Model<EmployeeSystemRole>;
  const payslipModel = app.get(getModelToken(paySlip.name)) as Model<any>;
  const payrollRunsModel = app.get(getModelToken(payrollRuns.name)) as Model<any>;
  const employeePayrollDetailsModel = app.get(getModelToken(employeePayrollDetails.name)) as Model<any>;
  const disputesModel = app.get(getModelToken(disputes.name)) as Model<any>;
  const claimsModel = app.get(getModelToken(claims.name)) as Model<any>;
  const refundsModel = app.get(getModelToken(refunds.name)) as Model<any>;
  const departmentModel = app.get(getModelToken(Department.name)) as Model<Department>;

  console.log('🌱 Starting seed process...\n');

  try {
    // ==================== 0. Clear All Existing Data ====================
    console.log('🗑️  Clearing existing data...');

    const deleteResults = await Promise.all([
      employeeModel.deleteMany({}),
      systemRoleModel.deleteMany({}),
      payslipModel.deleteMany({}),
      payrollRunsModel.deleteMany({}),
      employeePayrollDetailsModel.deleteMany({}),
      disputesModel.deleteMany({}),
      claimsModel.deleteMany({}),
      refundsModel.deleteMany({}),
    ]);

    const totalDeleted = deleteResults.reduce((sum, result) => sum + (result.deletedCount || 0), 0);
    console.log(`  ✅ Cleared ${totalDeleted} documents from all collections\n`);

    // ==================== 1. Create Departments ====================
    console.log('🏢 Creating departments...');

    const departmentsData = [
      {
        code: 'IT',
        name: 'Information Technology',
        description: 'IT Department for software development and technical support',
        active: true,
      },
      {
        code: 'HR',
        name: 'Human Resources',
        description: 'HR Department for employee management and payroll',
        active: true,
      },
      {
        code: 'FIN',
        name: 'Finance',
        description: 'Finance Department for financial operations',
        active: true,
      },
    ];

    const createdDepartments: DepartmentDocument[] = [];
    for (const deptData of departmentsData) {
      // Check if department already exists
      let department = await departmentModel.findOne({ code: deptData.code });
      if (!department) {
        department = await departmentModel.create(deptData);
        console.log(`  ✅ Created department: ${deptData.code} - ${deptData.name}`);
      } else {
        // Update existing department
        Object.assign(department, deptData);
        await department.save();
        console.log(`  ✅ Updated department: ${deptData.code} - ${deptData.name}`);
      }
      createdDepartments.push(department);
    }

    // Get department IDs
    const itDepartment = createdDepartments.find(d => d.code === 'IT');
    const hrDepartment = createdDepartments.find(d => d.code === 'HR');
    const finDepartment = createdDepartments.find(d => d.code === 'FIN');

    if (!itDepartment || !hrDepartment || !finDepartment) {
      throw new Error('Failed to create required departments');
    }

    // ==================== 2. Create Employees ====================
    console.log('\n📝 Creating employees...');

    const employees = [
      {
        firstName: 'John',
        lastName: 'Doe',
        nationalId: '1234567890123',
        workEmail: 'john.doe@company.com',
        personalEmail: 'john.doe.personal@gmail.com',
        password: 'password123',
        status: EmployeeStatus.ACTIVE,
      },
      {
        firstName: 'Sarah',
        lastName: 'Smith',
        nationalId: '2345678901234',
        workEmail: 'sarah.smith@company.com',
        personalEmail: 'sarah.smith.personal@gmail.com',
        password: 'password123',
        status: EmployeeStatus.ACTIVE,
      },
      {
        firstName: 'Michael',
        lastName: 'Johnson',
        nationalId: '3456789012345',
        workEmail: 'michael.johnson@company.com',
        personalEmail: 'michael.johnson.personal@gmail.com',
        password: 'password123',
        status: EmployeeStatus.ACTIVE,
      },
      {
        firstName: 'Emily',
        lastName: 'Williams',
        nationalId: '4567890123456',
        workEmail: 'emily.williams@company.com',
        personalEmail: 'emily.williams.personal@gmail.com',
        password: 'password123',
        status: EmployeeStatus.ACTIVE,
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        nationalId: '5678901234567',
        workEmail: 'david.brown@company.com',
        personalEmail: 'david.brown.personal@gmail.com',
        password: 'password123',
        status: EmployeeStatus.ACTIVE,
      },
    ];

    const createdEmployees: EmployeeProfileDocument[] = [];
    for (const empData of employees) {
      const employee = await authService.register(empData);
      console.log(`  ✅ Created employee: ${employee.workEmail} (${employee.employeeNumber})`);
      createdEmployees.push(employee);
    }

    // Assign departments to employees
    console.log('\n🔗 Assigning departments to employees...');
    // John Doe -> IT Department
    await employeeModel.updateOne(
      { _id: createdEmployees[0]._id },
      { primaryDepartmentId: itDepartment._id }
    );
    console.log(`  ✅ Assigned ${createdEmployees[0].workEmail} to IT Department`);
    
    // Sarah Smith (Payroll Specialist) -> HR Department
    await employeeModel.updateOne(
      { _id: createdEmployees[1]._id },
      { primaryDepartmentId: hrDepartment._id }
    );
    console.log(`  ✅ Assigned ${createdEmployees[1].workEmail} to HR Department`);
    
    // Michael Johnson (Payroll Manager) -> HR Department
    await employeeModel.updateOne(
      { _id: createdEmployees[2]._id },
      { primaryDepartmentId: hrDepartment._id }
    );
    console.log(`  ✅ Assigned ${createdEmployees[2].workEmail} to HR Department`);
    
    // Emily Williams (Finance Staff) -> Finance Department
    await employeeModel.updateOne(
      { _id: createdEmployees[3]._id },
      { primaryDepartmentId: finDepartment._id }
    );
    console.log(`  ✅ Assigned ${createdEmployees[3].workEmail} to Finance Department`);
    
    // David Brown -> IT Department
    await employeeModel.updateOne(
      { _id: createdEmployees[4]._id },
      { primaryDepartmentId: itDepartment._id }
    );
    console.log(`  ✅ Assigned ${createdEmployees[4].workEmail} to IT Department`);

    // Refresh employees to get updated department assignments
    for (let i = 0; i < createdEmployees.length; i++) {
      const updated = await employeeModel.findById(createdEmployees[i]._id);
      if (updated) {
        createdEmployees[i] = updated;
      }
    }

    // ==================== 3. Create Employee System Roles ====================
    console.log('\n👤 Creating employee system roles...');

    const roles = [
      { employee: createdEmployees[0], roles: [SystemRole.DEPARTMENT_EMPLOYEE] }, // John Doe
      { employee: createdEmployees[1], roles: [SystemRole.PAYROLL_SPECIALIST] }, // Sarah Smith
      { employee: createdEmployees[2], roles: [SystemRole.PAYROLL_MANAGER] }, // Michael Johnson
      { employee: createdEmployees[3], roles: [SystemRole.FINANCE_STAFF] }, // Emily Williams
      { employee: createdEmployees[4], roles: [SystemRole.DEPARTMENT_EMPLOYEE] }, // David Brown
    ];

    for (const roleData of roles) {
      const systemRole = new systemRoleModel({
        employeeProfileId: roleData.employee._id,
        roles: roleData.roles,
        permissions: [],
        isActive: true,
      });
      await systemRole.save();
      console.log(`  ✅ Created role for ${roleData.employee.workEmail}: ${roleData.roles.join(', ')}`);
    }

    // ==================== 4. Create Payroll Runs ====================
    console.log('\n📅 Creating payroll runs...');

    // Get the Payroll Specialist (Sarah Smith) for payrollSpecialistId
    const payrollSpecialist = createdEmployees.find(emp =>
      emp.workEmail === 'sarah.smith@company.com'
    );

    if (!payrollSpecialist) {
      throw new Error('Payroll Specialist (Sarah Smith) not found. Cannot create payroll runs.');
    }

    const payrollRunsData = [
      {
        runId: 'PR-2024-01',
        payrollPeriod: new Date('2024-01-01'),
        status: PayRollStatus.APPROVED,
        paymentStatus: PayRollPaymentStatus.PAID,
        entity: 'Company',
        employees: 2, // John Doe + David Brown
        exceptions: 0,
        totalnetpay: 10827, // 5100 (John) + 5727 (David)
        payrollSpecialistId: payrollSpecialist._id,
      },
      {
        runId: 'PR-2024-02',
        payrollPeriod: new Date('2024-02-01'),
        status: PayRollStatus.APPROVED,
        paymentStatus: PayRollPaymentStatus.PAID,
        entity: 'Company',
        employees: 1, // John Doe only
        exceptions: 0,
        totalnetpay: 4575, // John Doe with penalty
        payrollSpecialistId: payrollSpecialist._id,
      },
      {
        runId: 'PR-2024-03',
        payrollPeriod: new Date('2024-03-01'),
        status: PayRollStatus.APPROVED,
        paymentStatus: PayRollPaymentStatus.PENDING,
        entity: 'Company',
        employees: 1, // John Doe only
        exceptions: 0,
        totalnetpay: 4675, // John Doe without penalty
        payrollSpecialistId: payrollSpecialist._id,
      },
    ];

    const createdPayrollRuns: any[] = [];
    for (const runData of payrollRunsData) {
      const payrollRun = new payrollRunsModel(runData);
      await payrollRun.save();
      console.log(`  ✅ Created payroll run: ${runData.runId}`);
      createdPayrollRuns.push(payrollRun);
    }

    // ==================== 5. Create Payslips ====================
    console.log('\n💰 Creating payslips...');

    // Helper function to create complete insurance bracket
    const createInsuranceBracket = (name: string, employeeRate: number, employerRate: number, grossSalary: number, minSalary: number = 0, maxSalary: number = 20000) => {
      const employeeAmount = (grossSalary * employeeRate) / 100;
      return {
        name,
        employeeRate,
        employerRate,
        amount: employeeAmount,
        minSalary,
        maxSalary,
        status: ConfigStatus.APPROVED,
      };
    };

    // Helper function to create complete tax rule
    const createTaxRule = (name: string, rate: number, grossSalary: number) => {
      const taxAmount = (grossSalary * rate) / 100;
      return {
        name,
        rate,
        amount: taxAmount,
        status: ConfigStatus.APPROVED,
      };
    };

    // Helper function to create complete allowance
    const createAllowance = (name: string, amount: number) => {
      return {
        name,
        amount,
        status: ConfigStatus.APPROVED,
      };
    };

    // Helper function to create signing bonus with unique positionName
    const createSigningBonus = (positionName: string, amount: number) => {
      return {
        positionName, // Must be unique across all payslips
        amount,
        status: ConfigStatus.APPROVED,
      };
    };

    // Helper function to create termination/resignation benefit with unique name
    const createTerminationBenefit = (name: string, amount: number, terms?: string) => {
      return {
        name, // Must be unique across all payslips
        amount,
        terms: terms || 'Standard termination benefit',
        status: ConfigStatus.APPROVED,
      };
    };

    // Helper function to build earningsDetails with optional bonuses/benefits
    const buildEarningsDetails = (baseSalary: number, allowances: any[], bonuses?: any[], benefits?: any[]) => {
      const earnings: any = {
        baseSalary,
        allowances,
      };
      if (bonuses && bonuses.length > 0) {
        earnings.bonuses = bonuses;
      }
      if (benefits && benefits.length > 0) {
        earnings.benefits = benefits;
      }
      return earnings;
    };

    const payslipsData = [
      // John Doe - January 2024
      // Base: 5000, Allowances: 500 (transport) + 300 (leave) = 800, Bonus: 200, Gross: 6000
      // Tax: 10% of 6000 = 600, Insurance: 5% of 6000 = 300, Deductions: 900, Net: 5100
      {
        employeeId: createdEmployees[0]._id,
        payrollRunId: createdPayrollRuns[0]._id,
        earningsDetails: buildEarningsDetails(
          5000,
          [
            createAllowance('Transportation Allowance - John Doe Jan 2024', 500),
            createAllowance('Leave Compensation - John Doe Jan 2024', 300),
          ],
          [
            createSigningBonus('Senior Developer - John Doe Jan 2024', 200),
          ],
          [
            createTerminationBenefit('Performance Bonus - John Doe Jan 2024', 0, 'Monthly performance benefit'),
          ]
        ),
        deductionsDetails: {
          taxes: [
            createTaxRule('Income Tax - John Doe Jan 2024', 10, 6000),
          ],
          insurances: [
            createInsuranceBracket('Health Insurance - John Doe Jan 2024', 5, 5, 6000),
          ],
          penalties: {
            employeeId: createdEmployees[0]._id,
            penalties: [],
          },
        },
        totalGrossSalary: 6000, // 5000 (base) + 800 (allowances) + 200 (bonus)
        totaDeductions: 900, // 600 (tax) + 300 (insurance)
        netPay: 5100, // 6000 - 900
        paymentStatus: PaySlipPaymentStatus.PAID,
      },
      // John Doe - February 2024
      // Base: 5000, Allowances: 500 (transport), Gross: 5500
      // Tax: 10% of 5500 = 550, Insurance: 5% of 5500 = 275, Penalty: 100, Deductions: 925, Net: 4575
      {
        employeeId: createdEmployees[0]._id,
        payrollRunId: createdPayrollRuns[1]._id,
        earningsDetails: buildEarningsDetails(
          5000,
          [
            createAllowance('Transportation Allowance - John Doe Feb 2024', 500),
          ],
          [
            createSigningBonus('Senior Developer - John Doe Feb 2024', 0),
          ],
          [
            createTerminationBenefit('Performance Bonus - John Doe Feb 2024', 0, 'Monthly performance benefit'),
          ]
        ),
        deductionsDetails: {
          taxes: [
            createTaxRule('Income Tax - John Doe Feb 2024', 10, 5500),
          ],
          insurances: [
            createInsuranceBracket('Health Insurance - John Doe Feb 2024', 5, 5, 5500),
          ],
          penalties: {
            employeeId: createdEmployees[0]._id,
            penalties: [
              {
                reason: 'Late arrival - 3 instances in February',
                amount: 100,
              },
            ],
          },
        },
        totalGrossSalary: 5500,
        totaDeductions: 925, // 550 (tax) + 275 (insurance) + 100 (penalty)
        netPay: 4575, // 5500 - 925
        paymentStatus: PaySlipPaymentStatus.PAID,
      },
      // John Doe - March 2024
      // Base: 5000, Allowances: 500 (transport), Gross: 5500
      // Tax: 10% of 5500 = 550, Insurance: 5% of 5500 = 275, Deductions: 825, Net: 4675
      {
        employeeId: createdEmployees[0]._id,
        payrollRunId: createdPayrollRuns[2]._id,
        earningsDetails: buildEarningsDetails(
          5000,
          [
            createAllowance('Transportation Allowance - John Doe Mar 2024', 500),
          ],
          [
            createSigningBonus('Senior Developer - John Doe Mar 2024', 0),
          ],
          [
            createTerminationBenefit('Performance Bonus - John Doe Mar 2024', 0, 'Monthly performance benefit'),
          ]
        ),
        deductionsDetails: {
          taxes: [
            createTaxRule('Income Tax - John Doe Mar 2024', 10, 5500),
          ],
          insurances: [
            createInsuranceBracket('Health Insurance - John Doe Mar 2024', 5, 5, 5500),
          ],
          penalties: {
            employeeId: createdEmployees[0]._id,
            penalties: [],
          },
        },
        totalGrossSalary: 5500,
        totaDeductions: 825, // 550 (tax) + 275 (insurance)
        netPay: 4675, // 5500 - 825
        paymentStatus: PaySlipPaymentStatus.PENDING,
      },
      // David Brown - January 2024
      // Base: 6000, Allowances: 600 (transport), Bonus: 300, Gross: 6900
      // Tax: 12% of 6900 = 828, Insurance: 5% of 6900 = 345, Deductions: 1173, Net: 5727
      {
        employeeId: createdEmployees[4]._id,
        payrollRunId: createdPayrollRuns[0]._id,
        earningsDetails: buildEarningsDetails(
          6000,
          [
            createAllowance('Transportation Allowance - David Brown Jan 2024', 600),
          ],
          [
            createSigningBonus('Lead Developer - David Brown Jan 2024', 300),
          ],
          [
            createTerminationBenefit('End of Service Gratuity - David Brown Jan 2024', 0, 'Accrued benefit'),
          ]
        ),
        deductionsDetails: {
          taxes: [
            createTaxRule('Income Tax - David Brown Jan 2024', 12, 6900),
          ],
          insurances: [
            createInsuranceBracket('Health Insurance - David Brown Jan 2024', 5, 5, 6900),
          ],
          penalties: {
            employeeId: createdEmployees[4]._id,
            penalties: [],
          },
        },
        totalGrossSalary: 6900, // 6000 (base) + 600 (allowances) + 300 (bonus)
        totaDeductions: 1173, // 828 (tax) + 345 (insurance)
        netPay: 5727, // 6900 - 1173
        paymentStatus: PaySlipPaymentStatus.PAID,
      },
    ];

    // Helper function to remove undefined/null fields and empty arrays from nested objects
    // This is critical to avoid unique index conflicts on bonuses.positionName and benefits.name
    // IMPORTANT: Preserves ObjectId instances and other Mongoose types
    const cleanObject = (obj: any): any => {
      if (obj === null || obj === undefined) {
        return obj;
      }
      // Preserve ObjectId instances and other Mongoose types
      if (obj instanceof Types.ObjectId) {
        return obj;
      }
      if (Array.isArray(obj)) {
        // Remove empty arrays to prevent MongoDB from indexing null values
        if (obj.length === 0) {
          return undefined; // Return undefined so parent can exclude it
        }
        const cleaned = obj.map(cleanObject).filter(item => item !== undefined);
        return cleaned.length > 0 ? cleaned : undefined;
      }
      if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            // Only include the field if it's not undefined and not an empty array
            if (value !== undefined) {
              // Preserve ObjectId instances
              if (value instanceof Types.ObjectId) {
                cleaned[key] = value;
              } else {
                const cleanedValue = cleanObject(value);
                // Only include if cleaned value is not undefined
                if (cleanedValue !== undefined) {
                  cleaned[key] = cleanedValue;
                }
              }
            }
          }
        }
        return cleaned;
      }
      return obj;
    };

    const createdPayslips: any[] = [];
    for (let i = 0; i < payslipsData.length; i++) {
      const payslipData = payslipsData[i];
      try {
        // Store the ObjectIds before cleaning to ensure they're not lost
        const employeeId = payslipData.employeeId; // Already an ObjectId from createdEmployees
        const payrollRunId = payslipData.payrollRunId; // Already an ObjectId from createdPayrollRuns
        const penaltiesEmployeeId = payslipData.deductionsDetails.penalties.employeeId; // Already an ObjectId

        // Clean the payslip data to remove any undefined fields that might cause unique index conflicts
        const cleanedPayslipData = cleanObject(payslipData);

        // Explicitly ensure bonuses and benefits are removed if they're empty/undefined
        // This is critical to avoid unique index conflicts on bonuses.positionName and benefits.name
        if (cleanedPayslipData.earningsDetails) {
          if (!cleanedPayslipData.earningsDetails.bonuses ||
            (Array.isArray(cleanedPayslipData.earningsDetails.bonuses) &&
              cleanedPayslipData.earningsDetails.bonuses.length === 0)) {
            delete cleanedPayslipData.earningsDetails.bonuses;
          }
          if (!cleanedPayslipData.earningsDetails.benefits ||
            (Array.isArray(cleanedPayslipData.earningsDetails.benefits) &&
              cleanedPayslipData.earningsDetails.benefits.length === 0)) {
            delete cleanedPayslipData.earningsDetails.benefits;
          }
        }

        // Always restore the required ObjectIds after cleaning (they should be preserved, but ensure they're there)
        cleanedPayslipData.employeeId = employeeId;
        cleanedPayslipData.payrollRunId = payrollRunId;

        // Ensure deductionsDetails.penalties structure exists with employeeId
        if (!cleanedPayslipData.deductionsDetails) {
          cleanedPayslipData.deductionsDetails = {};
        }
        if (!cleanedPayslipData.deductionsDetails.penalties) {
          cleanedPayslipData.deductionsDetails.penalties = {
            employeeId: penaltiesEmployeeId,
            penalties: payslipData.deductionsDetails.penalties.penalties || [],
          };
        } else {
          cleanedPayslipData.deductionsDetails.penalties.employeeId = penaltiesEmployeeId;
        }

        // Use create() which properly handles ObjectId conversion and schema validation
        // This returns the created document with the auto-generated _id
        const createdPayslip = await payslipModel.create(cleanedPayslipData);
        createdPayslips.push(createdPayslip);

        const employee = createdEmployees.find(emp => emp._id.toString() === payslipData.employeeId.toString());
        console.log(`  ✅ Created payslip ${i + 1}/${payslipsData.length} for ${employee?.workEmail || payslipData.employeeId} (ID: ${createdPayslip._id})`);
      } catch (error: any) {
        const employee = createdEmployees.find(emp => emp._id.toString() === payslipData.employeeId.toString());
        console.error(`  ❌ Failed to create payslip ${i + 1}/${payslipsData.length} for ${employee?.workEmail || payslipData.employeeId}:`, error.message);
        if (error.errors) {
          console.error('    Validation errors:', Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`).join(', '));
        }
        throw error; // Re-throw to stop the process
      }
    }

    // ==================== 6. Create Employee Payroll Details ====================
    console.log('\n📊 Creating employee payroll details...');

    // Use the created payslips directly instead of querying the database
    const johnPayslips = createdPayslips.filter(p => p.employeeId.toString() === createdEmployees[0]._id.toString());
    const davidPayslips = createdPayslips.filter(p => p.employeeId.toString() === createdEmployees[4]._id.toString());

    if (johnPayslips.length > 0) {
      const latestPayslip = johnPayslips[0];
      // Calculate total allowances from payslip
      const totalAllowances = latestPayslip.earningsDetails.allowances?.reduce(
        (sum: number, allowance: any) => sum + (allowance.amount || 0),
        0
      ) || 0;

      const payrollDetails = new employeePayrollDetailsModel({
        employeeId: createdEmployees[0]._id,
        payrollRunId: latestPayslip.payrollRunId,
        baseSalary: latestPayslip.earningsDetails.baseSalary,
        allowances: totalAllowances,
        deductions: latestPayslip.totaDeductions,
        netSalary: latestPayslip.totalGrossSalary - latestPayslip.totaDeductions,
        netPay: latestPayslip.netPay,
        bankStatus: BankStatus.VALID, // Assuming employees have valid bank details
      });
      await payrollDetails.save();
      console.log(`  ✅ Created payroll details for ${createdEmployees[0].workEmail}`);
    }

    if (davidPayslips.length > 0) {
      const latestPayslip = davidPayslips[0];
      // Calculate total allowances from payslip
      const totalAllowances = latestPayslip.earningsDetails.allowances?.reduce(
        (sum: number, allowance: any) => sum + (allowance.amount || 0),
        0
      ) || 0;

      const payrollDetails = new employeePayrollDetailsModel({
        employeeId: createdEmployees[4]._id,
        payrollRunId: latestPayslip.payrollRunId,
        baseSalary: latestPayslip.earningsDetails.baseSalary,
        allowances: totalAllowances,
        deductions: latestPayslip.totaDeductions,
        netSalary: latestPayslip.totalGrossSalary - latestPayslip.totaDeductions,
        netPay: latestPayslip.netPay,
        bankStatus: BankStatus.VALID, // Assuming employees have valid bank details
      });
      await payrollDetails.save();
      console.log(`  ✅ Created payroll details for ${createdEmployees[4].workEmail}`);
    }

    // ==================== 7. Create Disputes ====================
    console.log('\n⚖️  Creating disputes...');

    // Reuse payrollSpecialist from earlier, get other roles
    const payrollManager = createdEmployees.find(emp => emp.workEmail === 'michael.johnson@company.com');
    const financeStaff = createdEmployees.find(emp => emp.workEmail === 'emily.williams@company.com');

    // Get John Doe's payslips for disputes
    const johnJanPayslip = johnPayslips.find(p => p.payrollRunId.toString() === createdPayrollRuns[0]._id.toString());
    const johnFebPayslip = johnPayslips.find(p => p.payrollRunId.toString() === createdPayrollRuns[1]._id.toString());
    const johnMarPayslip = johnPayslips.find(p => p.payrollRunId.toString() === createdPayrollRuns[2]._id.toString());

    const disputesData = [
      // Dispute 1: Under Review (for specialist to test approve/reject)
      {
        disputeId: 'DISP-0001',
        description: 'I believe there is an error in my February payslip. The penalty deduction seems incorrect.',
        employeeId: createdEmployees[0]._id, // John Doe
        payslipId: johnFebPayslip?._id,
        status: DisputeStatus.UNDER_REVIEW,
        submittedAt: new Date('2024-02-15'),
        approvalHistory: [
          {
            userId: createdEmployees[0]._id,
            action: 'submitted',
            role: 'employee',
            timestamp: new Date('2024-02-15'),
            comment: 'Initial dispute submission',
            previousStatus: null,
            newStatus: DisputeStatus.UNDER_REVIEW,
          },
        ],
      },
      // Dispute 2: Pending Manager Approval (for manager to test confirmation)
      {
        disputeId: 'DISP-0002',
        description: 'The tax calculation in my January payslip appears to be higher than expected.',
        employeeId: createdEmployees[0]._id, // John Doe
        payslipId: johnJanPayslip?._id,
        status: DisputeStatus.PENDING_MANAGER_APPROVAL,
        payrollSpecialistId: payrollSpecialist?._id,
        reviewedAt: new Date('2024-01-20'),
        submittedAt: new Date('2024-01-18'),
        approvalHistory: [
          {
            userId: createdEmployees[0]._id,
            action: 'submitted',
            role: 'employee',
            timestamp: new Date('2024-01-18'),
            comment: 'Initial dispute submission',
            previousStatus: null,
            newStatus: DisputeStatus.UNDER_REVIEW,
          },
          {
            userId: payrollSpecialist?._id,
            action: 'approved',
            role: 'payroll_specialist',
            timestamp: new Date('2024-01-20'),
            comment: 'Dispute is valid. Moving to manager approval.',
            previousStatus: DisputeStatus.UNDER_REVIEW,
            newStatus: DisputeStatus.PENDING_MANAGER_APPROVAL,
          },
        ],
      },
      // Dispute 3: Approved (for finance to test refund creation)
      {
        disputeId: 'DISP-0003',
        description: 'I was charged a penalty in February but I have documentation showing I was on approved leave.',
        employeeId: createdEmployees[0]._id, // John Doe
        payslipId: johnFebPayslip?._id,
        status: DisputeStatus.APPROVED,
        payrollSpecialistId: payrollSpecialist?._id,
        payrollManagerId: payrollManager?._id,
        reviewedAt: new Date('2024-02-16'),
        managerApprovedAt: new Date('2024-02-18'),
        resolvedAt: new Date('2024-02-18'),
        submittedAt: new Date('2024-02-14'),
        resolutionComment: 'Dispute approved. Employee was on approved leave. Refund will be processed.',
        approvalHistory: [
          {
            userId: createdEmployees[0]._id,
            action: 'submitted',
            role: 'employee',
            timestamp: new Date('2024-02-14'),
            comment: 'Initial dispute submission',
            previousStatus: null,
            newStatus: DisputeStatus.UNDER_REVIEW,
          },
          {
            userId: payrollSpecialist?._id,
            action: 'approved',
            role: 'payroll_specialist',
            timestamp: new Date('2024-02-16'),
            comment: 'Dispute is valid. Employee has documentation.',
            previousStatus: DisputeStatus.UNDER_REVIEW,
            newStatus: DisputeStatus.PENDING_MANAGER_APPROVAL,
          },
          {
            userId: payrollManager?._id,
            action: 'confirmed',
            role: 'payroll_manager',
            timestamp: new Date('2024-02-18'),
            comment: 'Manager approval confirmed. Proceed with refund.',
            previousStatus: DisputeStatus.PENDING_MANAGER_APPROVAL,
            newStatus: DisputeStatus.APPROVED,
          },
        ],
      },
      // Dispute 4: Rejected (to test rejected flow)
      {
        disputeId: 'DISP-0004',
        description: 'I think my March payslip has incorrect allowances.',
        employeeId: createdEmployees[0]._id, // John Doe
        payslipId: johnMarPayslip?._id,
        status: DisputeStatus.REJECTED,
        payrollSpecialistId: payrollSpecialist?._id,
        reviewedAt: new Date('2024-03-20'),
        resolvedAt: new Date('2024-03-20'),
        submittedAt: new Date('2024-03-18'),
        rejectionReason: 'The payslip calculations are correct. All allowances have been properly applied according to company policy.',
        approvalHistory: [
          {
            userId: createdEmployees[0]._id,
            action: 'submitted',
            role: 'employee',
            timestamp: new Date('2024-03-18'),
            comment: 'Initial dispute submission',
            previousStatus: null,
            newStatus: DisputeStatus.UNDER_REVIEW,
          },
          {
            userId: payrollSpecialist?._id,
            action: 'rejected',
            role: 'payroll_specialist',
            timestamp: new Date('2024-03-20'),
            comment: 'Dispute rejected. Calculations are correct.',
            previousStatus: DisputeStatus.UNDER_REVIEW,
            newStatus: DisputeStatus.REJECTED,
          },
        ],
      },
    ];

    const createdDisputes: any[] = [];
    for (const disputeData of disputesData) {
      if (disputeData.payslipId) {
        const dispute = new disputesModel(disputeData);
        await dispute.save();
        createdDisputes.push(dispute);
        console.log(`  ✅ Created dispute: ${disputeData.disputeId} (${disputeData.status})`);
      }
    }

    // ==================== 8. Create Claims ====================
    console.log('\n💼 Creating claims...');

    const claimsData = [
      // Claim 1: Under Review (for specialist to test approve/reject)
      {
        claimId: 'CLAIM-0001',
        description: 'Business travel expenses for client meeting in January',
        claimType: 'travel',
        amount: 500,
        employeeId: createdEmployees[0]._id, // John Doe
        status: ClaimStatus.UNDER_REVIEW,
        submittedAt: new Date('2024-01-25'),
        approvalHistory: [
          {
            userId: createdEmployees[0]._id,
            action: 'submitted',
            role: 'employee',
            timestamp: new Date('2024-01-25'),
            comment: 'Initial claim submission',
            previousStatus: null,
            newStatus: ClaimStatus.UNDER_REVIEW,
          },
        ],
      },
      // Claim 2: Pending Manager Approval (for manager to test confirmation)
      {
        claimId: 'CLAIM-0002',
        description: 'Medical expenses for annual health checkup',
        claimType: 'medical',
        amount: 300,
        employeeId: createdEmployees[0]._id, // John Doe
        status: ClaimStatus.PENDING_MANAGER_APPROVAL,
        approvedAmount: 300,
        payrollSpecialistId: payrollSpecialist?._id,
        reviewedAt: new Date('2024-02-10'),
        submittedAt: new Date('2024-02-05'),
        approvalHistory: [
          {
            userId: createdEmployees[0]._id,
            action: 'submitted',
            role: 'employee',
            timestamp: new Date('2024-02-05'),
            comment: 'Initial claim submission',
            previousStatus: null,
            newStatus: ClaimStatus.UNDER_REVIEW,
          },
          {
            userId: payrollSpecialist?._id,
            action: 'approved',
            role: 'payroll_specialist',
            timestamp: new Date('2024-02-10'),
            comment: 'Claim approved. Full amount approved.',
            previousStatus: ClaimStatus.UNDER_REVIEW,
            newStatus: ClaimStatus.PENDING_MANAGER_APPROVAL,
          },
        ],
      },
      // Claim 3: Approved (for finance to test refund creation)
      {
        claimId: 'CLAIM-0003',
        description: 'Office supplies and equipment purchase',
        claimType: 'office_supplies',
        amount: 750,
        approvedAmount: 600, // Reduced amount
        employeeId: createdEmployees[0]._id, // John Doe
        status: ClaimStatus.APPROVED,
        payrollSpecialistId: payrollSpecialist?._id,
        payrollManagerId: payrollManager?._id,
        reviewedAt: new Date('2024-01-15'),
        managerApprovedAt: new Date('2024-01-17'),
        resolvedAt: new Date('2024-01-17'),
        submittedAt: new Date('2024-01-12'),
        resolutionComment: 'Claim approved with reduced amount due to missing receipts for some items.',
        approvalHistory: [
          {
            userId: createdEmployees[0]._id,
            action: 'submitted',
            role: 'employee',
            timestamp: new Date('2024-01-12'),
            comment: 'Initial claim submission',
            previousStatus: null,
            newStatus: ClaimStatus.UNDER_REVIEW,
          },
          {
            userId: payrollSpecialist?._id,
            action: 'approved',
            role: 'payroll_specialist',
            timestamp: new Date('2024-01-15'),
            comment: 'Approved with reduced amount due to missing receipts.',
            previousStatus: ClaimStatus.UNDER_REVIEW,
            newStatus: ClaimStatus.PENDING_MANAGER_APPROVAL,
          },
          {
            userId: payrollManager?._id,
            action: 'confirmed',
            role: 'payroll_manager',
            timestamp: new Date('2024-01-17'),
            comment: 'Manager approval confirmed. Proceed with refund.',
            previousStatus: ClaimStatus.PENDING_MANAGER_APPROVAL,
            newStatus: ClaimStatus.APPROVED,
          },
        ],
      },
      // Claim 4: Rejected (to test rejected flow)
      {
        claimId: 'CLAIM-0004',
        description: 'Personal meal expenses',
        claimType: 'meals',
        amount: 200,
        employeeId: createdEmployees[0]._id, // John Doe
        status: ClaimStatus.REJECTED,
        payrollSpecialistId: payrollSpecialist?._id,
        reviewedAt: new Date('2024-03-10'),
        resolvedAt: new Date('2024-03-10'),
        submittedAt: new Date('2024-03-08'),
        rejectionReason: 'Personal meal expenses are not reimbursable according to company policy.',
        approvalHistory: [
          {
            userId: createdEmployees[0]._id,
            action: 'submitted',
            role: 'employee',
            timestamp: new Date('2024-03-08'),
            comment: 'Initial claim submission',
            previousStatus: null,
            newStatus: ClaimStatus.UNDER_REVIEW,
          },
          {
            userId: payrollSpecialist?._id,
            action: 'rejected',
            role: 'payroll_specialist',
            timestamp: new Date('2024-03-10'),
            comment: 'Claim rejected. Personal expenses not covered.',
            previousStatus: ClaimStatus.UNDER_REVIEW,
            newStatus: ClaimStatus.REJECTED,
          },
        ],
      },
    ];

    const createdClaims: any[] = [];
    for (const claimData of claimsData) {
      const claim = new claimsModel(claimData);
      await claim.save();
      createdClaims.push(claim);
      console.log(`  ✅ Created claim: ${claimData.claimId} (${claimData.status})`);
    }

    // ==================== 9. Create Refunds ====================
    console.log('\n💰 Creating refunds...');

    // Get approved dispute and claim
    const approvedDispute = createdDisputes.find(d => d.disputeId === 'DISP-0003');
    const approvedClaim = createdClaims.find(c => c.claimId === 'CLAIM-0003');

    const refundsData = [
      // Refund 1: For approved dispute
      {
        disputeId: approvedDispute?._id,
        employeeId: createdEmployees[0]._id, // John Doe
        financeStaffId: financeStaff?._id,
        status: RefundStatus.PENDING,
        refundDetails: {
          description: 'Refund for approved dispute DISP-0003 - Penalty deduction correction',
          amount: 100, // The penalty amount that was incorrectly deducted
        },
      },
      // Refund 2: For approved claim
      {
        claimId: approvedClaim?._id,
        employeeId: createdEmployees[0]._id, // John Doe
        financeStaffId: financeStaff?._id,
        status: RefundStatus.PENDING,
        refundDetails: {
          description: 'Refund for approved claim CLAIM-0003 - Office supplies reimbursement',
          amount: 600, // The approved amount
        },
      },
    ];

    for (const refundData of refundsData) {
      if ((refundData.disputeId || refundData.claimId) && refundData.financeStaffId) {
        const refund = new refundsModel(refundData);
        await refund.save();
        console.log(`  ✅ Created refund: ${refundData.refundDetails.description.substring(0, 50)}...`);
      }
    }

    // ==================== Summary ====================
    console.log('\n✨ Seed process completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Departments created: ${createdDepartments.length}`);
    console.log(`  - Employees created: ${createdEmployees.length}`);
    console.log(`  - Payroll runs created: ${createdPayrollRuns.length}`);
    console.log(`  - Payslips created: ${payslipsData.length}`);
    console.log(`  - Disputes created: ${createdDisputes.length}`);
    console.log(`  - Claims created: ${createdClaims.length}`);
    console.log(`  - Refunds created: ${refundsData.filter(r => r.disputeId || r.claimId).length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('  Employee: john.doe@company.com / password123');
    console.log('  Specialist: sarah.smith@company.com / password123');
    console.log('  Manager: michael.johnson@company.com / password123');
    console.log('  Finance: emily.williams@company.com / password123');
    console.log('  Employee 2: david.brown@company.com / password123');
    console.log('\n🏢 Department IDs for Testing:');
    console.log(`  IT Department ID: ${itDepartment._id}`);
    console.log(`  HR Department ID: ${hrDepartment._id}`);
    console.log(`  Finance Department ID: ${finDepartment._id}`);
    console.log('\n💡 Use these Department IDs when testing the "Generate Department Payroll Report" endpoint:');
    console.log(`  - IT Department has: John Doe, David Brown`);
    console.log(`  - HR Department has: Sarah Smith, Michael Johnson`);
    console.log(`  - Finance Department has: Emily Williams`);
    console.log('\n📊 Test Data Overview:');
    console.log('  Disputes:');
    console.log('    - DISP-0001: Under Review (for specialist testing)');
    console.log('    - DISP-0002: Pending Manager Approval (for manager testing)');
    console.log('    - DISP-0003: Approved (for finance refund testing)');
    console.log('    - DISP-0004: Rejected (for rejected flow testing)');
    console.log('  Claims:');
    console.log('    - CLAIM-0001: Under Review (for specialist testing)');
    console.log('    - CLAIM-0002: Pending Manager Approval (for manager testing)');
    console.log('    - CLAIM-0003: Approved (for finance refund testing)');
    console.log('    - CLAIM-0004: Rejected (for rejected flow testing)');
    console.log('  Refunds:');
    console.log('    - Refund for DISP-0003: PENDING status');
    console.log('    - Refund for CLAIM-0003: PENDING status');

  } catch (error) {
    console.error('❌ Error during seed process:', error);
    throw error;
  } finally {
    await app.close();
  }
}

bootstrap();

