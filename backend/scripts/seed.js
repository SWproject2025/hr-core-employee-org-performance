// scripts/seed.js
// Run with: npm run seed

import { MongoClient, ObjectId } from 'mongodb';

// Load from environment or use defaults
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'hr-main';

// ============================================
// DATA GENERATORS
// ============================================

const randomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
};

const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// ============================================
// REFERENCE DATA
// ============================================

const EGYPTIAN_DATA = {
  cities: [
    'Cairo',
    'Alexandria',
    'Giza',
    'Port Said',
    'Suez',
    'Luxor',
    'Aswan',
    'Mansoura',
    'Tanta',
    'Asyut',
    'Ismailia',
    'Faiyum',
  ],

  streets: [
    'Tahrir Street',
    'Ramses Street',
    'Salah Salem Street',
    'El Nasr Road',
    'El Haram Street',
    'Corniche El Nile',
    'Maadi Ring Road',
    'Mohandessin Street',
    'Zamalek Avenue',
    'Heliopolis Road',
    'Nasr City Boulevard',
    'October 6th Street',
  ],

  banks: [
    'National Bank of Egypt',
    'Banque Misr',
    'Commercial International Bank',
    'Arab African International Bank',
    'Egyptian Gulf Bank',
    'Banque du Caire',
    'QNB Alahli',
    'HSBC Egypt',
    'Bank Audi',
    'Credit Agricole Egypt',
  ],

  firstNames: {
    male: [
      'Ahmed',
      'Mohamed',
      'Mahmoud',
      'Ali',
      'Hassan',
      'Youssef',
      'Khaled',
      'Omar',
      'Ibrahim',
      'Amr',
      'Tarek',
      'Karim',
      'Hossam',
      'Sherif',
    ],
    female: [
      'Fatima',
      'Nour',
      'Maryam',
      'Layla',
      'Yasmin',
      'Sara',
      'Hana',
      'Amira',
      'Nadia',
      'Dina',
      'Salma',
      'Mariam',
      'Aya',
      'Noha',
    ],
  },

  lastNames: [
    'Hassan',
    'Mohamed',
    'Ali',
    'Ibrahim',
    'Khalil',
    'Mahmoud',
    'Farouk',
    'Nasser',
    'Salem',
    'Kamal',
    'Abdel-Rahman',
    'El-Sayed',
    'Mostafa',
    'Youssef',
    'Rashid',
    'Gamal',
    'Fouad',
    'Zaki',
    'Amin',
    'Fathy',
    'Saber',
    'Hakim',
    'Shaker',
    'Nabil',
  ],
};

const DEPARTMENTS = [
  { name: 'Engineering', code: 'ENG' },
  { name: 'Human Resources', code: 'HR' },
  { name: 'Finance', code: 'FIN' },
  { name: 'Marketing', code: 'MKT' },
  { name: 'Sales', code: 'SAL' },
  { name: 'Operations', code: 'OPS' },
];

const POSITIONS = [
  {
    title: 'Junior Software Engineer',
    level: 'Junior',
    department: 'Engineering',
  },
  { title: 'Software Engineer', level: 'Mid', department: 'Engineering' },
  {
    title: 'Senior Software Engineer',
    level: 'Senior',
    department: 'Engineering',
  },
  { title: 'Lead Engineer', level: 'Lead', department: 'Engineering' },
  { title: 'HR Specialist', level: 'Mid', department: 'Human Resources' },
  { title: 'HR Manager', level: 'Senior', department: 'Human Resources' },
  { title: 'Financial Analyst', level: 'Mid', department: 'Finance' },
  { title: 'Finance Manager', level: 'Senior', department: 'Finance' },
  { title: 'Marketing Coordinator', level: 'Junior', department: 'Marketing' },
  { title: 'Marketing Manager', level: 'Senior', department: 'Marketing' },
  { title: 'Sales Representative', level: 'Junior', department: 'Sales' },
  { title: 'Operations Manager', level: 'Senior', department: 'Operations' },
];

// ============================================
// EMPLOYEE GENERATOR
// ============================================

