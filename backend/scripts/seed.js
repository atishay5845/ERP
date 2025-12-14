const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);

    let studentCount = 0;
    let teacherCount = 0;
    let adminCount = 0;

    const student = await Student.findOne({ email: 'student@test.com' });
    if (!student) {
      await Student.create({
        email: 'student@test.com',
        password: hashedPassword,
        mobileNumber: '9876543210',
        admissionNumber: 'ADM001',
        personalDetails: {
          firstName: 'John',
          lastName: 'Doe',
        },
        applicationSubmitted: true,
        courseApplyingFor: 'B.Tech',
      });
      studentCount++;
      console.log('✅ Student created');
      console.log('   Email: student@test.com');
      console.log('   Admission Number: ADM001');
      console.log('   Password: password123');
    } else {
      console.log('⏭️  Student already exists');
    }

    const teacher = await Teacher.findOne({ email: 'teacher@test.com' });
    if (!teacher) {
      await Teacher.create({
        email: 'teacher@test.com',
        password: hashedPassword,
        employeeId: 'EMP001',
        personalDetails: {
          firstName: 'Jane',
          lastName: 'Smith',
        },
        department: 'Computer Science',
        designation: 'Assistant Professor',
        isActive: true,
      });
      teacherCount++;
      console.log('✅ Teacher created');
      console.log('   Email: teacher@test.com');
      console.log('   Employee ID: EMP001');
      console.log('   Password: password123');
    } else {
      console.log('⏭️  Teacher already exists');
    }

    const admin = await Admin.findOne({ email: 'admin@erp.com' });
    if (!admin) {
      await Admin.create({
        email: 'admin@erp.com',
        password: hashedAdminPassword,
        adminId: 'ADMIN001',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'superadmin',
        isActive: true,
      });
      adminCount++;
      console.log('✅ Admin created');
      console.log('   Email: admin@erp.com');
      console.log('   Password: Admin@123');
    } else {
      console.log('⏭️  Admin already exists');
    }

    console.log('\n🎉 Seeding completed!');
    console.log(`Created: ${studentCount + teacherCount + adminCount} accounts\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
