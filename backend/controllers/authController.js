const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Admin = require('../models/Admin');

const generateToken = (user, role) => {
  return jwt.sign(
    { id: user._id, email: user.email, role },
    process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const registerStudent = async (req, res) => {
  try {
    const { email, password, name, mobile, courseApplyingFor } = req.body;

    if (!email || !password || !name || !mobile) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || 'N/A';

    const student = new Student({
      email,
      password: hashedPassword,
      mobileNumber: mobile,
      courseApplyingFor: courseApplyingFor || '',
      applicationSubmitted: false,
      personalDetails: {
        firstName,
        lastName,
      },
    });

    await student.save();

    const token = generateToken(student, 'student');

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email and complete your application form to proceed.',
      token,
      user: {
        id: student._id,
        email: student.email,
        role: 'student',
        name: name,
        applicationSubmitted: false,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginStudent = async (req, res) => {
  try {
    const { admissionNumber, password } = req.body;

    if (!admissionNumber || !password) {
      return res.status(400).json({ success: false, message: 'Admission number and password required' });
    }

    const student = await Student.findOne({ admissionNumber });
    if (!student) {
      return res.status(400).json({ success: false, message: 'Invalid credentials - Please check your admission number' });
    }

    if (!student.admissionNumber) {
      return res.status(400).json({ success: false, message: 'Your admission is not approved yet. Please wait for admin approval.' });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(student, 'student');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: student._id,
        email: student.email,
        role: 'student',
        admissionNumber: student.admissionNumber,
        applicationSubmitted: student.applicationSubmitted,
        name: `${student.personalDetails.firstName} ${student.personalDetails.lastName}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginTeacher = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({ success: false, message: 'Teacher ID and password required' });
    }

    const teacher = await Teacher.findOne({ employeeId });
    if (!teacher) {
      return res.status(400).json({ success: false, message: 'Invalid credentials - Please check your Teacher ID' });
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(teacher, 'teacher');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: teacher._id,
        email: teacher.email,
        role: 'teacher',
        employeeId: teacher.employeeId,
        name: `${teacher.personalDetails.firstName} ${teacher.personalDetails.lastName}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(admin, admin.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        adminId: admin.adminId,
        name: `${admin.firstName} ${admin.lastName}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyToken = async (req, res) => {
  try {
    const { role, id } = req.user;
    
    let userModel;
    if (role === 'student') {
      userModel = Student;
    } else if (role === 'teacher') {
      userModel = Teacher;
    } else if (role === 'admin' || role === 'superadmin') {
      userModel = Admin;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let userData = {
      id: user._id,
      email: user.email,
      role: role
    };
    
    if (role === 'student') {
      userData = {
        ...userData,
        admissionNumber: user.admissionNumber,
        applicationSubmitted: user.applicationSubmitted,
        name: `${user.personalDetails.firstName} ${user.personalDetails.lastName}`,
      };
    } else if (role === 'teacher') {
      userData = {
        ...userData,
        employeeId: user.employeeId,
        name: `${user.personalDetails.firstName} ${user.personalDetails.lastName}`,
      };
    } else if (role === 'admin' || role === 'superadmin') {
      userData = {
        ...userData,
        adminId: user.adminId,
        name: `${user.firstName} ${user.lastName}`,
      };
    }
    
    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerStudent,
  loginStudent,
  loginTeacher,
  loginAdmin,
  verifyToken,
};
