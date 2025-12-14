const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const fixDatabase = async () => {
  try {
    await connectDB();

    console.log('🔧 Fixing database...\n');

    console.log('📋 Dropping admissions collection...');
    const db = mongoose.connection.db;
    
    try {
      await db.collection('admissions').drop();
      console.log('✅ Collection dropped!\n');
    } catch (err) {
      console.log('⏭️  Collection does not exist\n');
    }

    console.log('📝 Recreating with test data...\n');

    const Admission = require('./models/Admission');

    const testAdmissions = [
      {
        personalDetails: {
          firstName: 'Rahul',
          lastName: 'Sharma',
          email: 'rahul.sharma@example.com',
          phone: '9876543210',
          dob: new Date('2005-01-15'),
          gender: 'Male',
          bloodGroup: 'B+',
          nationality: 'Indian',
        },
        guardianDetails: {
          fatherName: 'Amit Sharma',
          fatherPhone: '9876543211',
          motherName: 'Kavya Sharma',
          motherPhone: '9876543212',
          primaryGuardian: 'Amit Sharma',
          guardianPhone: '9876543211',
          guardianEmail: 'amit.sharma@example.com',
          address: '123 Main Street, Delhi, India 110001',
        },
        academicDetails: {
          batch: '2025',
          previousSchool: 'ABC International School',
          previousBoard: 'CBSE',
          percentage: 95,
        },
      },
      {
        personalDetails: {
          firstName: 'Priya',
          lastName: 'Singh',
          email: 'priya.singh@example.com',
          phone: '9876543220',
          dob: new Date('2005-03-20'),
          gender: 'Female',
          bloodGroup: 'A+',
          nationality: 'Indian',
        },
        guardianDetails: {
          fatherName: 'Vikram Singh',
          fatherPhone: '9876543221',
          motherName: 'Neha Singh',
          motherPhone: '9876543222',
          primaryGuardian: 'Vikram Singh',
          guardianPhone: '9876543221',
          guardianEmail: 'vikram.singh@example.com',
          address: '456 Park Avenue, Mumbai, India 400001',
        },
        academicDetails: {
          batch: '2025',
          previousSchool: 'XYZ Public School',
          previousBoard: 'CBSE',
          percentage: 92,
        },
      },
    ];

    for (const data of testAdmissions) {
      const admission = new Admission(data);
      await admission.save();
      console.log(`✅ Created: ${data.personalDetails.firstName} ${data.personalDetails.lastName}`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database fixed with test admissions!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔓 Admin Login:');
    console.log('  Email: admin@erp.com');
    console.log('  Password: Admin@123\n');

    console.log('📱 Test Applications:');
    console.log('  1. rahul.sharma@example.com');
    console.log('  2. priya.singh@example.com\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixDatabase();