function generateEmployee(index, options = {}) {
  const {
    payGradeIds = [],
    departmentIds = [],
    positionIds = [],
    hasBankDetails = true,
  } = options;

  const isMale = index % 2 === 0;
  const firstName = randomElement(
    isMale ? EGYPTIAN_DATA.firstNames.male : EGYPTIAN_DATA.firstNames.female,
  );
  const lastName = randomElement(EGYPTIAN_DATA.lastNames);
  const fullName = `${firstName} ${lastName}`;

  // National ID (14 digits - Egyptian format)
  const birthYear = randomNumber(85, 99); // 1985-2000
  const nationalId = `2${birthYear}${String(randomNumber(1, 12)).padStart(2, '0')}${String(randomNumber(1, 35)).padStart(2, '0')}${String(randomNumber(10000, 99999))}${randomNumber(0, 9)}`;

  const employee = {
    // Core Identity
    employeeNumber: `EMP-${String(index + 1).padStart(4, '0')}`,
    nationalId,
    firstName,
    lastName,
    fullName,

    // Contact Information
    personalEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    workEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
    mobilePhone: `+2010${randomNumber(10000000, 99999999)}`,
    homePhone: `+202${randomNumber(20000000, 29999999)}`,

    // Address
    city: randomElement(EGYPTIAN_DATA.cities),
    streetAddress: `${randomNumber(1, 999)} ${randomElement(EGYPTIAN_DATA.streets)}`,
    country: 'Egypt',

    // Demographics
    dateOfBirth: new Date(1985 + (index % 15), index % 12, (index % 28) + 1),
    gender: isMale ? 'MALE' : 'FEMALE',
    maritalStatus: randomElement(['SINGLE', 'MARRIED', 'DIVORCED']),

    // Employment Details
    dateOfHire: randomDate(new Date('2018-01-01'), new Date('2023-12-31')),
    contractStartDate: randomDate(
      new Date('2018-01-01'),
      new Date('2023-12-31'),
    ),
    contractEndDate: null,
    contractType: randomElement(['PERMANENT', 'TEMPORARY', 'CONTRACT']),
    workType: index % 5 === 0 ? 'REMOTE' : 'FULL_TIME',
    status: index >= 18 ? 'INACTIVE' : 'ACTIVE', // Last 2 inactive
    statusEffectiveFrom: new Date(),

    // Banking Information (60% valid, 40% missing)
    ...(hasBankDetails
      ? {
          bankName: randomElement(EGYPTIAN_DATA.banks),
          bankAccountNumber: String(randomNumber(1000000000000, 9999999999999)),
        }
      : {
          bankName: null,
          bankAccountNumber: null,
        }),

    // Organizational Links
    payGradeId: payGradeIds.length > 0 ? randomElement(payGradeIds) : null,
    primaryDepartmentId:
      departmentIds.length > 0 ? randomElement(departmentIds) : null,
    primaryPositionId:
      positionIds.length > 0 ? randomElement(positionIds) : null,

    // Profile
    biography: `${fullName} is a dedicated professional with expertise in their field. Joined the company in ${new Date().getFullYear() - randomNumber(1, 5)}.`,
    profilePictureUrl: `https://i.pravatar.cc/150?u=${nationalId}`,

    // Timestamps
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return employee;
}

// ============================================
// EXCEPTION GENERATOR
// ============================================

function generateExceptions(employee, allEmployees) {
  const exceptions = [];

  // Missing bank details
  if (!employee.bankName || !employee.bankAccountNumber) {
    exceptions.push({
      type: 'BANK_DETAILS_MISSING',
      severity: 'HIGH',
      description: `Missing bank account details for ${employee.fullName}. Cannot process payment without valid banking information.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  // Random exceptions based on index
  const empIndex = allEmployees.indexOf(employee);

  if (empIndex % 7 === 0) {
    exceptions.push({
      type: 'ATTENDANCE_INCOMPLETE',
      severity: 'MEDIUM',
      description: `Attendance records incomplete for the current payroll period. ${randomNumber(2, 5)} days missing.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  if (empIndex % 11 === 0) {
    exceptions.push({
      type: 'SALARY_MISMATCH',
      severity: 'CRITICAL',
      description: `Salary calculation mismatch detected. Expected: ${randomNumber(8000, 15000)} EGP, Calculated: ${randomNumber(7000, 14000)} EGP. Manual review required.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  if (empIndex === 15) {
    exceptions.push({
      type: 'DUPLICATE_PAYMENT',
      severity: 'CRITICAL',
      description: `Possible duplicate payment detected. Previous payment from last month not reconciled.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  if (empIndex === 5) {
    exceptions.push({
      type: 'TAX_CALCULATION_ERROR',
      severity: 'HIGH',
      description: `Tax calculation error. Tax bracket information missing or incorrect. Unable to calculate accurate deductions.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  if (empIndex % 13 === 0 && employee.status === 'INACTIVE') {
    exceptions.push({
      type: 'INACTIVE_EMPLOYEE',
      severity: 'LOW',
      description: `Employee status is INACTIVE. Verify if they should be included in this payroll run.`,
      status: 'open',
      createdAt: new Date(),
    });
  }

  return exceptions;
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function seed() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${DATABASE_NAME}\n`);

    const db = client.db(DATABASE_NAME);

    // ============================================
    // CLEAR EXISTING DATA
    // ============================================
    console.log('🗑️  Clearing existing data...');
    await db.collection('employee_profiles').deleteMany({});
    await db.collection('departments').deleteMany({});
    await db.collection('positions').deleteMany({});
    await db.collection('allowance').deleteMany({});
    await db.collection('paygrade').deleteMany({});
    await db.collection('signingbonus').deleteMany({});
    await db.collection('employeesigningbonus').deleteMany({});
    await db.collection('payrollruns').deleteMany({});
    await db.collection('employeepayrolldetails').deleteMany({});
    await db.collection('employeepenalties').deleteMany({});
    console.log('✅ Collections cleared\n');

    // ============================================
    // 1. DEPARTMENTS
    // ============================================
    console.log('🏢 Creating departments...');
    const departmentDocs = DEPARTMENTS.map((dept) => ({
      name: dept.name,
      code: dept.code,
      description: `${dept.name} Department`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    const deptResult = await db
      .collection('departments')
      .insertMany(departmentDocs);
    const departmentIds = Object.values(deptResult.insertedIds);
    console.log(`✅ ${deptResult.insertedCount} departments created\n`);

    // ============================================
    // 2. POSITIONS
    // ============================================
    console.log('💼 Creating positions...');
    const positionDocs = POSITIONS.map((pos) => {
      const dept = DEPARTMENTS.find((d) => d.name === pos.department);
      const deptId = departmentIds[DEPARTMENTS.indexOf(dept)];

      return {
        title: pos.title,
        level: pos.level,
        departmentId: deptId,
        description: `${pos.title} position in ${pos.department}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
    const posResult = await db.collection('positions').insertMany(positionDocs);
    const positionIds = Object.values(posResult.insertedIds);
    console.log(`✅ ${posResult.insertedCount} positions created\n`);

    // ============================================
    // 3. ALLOWANCES
    // ============================================
    console.log('💰 Creating allowances...');
    const allowances = await db.collection('allowance').insertMany([
      {
        name: 'Housing Allowance',
        amount: 2000,
        taxable: true,
        status: 'approved',
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Transport Allowance',
        amount: 1000,
        taxable: true,
        status: 'approved',
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Food Allowance',
        amount: 800,
        taxable: false,
        status: 'approved',
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Communication Allowance',
        amount: 500,
        taxable: false,
        status: 'approved',
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const allowanceIds = Object.values(allowances.insertedIds);
    console.log(`✅ ${allowances.insertedCount} allowances created\n`);

    // ============================================
    // 4. PAY GRADES
    // ============================================
    console.log('💵 Creating pay grades...');
    const payGrades = await db.collection('paygrade').insertMany([
      {
        grade: 'Junior Level (L1)',
        baseSalary: 8000,
        grossSalary: 11800,
        status: 'approved',
        allowances: [allowanceIds[1], allowanceIds[2]], // Transport + Food
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        grade: 'Mid Level (L2)',
        baseSalary: 12000,
        grossSalary: 16300,
        status: 'approved',
        allowances: allowanceIds.slice(0, 3), // Housing + Transport + Food
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        grade: 'Senior Level (L3)',
        baseSalary: 18000,
        grossSalary: 23300,
        status: 'approved',
        allowances: allowanceIds, // All allowances
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        grade: 'Lead Level (L4)',
        baseSalary: 25000,
        grossSalary: 32300,
        status: 'approved',
        allowances: allowanceIds, // All allowances
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        grade: 'Manager Level (L5)',
        baseSalary: 35000,
        grossSalary: 42300,
        status: 'approved',
        allowances: allowanceIds, // All allowances
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const payGradeIds = Object.values(payGrades.insertedIds);
    console.log(`✅ ${payGrades.insertedCount} pay grades created\n`);

    // ============================================
    // 5. SIGNING BONUSES
    // ============================================
    console.log('🎁 Creating signing bonuses...');
    const bonuses = await db.collection('signingbonus').insertMany([
      {
        positionName: 'Junior Software Engineer',
        amount: 5000,
        status: 'approved',
        eligibilityCriteria: 'New hires in junior positions',
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        positionName: 'Software Engineer',
        amount: 8000,
        status: 'approved',
        eligibilityCriteria: 'New hires in mid-level positions',
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        positionName: 'Senior Software Engineer',
        amount: 12000,
        status: 'approved',
        eligibilityCriteria: 'New hires in senior positions',
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const bonusIds = Object.values(bonuses.insertedIds);
    console.log(`✅ ${bonuses.insertedCount} signing bonuses created\n`);

    // ============================================
    // 6. EMPLOYEES (20 with varied scenarios)
    // ============================================
    console.log('👥 Creating employees...');

    // Generate 20 employees with 60% valid bank, 40% missing bank
    const employees = [];
    for (let i = 0; i < 20; i++) {
      const hasBankDetails = i < 12; // First 12 have bank details
      const employee = generateEmployee(i, {
        payGradeIds,
        departmentIds,
        positionIds,
        hasBankDetails,
      });
      employees.push(employee);
    }

    const empResult = await db
      .collection('employee_profiles')
      .insertMany(employees);
    const employeeIds = Object.values(empResult.insertedIds);
    console.log(`✅ ${empResult.insertedCount} employees created`);
    console.log(
      `   • ${employees.filter((e) => e.bankName).length} with valid bank details`,
    );
    console.log(
      `   • ${employees.filter((e) => !e.bankName).length} with missing bank details\n`,
    );

    // ============================================
    // 7. EMPLOYEE SIGNING BONUSES
    // ============================================
    console.log('🎯 Creating employee signing bonuses...');
    const empBonuses = [];
    for (let i = 0; i < 7; i++) {
      empBonuses.push({
        employeeId: employeeIds[i],
        signingBonusId: bonusIds[i % bonusIds.length],
        givenAmount: [5000, 8000, 12000][i % 3],
        status: i < 3 ? 'pending' : i < 5 ? 'approved' : 'paid',
        paymentDate: i >= 5 ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    const empBonusResult = await db
      .collection('employeesigningbonus')
      .insertMany(empBonuses);
    console.log(
      `✅ ${empBonusResult.insertedCount} employee signing bonuses created`,
    );
    console.log(
      `   • ${empBonuses.filter((b) => b.status === 'pending').length} pending`,
    );
    console.log(
      `   • ${empBonuses.filter((b) => b.status === 'approved').length} approved`,
    );
    console.log(
      `   • ${empBonuses.filter((b) => b.status === 'paid').length} paid\n`,
    );

    // ============================================
    // 8. EMPLOYEE PENALTIES (for some employees)
    // ============================================
    console.log('⚠️  Creating employee penalties...');
    const penalties = [];
    for (let i = 0; i < 5; i++) {
      penalties.push({
        employeeId: employeeIds[i * 4],
        penalties: [
          {
            reason: 'Late arrival',
            amount: randomNumber(100, 300),
            date: randomDate(new Date('2024-12-01'), new Date('2024-12-15')),
          },
          {
            reason: 'Unauthorized absence',
            amount: randomNumber(200, 500),
            date: randomDate(new Date('2024-12-01'), new Date('2024-12-15')),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    const penaltyResult = await db
      .collection('employeepenalties')
      .insertMany(penalties);
    console.log(
      `✅ ${penaltyResult.insertedCount} employee penalties created\n`,
    );

    // ============================================
    // 9. PAYROLL RUN WITH EXCEPTIONS
    // ============================================
    console.log('📋 Creating payroll run...');

    const runId = `PR-2024-${randomNumber(1000, 9999)}`;
    const totalNetPay = employees.reduce((sum, emp) => {
      const grade =
        payGrades.insertedIds[Object.keys(payGrades.insertedIds)[0]];
      return sum + 15000; // Simplified
    }, 0);

    // Calculate exceptions
    const employeeExceptions = employees
      .map((emp) => ({
        employee: emp,
        exceptions: generateExceptions(emp, employees),
      }))
      .filter((e) => e.exceptions.length > 0);

    const payrollRun = {
      runId,
      payrollPeriod: new Date(2024, 11, 31), // December 2024
      status: 'DRAFT',
      entity: 'Acme Corporation Egypt',
      employees: employees.length,
      exceptions: employeeExceptions.length,
      totalnetpay: totalNetPay,
      payrollSpecialistId: employeeIds[0],
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('payrollruns').insertOne(payrollRun);
    console.log(`✅ 1 payroll run created (${runId})`);
    console.log(
      `   • ${employeeExceptions.length} employees with exceptions\n`,
    );

    // ============================================
    // 10. EMPLOYEE PAYROLL DETAILS
    // ============================================
    console.log('💼 Creating employee payroll details...');
    const payrollDetails = [];

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      const baseSalary = randomNumber(8000, 25000);
      const allowances = randomNumber(2000, 5000);
      const deductions = randomNumber(500, 2000);
      const netSalary = baseSalary + allowances - deductions;
      const bonus = i < 7 ? randomNumber(1000, 5000) : 0;
      const netPay = netSalary + bonus;

      payrollDetails.push({
        employeeId: employeeIds[i],
        payrollRunId: payrollRun._id,
        baseSalary,
        allowances,
        deductions,
        netSalary,
        netPay,
        bonus,
        bankStatus: emp.bankName ? 'valid' : 'missing',
        exceptions: !emp.bankName ? 'Missing bank details' : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await db.collection('employeepayrolldetails').insertMany(payrollDetails);
    console.log(`✅ ${payrollDetails.length} payroll details created\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ✅ ✅ SEEDING COMPLETE! ✅ ✅ ✅');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   • ${DEPARTMENTS.length} Departments`);
    console.log(`   • ${POSITIONS.length} Positions`);
    console.log(`   • ${allowances.insertedCount} Allowances`);
    console.log(`   • ${payGrades.insertedCount} Pay Grades`);
    console.log(`   • ${bonuses.insertedCount} Signing Bonuses`);
    console.log(`   • ${empResult.insertedCount} Employees`);
    console.log(
      `     - ${employees.filter((e) => e.bankName).length} with valid bank details`,
    );
    console.log(
      `     - ${employees.filter((e) => !e.bankName).length} with missing bank details`,
    );
    console.log(
      `     - ${employees.filter((e) => e.status === 'ACTIVE').length} active`,
    );
    console.log(
      `     - ${employees.filter((e) => e.status === 'INACTIVE').length} inactive`,
    );
    console.log(
      `   • ${empBonusResult.insertedCount} Employee Signing Bonuses`,
    );
    console.log(`   • ${penaltyResult.insertedCount} Employee Penalties`);
    console.log(`   • 1 Payroll Run (${runId})`);
    console.log(`     - Status: DRAFT`);
    console.log(
      `     - ${employeeExceptions.length} employees with exceptions`,
    );
    console.log(`   • ${payrollDetails.length} Payroll Details Records`);

    console.log('\n⚠️  Employees with Exceptions:');
    employeeExceptions.forEach(({ employee, exceptions }) => {
      console.log(`   • ${employee.fullName} (${employee.employeeNumber}):`);
      exceptions.forEach((exc) => {
        console.log(
          `     - [${exc.severity}] ${exc.type}: ${exc.description.substring(0, 80)}...`,
        );
      });
    });

    console.log('\n🚀 You can now test your frontend!');
    console.log(`   • Payroll Run ID: ${runId}`);
    console.log(
      `   • Test exception resolution with employees who have missing bank details\n`,
    );
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

seed();
