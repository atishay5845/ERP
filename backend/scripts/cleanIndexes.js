const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const cleanIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ums', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🔍 Dropping all indexes...');
    
    const studentCollection = mongoose.connection.collection('students');
    const admissionCollection = mongoose.connection.collection('admissions');

    try {
      await studentCollection.dropIndexes();
      console.log('✅ Student collection indexes dropped');
    } catch (err) {
      console.log('⚠️ Student collection index drop:', err.message);
    }

    try {
      await admissionCollection.dropIndexes();
      console.log('✅ Admission collection indexes dropped');
    } catch (err) {
      console.log('⚠️ Admission collection index drop:', err.message);
    }

    console.log('\n🧹 Deleting all documents (fresh start)...');
    
    const studentDeleteResult = await studentCollection.deleteMany({});
    console.log(`✅ Deleted ${studentDeleteResult.deletedCount} student documents`);

    const admissionDeleteResult = await admissionCollection.deleteMany({});
    console.log(`✅ Deleted ${admissionDeleteResult.deletedCount} admission documents`);

    console.log('\n🔄 Rebuilding indexes...');
    
    const Student = require('../models/Student');
    const Admission = require('../models/Admission');

    await Student.syncIndexes();
    console.log('✅ Student indexes recreated');

    await Admission.syncIndexes();
    console.log('✅ Admission indexes recreated');

    console.log('\n✨ Database cleanup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

cleanIndexes();
