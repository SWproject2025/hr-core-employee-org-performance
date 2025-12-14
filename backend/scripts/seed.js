// scripts/seed.js
// Run with: npm run seed

import { MongoClient } from 'mongodb';

// Load from environment or use defaults
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DATABASE_NAME = process.env.DATABASE_NAME || 'hr-main'; // ⚠️ CHANGE THIS

async function seed() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${DATABASE_NAME}\n`);

    const db = client.db(DATABASE_NAME);

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.collection('employee_profiles').deleteMany({});
    await db.collection('allowance').deleteMany({});
    await db.collection('signingbonus').deleteMany({});
    await db.collection('employeesigningbonus').deleteMany({});
    await db.collection('payrollruns').deleteMany({});
    console.log('✅ Collections cleared\n');

    // 1. Allowances
    console.log('💰 Creating allowances...');
    const allowances = await db.collection('allowance').insertMany([
      {
        name: 'Housing Allowance',
        amount: 2000,
        status: 'approved',
        approvedAt: new Date(),
      },
      {
        name: 'Transport Allowance',
        amount: 1000,
        status: 'approved',
        approvedAt: new Date(),
      },
      {
        name: 'Food Allowance',
        amount: 800,
        status: 'approved',
        approvedAt: new Date(),
      },
    ]);
    console.log(`✅ ${allowances.insertedCount} allowances created\n`);

    // 2. Signing Bonuses
    console.log('🎁 Creating signing bonuses...');
    const bonuses = await db.collection('signingbonus').insertMany([
      {
        positionName: 'Junior Software Engineer',
        amount: 5000,
        status: 'approved',
        approvedAt: new Date(),
      },
      {
        positionName: 'Senior Software Engineer',
        amount: 12000,
        status: 'approved',
        approvedAt: new Date(),
      },
    ]);
    const bonusIds = Object.values(bonuses.insertedIds);
    console.log(`✅ ${bonuses.insertedCount} signing bonuses created\n`);

    // 3. Employees
    console.log('👥 Creating employees...');
    const employees = [];
    const names = [
      'Ahmed Hassan',
      'Fatma Ibrahim',
      'Mohamed Khalil',
      'Sara Mansour',
      'Ali Sayed',
      'Nour Rashid',
      'Omar Nabil',
      'Mariam Fahmy',
      'Hassan Kamal',
      'Salma Mahmoud',
      'Youssef Ahmad',
      'Hana Zaki',
      'Khaled Fouad',
      'Layla Mustafa',
      'Tarek Omar',
      'Mona Salem',
      'Amr Adel',
      'Dina Yasser',
      'Karim Hany',
      'Yasmin Essam',
    ];

    for (let i = 0; i < 20; i++) {
      const [firstName, lastName] = names[i].split(' ');
      employees.push({
        employeeNumber: `EMP-${String(i + 1).padStart(4, '0')}`,
        nationalId: `${29900000000000 + i * 100000000000}`, // Unique Egyptian National ID
        firstName,
        lastName,
        email: `employee${i + 1}@company.com`,
        workEmail: `employee${i + 1}@company.com`,
        dateOfHire: new Date(2022, i % 12, (i % 28) + 1),
        status: 'ACTIVE',
        contractType: 'FULL_TIME_CONTRACT',
        workType: 'FULL_TIME',
        bankName: ['CIB', 'NBE', 'Banque Misr', 'AAIB'][i % 4],
        bankAccountNumber: `${1000000000 + i * 111111111}`,
        phoneNumber: `+2010${10000000 + i * 1234567}`,
        dateOfBirth: new Date(1985 + (i % 10), i % 12, (i % 28) + 1),
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        maritalStatus: ['SINGLE', 'MARRIED'][i % 2],
        statusEffectiveFrom: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const empResult = await db
      .collection('employee_profiles')
      .insertMany(employees);
    const employeeIds = Object.values(empResult.insertedIds);
    console.log(`✅ ${empResult.insertedCount} employees created\n`);

    // 4. Employee Signing Bonuses (5 pending approval)
    console.log('🎯 Creating employee signing bonuses...');
    const empBonuses = [];
    for (let i = 0; i < 5; i++) {
      empBonuses.push({
        employeeId: employeeIds[i],
        signingBonusId: bonusIds[i % bonusIds.length],
        givenAmount: i % 2 === 0 ? 5000 : 12000,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    const empBonusResult = await db
      .collection('employeesigningbonus')
      .insertMany(empBonuses);
    console.log(
      `✅ ${empBonusResult.insertedCount} employee signing bonuses created (pending approval)\n`,
    );

    // 5. Payroll Run
    console.log('📋 Creating payroll run...');
    await db.collection('payrollruns').insertOne({
      runId: `PR-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      payrollPeriod: new Date(2024, 11, 31),
      status: 'DRAFT',
      entity: 'Acme Corporation',
      employees: employees.length,
      exceptions: 0,
      totalnetpay: 0,
      payrollSpecialistId: employeeIds[0],
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ 1 payroll run created\n');

    console.log('═══════════════════════════════════════════');
    console.log('✅ ✅ ✅ SEEDING COMPLETE! ✅ ✅ ✅');
    console.log('═══════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`   • 20 Employees`);
    console.log(`   • 3 Allowances`);
    console.log(`   • 2 Signing Bonuses`);
    console.log(`   • 5 Employee Signing Bonuses (pending approval)`);
    console.log(`   • 1 Payroll Run (DRAFT status)`);
    console.log('\n🚀 You can now test your frontend!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

seed();
