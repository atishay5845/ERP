const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Admission = require('./models/Admission');

dotenv.config();

const seedAdmission = async () => {
  try {
    await connectDB();

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
      {
        personalDetails: {
          firstName: 'Amit',
          lastName: 'Kumar',
          email: 'amit.kumar@example.com',
          phone: '9876543230',
          dob: new Date('2005-05-10'),
          gender: 'Male',
          bloodGroup: 'O+',
          nationality: 'Indian',
        },
        guardianDetails: {
          fatherName: 'Rajesh Kumar',
          fatherPhone: '9876543231',
          motherName: 'Anjali Kumar',
          motherPhone: '9876543232',
          primaryGuardian: 'Rajesh Kumar',
          guardianPhone: '9876543231',
          guardianEmail: 'rajesh.kumar@example.com',
          address: '789 Oak Lane, Bangalore, India 560001',
        },
        academicDetails: {
          batch: '2025',
          previousSchool: 'PQR Academy',
          previousBoard: 'ISC',
          percentage: 88,
        },
      },
    ];

    let createdCount = 0;

    for (const admissionData of testAdmissions) {
      const existing = await Admission.findOne({
        'personalDetails.email': admissionData.personalDetails.email,
      });

      if (!existing) {
        const admission = new Admission(admissionData);
        await admission.save();
        createdCount++;
        console.log(`✅ Created: ${admissionData.personalDetails.firstName} ${admissionData.personalDetails.lastName}`);
      } else {
        console.log(`⏭️  Skipped: ${admissionData.personalDetails.email} (already exists)`);
      }
    }

    console.log(`\n✅ ${createdCount} new test admissions created!\n`);
    console.log('📋 Admin Dashboard URL: http://localhost:3000/login\n');
    console.log('Login with:');
    console.log('  Email: admin@erp.com');
    console.log('  Password: Admin@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmission();
