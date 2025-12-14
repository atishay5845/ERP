const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Admission = require('./models/Admission');

dotenv.config();

const checkAdmissions = async () => {
  try {
    await connectDB();

    const count = await Admission.countDocuments();
    console.log(`\n📊 Total Admissions in Database: ${count}\n`);

    if (count === 0) {
      console.log('❌ No admissions found!');
      console.log('\n✅ To add a test admission, run: node seedAdmission.js\n');
    } else {
      console.log('📋 Recent Admissions:\n');
      const admissions = await Admission.find()
        .sort({ appliedDate: -1 })
        .limit(5)
        .select('personalDetails admissionStatus appliedDate');

      admissions.forEach((adm, idx) => {
        console.log(
          `${idx + 1}. ${adm.personalDetails.firstName} ${adm.personalDetails.lastName}`
        );
        console.log(`   Email: ${adm.personalDetails.email}`);
        console.log(`   Status: ${adm.admissionStatus}`);
        console.log(`   Applied: ${new Date(adm.appliedDate).toLocaleDateString()}\n`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAdmissions();
