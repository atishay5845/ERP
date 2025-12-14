const Admin = require('../models/Admin');
const Admission = require('../models/Admission');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const bcrypt = require('bcryptjs');
const { sendTeacherCredentialsEmail } = require('../utils/mailer');

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminId = `ADMIN${Date.now()}`;

    const admin = new Admin({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      adminId,
      role: role || 'admin',
    });

    await admin.save();

    res.status(201).json({ success: true, message: 'Admin created successfully', admin: { ...admin.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAdmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';

    const query = status ? { status } : {};

    const admissions = await Admission.find(query)
      .populate('course', 'courseName')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Admission.countDocuments(query);

    res.status(200).json({
      success: true,
      admissions,
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

const approveAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const admission = await Admission.findById(id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    const admissionNumber = `ADM${Date.now()}`;
    const defaultPassword = generateRandomPassword();

    const student = new Student({
      email: admission.personalDetails.email,
      password: await bcrypt.hash(defaultPassword, 10),
      admissionNumber,
      personalDetails: {
        firstName: admission.personalDetails.firstName,
        lastName: admission.personalDetails.lastName,
        dob: admission.personalDetails.dob,
        gender: admission.personalDetails.gender,
        phone: admission.personalDetails.phone,
      },
      academicDetails: {
        course: admission.academicDetails.course,
        batch: admission.academicDetails.batch,
        enrollmentStatus: 'active',
      },
      guardianDetails: admission.guardianDetails,
    });

    await student.save();

    admission.admissionStatus = 'approved';
    admission.approvalDate = new Date();
    admission.admissionNumber = admissionNumber;
    admission.statusHistory.push({
      status: 'approved',
      changedBy: req.user.id,
      remarks: remarks || 'Admission approved'
    });

    await admission.save();

    res.status(200).json({ 
      success: true, 
      message: 'Admission approved successfully', 
      admission, 
      student: {
        ...student.toObject(),
        password: undefined
      },
      loginCredentials: {
        admissionNumber,
        temporaryPassword: defaultPassword
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const admission = await Admission.findByIdAndUpdate(id, { status: 'rejected', remarks }, { new: true });

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    res.status(200).json({ success: true, message: 'Admission rejected', admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCourse = async (req, res) => {
  try {
    const { 
      courseName, 
      courseCode, 
      department, 
      totalSemesters,
      description,
      duration,
      totalCredits,
      admissionCapacity,
      courseFee,
      eligibility
    } = req.body;

    if (!courseName || !courseCode || !department) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const course = new Course({
      courseName,
      courseCode,
      department,
      totalSemesters,
      description,
      duration,
      totalCredits,
      admissionCapacity,
      courseFee,
      eligibility
    });

    await course.save();

    res.status(201).json({ success: true, message: 'Course created', course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const courses = await Course.find()
      .populate('subjects')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments();

    res.status(200).json({
      success: true,
      courses,
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

const createSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName, credits, semester, department } = req.body;

    if (!subjectCode || !subjectName || !credits) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const subject = new Subject({
      subjectCode,
      subjectName,
      credits,
      semester,
      department,
    });

    await subject.save();

    res.status(201).json({ success: true, message: 'Subject created', subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllSubjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const subjects = await Subject.find()
      .populate('assignedTeacher', 'personalDetails employeeId')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Subject.countDocuments();

    res.status(200).json({
      success: true,
      subjects,
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

const createTeacher = async (req, res) => {
  try {
    const { 
      email, 
      firstName, 
      lastName, 
      department, 
      designation,
      phone,
      gender,
      dob,
      qualifications,
      specialization,
      subjectsAssigned
    } = req.body;

    if (!email || !firstName || !lastName || !department || !designation) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: email, firstName, lastName, department, designation' 
      });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const temporaryPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const employeeId = `TCH${Math.floor(Math.random() * 900000) + 100000}`;

    const teacher = new Teacher({
      email,
      password: hashedPassword,
      employeeId,
      personalDetails: {
        firstName,
        lastName,
        phone: phone || '',
        gender: gender || '',
        dob: dob || null,
        qualifications: qualifications || [],
      },
      department,
      designation,
      specialization: specialization || [],
      subjectsAssigned: subjectsAssigned || [],
      isActive: true,
    });

    await teacher.save();

    try {
      await sendTeacherCredentialsEmail(
        email,
        `${firstName} ${lastName}`,
        employeeId,
        temporaryPassword
      );
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Teacher account created and credentials sent to email',
      teacher: {
        ...teacher.toObject(),
        password: undefined,
      },
      temporaryPassword: temporaryPassword,
      employeeId: employeeId,
    });
  } catch (error) {
    console.error('Create teacher error:', error);
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
        { department: { $regex: search, $options: 'i' } },
      ],
    };

    const teachers = await Teacher.find(query)
      .select('-password')
      .populate('subjectsAssigned', 'subjectName subjectCode')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

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
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id)
      .select('-password')
      .populate('subjectsAssigned', 'subjectName subjectCode');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.status(200).json({ success: true, teacher });
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.password) {
      delete updateData.password;
    }

    const teacher = await Teacher.findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .populate('subjectsAssigned', 'subjectName subjectCode');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.status(200).json({ success: true, message: 'Teacher updated', teacher });
  } catch (error) {
    console.error('Update teacher error:', error);
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
    console.error('Delete teacher error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const pendingAdmissions = await Admission.countDocuments({ status: 'pending' });

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalSubjects,
        pendingAdmissions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const assignTeacherToCourse = async (req, res) => {
  try {
    const { teacherId, courseId } = req.body;

    if (!teacherId || !courseId) {
      return res.status(400).json({ success: false, message: 'Teacher ID and Course ID are required' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const courseIdStr = courseId.toString();
    const alreadyAssigned = teacher.coursesAssigned.some(id => id.toString() === courseIdStr);
    
    if (!alreadyAssigned) {
      teacher.coursesAssigned.push(courseId);
      await teacher.save();
    }

    res.status(200).json({ 
      success: true, 
      message: 'Teacher assigned to course successfully',
      teacher: await Teacher.findById(teacherId).populate('coursesAssigned')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeTeacherFromCourse = async (req, res) => {
  try {
    const { teacherId, courseId } = req.body;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const courseIdStr = courseId.toString();
    teacher.coursesAssigned = teacher.coursesAssigned.filter(id => id.toString() !== courseIdStr);
    await teacher.save();

    res.status(200).json({ 
      success: true, 
      message: 'Teacher removed from course',
      teacher: await Teacher.findById(teacherId).populate('coursesAssigned')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTeachersByCourseid = async (req, res) => {
  try {
    const { courseId } = req.params;

    const teachers = await Teacher.find({ coursesAssigned: courseId }).populate('coursesAssigned').select('-password');

    res.status(200).json({ 
      success: true, 
      teachers 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCourseTeachersAssignments = async (req, res) => {
  try {
    const courses = await Course.find().populate({
      path: 'subjects'
    });

    const assignments = await Promise.all(
      courses.map(async (course) => {
        const teachers = await Teacher.find({ coursesAssigned: course._id }).select('_id email personalDetails');
        return {
          courseId: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          teachers,
          teacherCount: teachers.length
        };
      })
    );

    res.status(200).json({ 
      success: true, 
      assignments 
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
      .populate('preferredTeacher', 'personalDetails email')
      .populate('academicDetails.course', 'courseName')
      .select('-password')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

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

const assignTeacherToStudent = async (req, res) => {
  try {
    const { studentId, teacherId } = req.body;

    if (!studentId || !teacherId) {
      return res.status(400).json({ success: false, message: 'Student ID and Teacher ID are required' });
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
      message: 'Teacher assigned to student successfully',
      student: await Student.findById(studentId).populate('preferredTeacher'),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeTeacherFromStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const teacherId = student.preferredTeacher;
    if (teacherId) {
      const teacher = await Teacher.findById(teacherId);
      if (teacher) {
        teacher.studentsAssigned = teacher.studentsAssigned.filter(id => id.toString() !== studentId);
        await teacher.save();
      }
    }

    student.preferredTeacher = null;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Teacher removed from student successfully',
      student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendanceStatistics = async (req, res) => {
  try {
    const { date, course, batchId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = {};
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'personalDetails admissionNumber email academicDetails')
      .populate('teacher', 'personalDetails')
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);
    const totalPresent = await Attendance.countDocuments({ ...query, status: 'present' });
    const totalAbsent = await Attendance.countDocuments({ ...query, status: 'absent' });
    const totalLeave = await Attendance.countDocuments({ ...query, status: 'leave' });
    const totalLate = await Attendance.countDocuments({ ...query, status: 'late' });

    const stats = {
      total,
      present: totalPresent,
      absent: totalAbsent,
      leave: totalLeave,
      late: totalLate,
      presentPercentage: total > 0 ? ((totalPresent / total) * 100).toFixed(2) : 0,
      absentPercentage: total > 0 ? ((totalAbsent / total) * 100).toFixed(2) : 0
    };

    res.status(200).json({
      success: true,
      attendance,
      stats,
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

const getStudentAttendanceStats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const students = await Student.find({
      $or: [
        { 'personalDetails.firstName': { $regex: search, $options: 'i' } },
        { 'personalDetails.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } }
      ]
    })
      .select('_id personalDetails admissionNumber email academicDetails')
      .limit(limit)
      .skip((page - 1) * limit);

    const studentStats = await Promise.all(
      students.map(async (student) => {
        const totalDays = await Attendance.countDocuments({ student: student._id });
        const presentDays = await Attendance.countDocuments({
          student: student._id,
          status: 'present'
        });
        const absentDays = await Attendance.countDocuments({
          student: student._id,
          status: 'absent'
        });
        const leaveDays = await Attendance.countDocuments({
          student: student._id,
          status: 'leave'
        });

        return {
          _id: student._id,
          personalDetails: student.personalDetails,
          admissionNumber: student.admissionNumber,
          email: student.email,
          academicDetails: student.academicDetails,
          attendanceStats: {
            totalDays,
            presentDays,
            absentDays,
            leaveDays,
            attendancePercentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0
          }
        };
      })
    );

    const total = await Student.countDocuments({
      $or: [
        { 'personalDetails.firstName': { $regex: search, $options: 'i' } },
        { 'personalDetails.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } }
      ]
    });

    res.status(200).json({
      success: true,
      students: studentStats,
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

module.exports = {
  createAdmin,
  getAdmissions,
  approveAdmission,
  rejectAdmission,
  createCourse,
  getAllCourses,
  createSubject,
  getAllSubjects,
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getDashboardStats,
  assignTeacherToCourse,
  removeTeacherFromCourse,
  getTeachersByCourseid,
  getCourseTeachersAssignments,
  getAllStudents,
  assignTeacherToStudent,
  removeTeacherFromStudent,
  getAttendanceStatistics,
  getStudentAttendanceStats,
};
