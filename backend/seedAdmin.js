const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const Admin = require('./models/Admin');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await Admin.findOne({ email: 'admin@erp.com' });
    if (existingAdmin) {
      console.log('✅ Admin already exists: admin@erp.com');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = new Admin({
      adminId: `ADM${Date.now()}`,
      email: 'admin@erp.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '9876543210',
      role: 'superadmin',
      department: 'Administration',
      isActive: true,
    });

    await admin.save();

    console.log('✅ Admin account created successfully!');
    console.log('\n📋 Admin Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    admin@erp.com');
    console.log('Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔐 Change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
