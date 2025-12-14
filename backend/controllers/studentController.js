const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marksheet = require('../models/Marksheet');
const Fee = require('../models/Fee');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');

const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .select('-password')
      .populate('academicDetails.course')
      .populate('preferredTeacher');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const { personalDetails, guardianDetails } = req.body;

    if (!personalDetails && !guardianDetails) {
      return res.status(400).json({ success: false, message: 'No data to update' });
    }

    const updateData = {};
    if (personalDetails) updateData.personalDetails = personalDetails;
    if (guardianDetails) updateData.guardianDetails = guardianDetails;

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: false }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', student });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { documentType } = req.body;
    const student = await Student.findById(req.user.id);

    student.documents.push({
      documentType,
      fileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadDate: new Date(),
    });

    await student.save();
    res.status(200).json({ success: true, message: 'Document uploaded', student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const attendance = await Attendance.find({ student: req.user.id })
      .populate('subject', 'subjectName')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await Attendance.countDocuments({ student: req.user.id });

    const presentDays = await Attendance.countDocuments({
      student: req.user.id,
      status: 'present',
    });
    const absentDays = await Attendance.countDocuments({
      student: req.user.id,
      status: 'absent',
    });
    const totalDays = await Attendance.countDocuments({ student: req.user.id });
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    res.status(200).json({
      success: true,
      attendance,
      stats: {
        presentDays,
        absentDays,
        totalDays,
        attendancePercentage: attendancePercentage.toFixed(2),
      },
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

const getStudentResults = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const results = await Marksheet.find({ student: req.user.id })
      .populate('subject', 'subjectName')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Marksheet.countDocuments({ student: req.user.id });

    let totalPoints = 0;
    let totalSubjects = 0;
    const publishedResults = results.filter((r) => r.isPublished);

    if (publishedResults.length > 0) {
      totalPoints = publishedResults.reduce((sum, r) => sum + (r.gradePoints || 0), 0);
      totalSubjects = publishedResults.length;
    }

    const cgpa = totalSubjects > 0 ? (totalPoints / totalSubjects).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      results,
      cgpa,
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

const getStudentFees = async (req, res) => {
  try {
    const fees = await Fee.findOne({ student: req.user.id });

    if (!fees) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    res.status(200).json({ success: true, fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const downloadMarksheet = async (req, res) => {
  try {
    const { marksheeetId } = req.params;
    const marksheet = await Marksheet.findById(marksheeetId).populate('student subject');

    if (!marksheet) {
      return res.status(404).json({ success: false, message: 'Marksheet not found' });
    }

    const PDFDocument = require('pdfkit');
    const fs = require('fs');
    const path = require('path');

    const doc = new PDFDocument();
    const fileName = `marksheet_${marksheet._id}.pdf`;
    const filePath = path.join(__dirname, '../uploads', fileName);

    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(20).text('Marksheet', { align: 'center' });
    doc.fontSize(12).text(`Student: ${marksheet.student.personalDetails.firstName}`, 50, 100);
    doc.text(`Subject: ${marksheet.subject.subjectName}`);
    doc.text(`Marks Obtained: ${marksheet.marksObtained}/${marksheet.totalMarks}`);
    doc.text(`Grade: ${marksheet.grade}`);
    doc.text(`Percentage: ${marksheet.percentage}%`);

    doc.end();

    doc.on('finish', () => {
      res.download(filePath);
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {
      $or: [
        { 'personalDetails.firstName': { $regex: search, $options: 'i' } },
        { 'personalDetails.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } },
      ],
    };

    const students = await Student.find(query)
      .select('-password')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      students,
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

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).select('-password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const student = await Student.findByIdAndUpdate(id, updateData, { new: true }).select('-password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, message: 'Student updated', student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ success: true, message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTeachersForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const teachers = await Teacher.find({ coursesAssigned: courseId })
      .populate('subjectsAssigned')
      .select('-password -studentsAssigned -timetable -experience -salary -documents');

    res.status(200).json({ 
      success: true, 
      teachers,
      courseId,
      courseName: course.courseName
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const selectPreferredTeacher = async (req, res) => {
  try {
    const { teacherId } = req.body;
    const studentId = req.user.id;

    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'Teacher ID is required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    student.preferredTeacher = teacherId;
    await student.save();

    if (!teacher.studentsAssigned.includes(studentId)) {
      teacher.studentsAssigned.push(studentId);
      await teacher.save();
    }

    res.status(200).json({ 
      success: true, 
      message: 'Teacher selected successfully',
      student: await Student.findById(studentId).populate('preferredTeacher')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const selectCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { 'academicDetails.course': courseId },
      { new: true }
    )
      .select('-password')
      .populate('academicDetails.course');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Course selected successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAvailableCourses = async (req, res) => {
  try {
    const courses = await Course.find().select('_id courseName courseCode description').sort({ courseName: 1 });
    
    if (!courses || courses.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No courses available',
        courses: [] 
      });
    }

    res.status(200).json({ 
      success: true, 
      courses 
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignedTimetable = async (req, res) => {
  try {
    const studentId = req.user.id;
    const StudentTimetable = require('../models/StudentTimetable');

    const timetable = await StudentTimetable.findOne({ student: studentId })
      .populate('teacher')
      .populate('course');

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'No timetable assigned yet' });
    }

    res.status(200).json({ 
      success: true, 
      timetable 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  uploadDocument,
  getStudentAttendance,
  getStudentResults,
  getStudentFees,
  downloadMarksheet,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getTeachersForCourse,
  selectPreferredTeacher,
  selectCourse,
  getAvailableCourses,
  getAssignedTimetable,
};
