const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Marksheet = require('../models/Marksheet');
const Timetable = require('../models/Timetable');
const LMS = require('../models/LMS');
const Student = require('../models/Student');
const StudentTimetable = require('../models/StudentTimetable');

const getTeacherProfile = async (req, res) => {
  try {
    console.log('=== getTeacherProfile Called ===');
    console.log('Authorization header:', req.headers.authorization?.substring(0, 20) + '...');
    console.log('Teacher ID from auth:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      console.log('ERROR: No user ID in request');
      return res.status(401).json({ success: false, message: 'Unauthorized - No user ID' });
    }

    console.log('Finding teacher with ID:', req.user.id);
    const teacher = await Teacher.findById(req.user.id)
      .populate('subjectsAssigned')
      .populate('coursesAssigned')
      .select('-password');

    if (!teacher) {
      console.log('ERROR: Teacher not found in database for ID:', req.user.id);
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    console.log('SUCCESS: Returning teacher profile');
    res.status(200).json({ success: true, teacher });
  } catch (error) {
    console.error('ERROR in getTeacherProfile:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.message
    });
  }
};

const updateTeacherProfile = async (req, res) => {
  try {
    console.log('=== updateTeacherProfile Called ===');
    console.log('Teacher ID:', req.user?.id);
    console.log('Body keys:', Object.keys(req.body));
    
    let { personalDetails, department, specialization } = req.body;
    
    if (typeof personalDetails === 'string') {
      personalDetails = JSON.parse(personalDetails);
    }
    
    if (typeof specialization === 'string') {
      specialization = JSON.parse(specialization);
    }

    console.log('Parsed personalDetails:', personalDetails);
    console.log('Parsed specialization:', specialization);

    const updateData = { department, specialization };

    if (personalDetails) {
      updateData.personalDetails = personalDetails;
    }

    if (req.file) {
      console.log('File uploaded:', req.file.filename);
      updateData.personalDetails = {
        ...updateData.personalDetails,
        photo: `/uploads/${req.file.filename}`
      };
    }

    console.log('Update data:', updateData);

    const teacher = await Teacher.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    )
      .select('-password')
      .populate('subjectsAssigned')
      .populate('coursesAssigned');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    console.log('SUCCESS: Profile updated');
    res.status(200).json({ success: true, message: 'Profile updated', teacher });
  } catch (error) {
    console.error('ERROR in updateTeacherProfile:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.message
    });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { students, date, subject, batch } = req.body;

    if (!students || !date || !subject) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const attendanceRecords = students.map((student) => ({
      student: student.studentId,
      subject,
      teacher: req.user.id,
      batch,
      date,
      status: student.status,
      markedBy: req.user.id,
    }));

    await Attendance.insertMany(attendanceRecords);

    res.status(201).json({ success: true, message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendanceBySubject = async (req, res) => {
  try {
    const { subject, batch } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = { teacher: req.user.id };
    if (subject) query.subject = subject;
    if (batch) query.batch = batch;

    const attendance = await Attendance.find(query)
      .populate('student', 'personalDetails admissionNumber')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      attendance,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const enterMarks = async (req, res) => {
  try {
    const { student, exam, subject, marksObtained, totalMarks } = req.body;

    if (!student || !exam || !subject || marksObtained === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let marksheet = await Marksheet.findOne({ student, exam, subject });

    if (marksheet) {
      marksheet.marksObtained = marksObtained;
      await marksheet.save();
    } else {
      marksheet = new Marksheet({
        student,
        exam,
        subject,
        marksObtained,
        totalMarks,
        createdBy: req.user.id,
      });
      await marksheet.save();
    }

    res.status(200).json({ success: true, message: 'Marks entered successfully', marksheet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTeacherTimetable = async (req, res) => {
  try {
    const timetables = await Timetable.findOne({ 'schedule.teacher': req.user.id });

    if (!timetables) {
      return res.status(404).json({ success: false, message: 'No timetable found' });
    }

    const teacherSchedule = timetables.schedule.filter((s) => s.teacher === req.user.id);

    res.status(200).json({ success: true, timetable: { ...timetables.toObject(), schedule: teacherSchedule } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadLMS = async (req, res) => {
  try {
    const { title, description, type, subject, batch, semester } = req.body;

    if (!req.file || !title || !type) {
      return res.status(400).json({ success: false, message: 'Missing required fields or file' });
    }

    const lms = new LMS({
      title,
      description,
      type,
      subject,
      uploadedBy: req.user.id,
      batch,
      semester,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
    });

    await lms.save();

    res.status(201).json({ success: true, message: 'LMS content uploaded', lms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllTeachers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {
      $or: [
        { 'personalDetails.firstName': { $regex: search, $options: 'i' } },
        { 'personalDetails.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ],
    };

    const teachers = await Teacher.find(query)
      .select('-password')
      .populate('subjectsAssigned')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Teacher.countDocuments(query);

    res.status(200).json({
      success: true,
      teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id).select('-password').populate('subjectsAssigned');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.status(200).json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const teacher = await Teacher.findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .populate('subjectsAssigned');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.status(200).json({ success: true, message: 'Teacher updated', teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.status(200).json({ success: true, message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignedStudents = async (req, res) => {
  try {
    console.log('=== getAssignedStudents Called ===');
    console.log('Teacher ID from auth:', req.user?.id);
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized - No user ID' });
    }

    const teacherId = req.user.id;

    const teacher = await Teacher.findById(teacherId).populate({
      path: 'studentsAssigned',
      select: '-password',
      populate: {
        path: 'academicDetails.course',
        select: 'courseName'
      }
    });

    console.log('Teacher found:', teacher ? 'YES' : 'NO');
    console.log('Students assigned:', teacher?.studentsAssigned?.length || 0);

    if (!teacher) {
      console.log('ERROR: Teacher not found');
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    console.log('SUCCESS: Returning assigned students');
    res.status(200).json({ 
      success: true, 
      students: teacher.studentsAssigned || [],
      totalStudents: teacher.studentsAssigned ? teacher.studentsAssigned.length : 0
    });
  } catch (error) {
    console.error('ERROR in getAssignedStudents:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: error.message
    });
  }
};

const createStudentTimetable = async (req, res) => {
  try {
    const { studentId, courseId, schedule, notes } = req.body;
    const teacherId = req.user.id;

    if (!studentId || !courseId) {
      return res.status(400).json({ success: false, message: 'Student ID and Course ID are required' });
    }

    if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ success: false, message: 'Schedule must be a non-empty array' });
    }

    for (let i = 0; i < schedule.length; i++) {
      if (!schedule[i].day || !schedule[i].startTime || !schedule[i].endTime) {
        return res.status(400).json({ success: false, message: `Schedule item ${i + 1} is missing required fields (day, startTime, endTime)` });
      }
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const actualCourseId = typeof courseId === 'object' ? courseId._id : courseId;

    let timetable = await StudentTimetable.findOne({ student: studentId, teacher: teacherId });

    if (timetable) {
      timetable.schedule = schedule;
      timetable.notes = notes || timetable.notes;
      timetable.updatedAt = new Date();
      await timetable.save();
    } else {
      timetable = new StudentTimetable({
        student: studentId,
        teacher: teacherId,
        course: actualCourseId,
        schedule,
        notes,
      });
      await timetable.save();

      student.assignedTimetable = timetable._id;
      await student.save();
    }

    const populatedTimetable = await StudentTimetable.findById(timetable._id)
      .populate('teacher')
      .populate('course')
      .populate('student');

    res.status(201).json({ 
      success: true, 
      message: 'Timetable created/updated successfully',
      timetable: populatedTimetable
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentTimetable = async (req, res) => {
  try {
    const { studentId } = req.params;
    const teacherId = req.user.id;

    const timetable = await StudentTimetable.findOne({ 
      student: studentId, 
      teacher: teacherId 
    })
      .populate('teacher')
      .populate('course')
      .populate('student');

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    res.status(200).json({ 
      success: true, 
      timetable 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStudentTimetable = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { schedule, notes } = req.body;
    const teacherId = req.user.id;

    const timetable = await StudentTimetable.findOne({ 
      student: studentId, 
      teacher: teacherId 
    });

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    if (schedule) timetable.schedule = schedule;
    if (notes) timetable.notes = notes;
    timetable.updatedAt = new Date();

    await timetable.save();

    const populatedTimetable = await StudentTimetable.findById(timetable._id)
      .populate('teacher')
      .populate('course')
      .populate('student');

    res.status(200).json({ 
      success: true, 
      message: 'Timetable updated successfully',
      timetable: populatedTimetable
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAssignedStudentAttendance = async (req, res) => {
  try {
    const { attendanceData, date } = req.body;
    const teacherId = req.user.id;

    if (!attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({ success: false, message: 'No attendance data provided' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const records = attendanceData.map(record => ({
      student: record.studentId,
      teacher: teacherId,
      date: new Date(date),
      status: record.status,
      remarks: record.remarks || '',
      markedBy: teacherId
    }));

    await Attendance.insertMany(records);

    res.status(201).json({ 
      success: true, 
      message: `Attendance marked for ${records.length} students`,
      recordsCount: records.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentAttendanceRecords = async (req, res) => {
  try {
    const { studentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const attendance = await Attendance.find({ student: studentId })
      .populate('teacher', 'personalDetails')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await Attendance.countDocuments({ student: studentId });
    const presentDays = await Attendance.countDocuments({
      student: studentId,
      status: 'present'
    });
    const absentDays = await Attendance.countDocuments({
      student: studentId,
      status: 'absent'
    });
    const leaveDays = await Attendance.countDocuments({
      student: studentId,
      status: 'leave'
    });

    res.status(200).json({
      success: true,
      attendance,
      stats: {
        presentDays,
        absentDays,
        leaveDays,
        totalDays: total,
        attendancePercentage: total > 0 ? ((presentDays / total) * 100).toFixed(2) : 0
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentsByCourseAndBatch = async (req, res) => {
  try {
    const { courseId, batch } = req.query;
    
    // IMMEDIATE LOGGING
    try {
        const fs = require('fs');
        const path = require('path');
        fs.writeFileSync(
            path.join(__dirname, '../DEBUG_ENTRY.log'), 
            `${new Date().toISOString()} - Entry: courseId=${courseId}, batch=${batch}\n`, 
            { flag: 'a' }
        );
    } catch(e) {}

    console.log('getStudentsByCourseAndBatch called with:', { courseId, batch });

    if (!courseId || !batch) {
      return res.status(400).json({ success: false, message: 'Course ID and batch are required' });
    }

    // Safety check for Student model
    if (!Student) {
        throw new Error('Student model is not defined/loaded correctly');
    }

    // Step 1: Find by Course Only (Explicit Cast)
    // REMOVED .select() to ensure we get EVERYTHING. Debugging "undefined" batch.
    const studentsInCourse = await Student.find({
      'academicDetails.course': new mongoose.Types.ObjectId(courseId)
    });

    console.log(`Found ${studentsInCourse.length} students in course ${courseId}`);

    // Step 2: Filter by Batch (Javascript filtering is more flexible/debuggable)
    const cleanBatch = batch.trim();
    const students = studentsInCourse.filter(s => {
        const sBatch = s.academicDetails?.batch; 
        return sBatch && sBatch.toString().trim() === cleanBatch;
    });

    console.log(`Filtered by batch '${cleanBatch}': ${students.length} remaining`);

    try {
        const fs = require('fs');
        const path = require('path');
        const firstStudent = studentsInCourse.length > 0 ? JSON.stringify(studentsInCourse[0].toObject(), null, 2) : "No students found";
        
        const logData = `
----------------------------------------
Date: ${new Date().toISOString()}
Req Course: ${courseId}
Req Batch: '${batch}'
Students in Course: ${studentsInCourse.length}
First Student Dump: ${firstStudent}
Final Count: ${students.length}
----------------------------------------
`;
        fs.writeFileSync(path.join(__dirname, '../DEBUG_INFO.log'), logData, { flag: 'a' });
    } catch (e) {
        // ignore
    }

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error('Error in getStudentsByCourseAndBatch:', error);
    try {
        const fs = require('fs');
        const path = require('path');
        fs.writeFileSync(
            path.join(__dirname, '../DEBUG_ERROR.log'), 
            `${new Date().toISOString()} - ${error.message}\n${error.stack}\n\n`, 
            { flag: 'a' }
        );
    } catch (e) {
        // ignore log error
    }

    // Return detailed error for debugging
    res.status(500).json({ 
        success: false, 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getTeacherProfile,
  updateTeacherProfile,
  markAttendance,
  getAttendanceBySubject,
  enterMarks,
  getTeacherTimetable,
  uploadLMS,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getAssignedStudents,
  createStudentTimetable,
  getStudentTimetable,
  updateStudentTimetable,
  markAssignedStudentAttendance,
  getStudentAttendanceRecords,
  getStudentsByCourseAndBatch,
};
