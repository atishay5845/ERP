const mongoose = require('mongoose');
const Course = require('./models/Course');

async function testCourses() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ums');
    const courses = await Course.find().select('_id courseName courseCode description').lean();
    console.log('Courses returned (with .lean()):');
    if(courses.length > 0) {
      console.log(JSON.stringify(courses[0], null, 2));
      console.log('Keys:', Object.keys(courses[0]));
    } else {
      console.log('No courses found');
    }
    
    const coursesNoLean = await Course.find().select('_id courseName courseCode description');
    console.log('\nCourses returned (without .lean()):');
    if(coursesNoLean.length > 0) {
      console.log(JSON.stringify(coursesNoLean[0].toObject ? coursesNoLean[0].toObject() : coursesNoLean[0], null, 2));
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

testCourses();
