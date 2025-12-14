const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

const markAttendance = async (req, res) => {
  try {
    const { student, subject, batch, date, status, remarks, biometricId, rfidId } = req.body;

    if (!student || !date || !status) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let attendance = await Attendance.findOne({
      student,
      date: new Date(date).toDateString(),
    });

    if (!attendance) {
      attendance = new Attendance({
        student,
        subject,
        batch,
        date,
        status,
        remarks,
        biometricId,
        rfidId,
        markedBy: req.user.id,
      });
    } else {
      attendance.status = status;
      attendance.remarks = remarks;
    }

    await attendance.save();

    res.status(200).json({ success: true, message: 'Attendance marked', attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const attendance = await Attendance.find({ student: studentId })
      .populate('subject', 'subjectName')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const presentDays = await Attendance.countDocuments({
      student: studentId,
      status: 'present',
    });
    const absentDays = await Attendance.countDocuments({
      student: studentId,
      status: 'absent',
    });
    const totalDays = await Attendance.countDocuments({ student: studentId });
    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    const total = await Attendance.countDocuments({ student: studentId });

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

const getBatchAttendance = async (req, res) => {
  try {
    const { batch, date } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = { batch };
    if (date) {
      query.date = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000) };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'personalDetails admissionNumber')
      .populate('subject', 'subjectName')
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

const getLowAttendanceAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 75;

    const students = await Student.find();

    const alerts = [];

    for (const student of students) {
      const totalDays = await Attendance.countDocuments({ student: student._id });
      const presentDays = await Attendance.countDocuments({
        student: student._id,
        status: 'present',
      });

      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

      if (attendancePercentage < threshold) {
        alerts.push({
          student: student._id,
          studentName: `${student.personalDetails.firstName} ${student.personalDetails.lastName}`,
          admissionNumber: student.admissionNumber,
          attendancePercentage: attendancePercentage.toFixed(2),
          presentDays,
          totalDays,
        });
      }
    }

    res.status(200).json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const biometricMarkAttendance = async (req, res) => {
  try {
    const { biometricId, date } = req.body;

    if (!biometricId || !date) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let attendance = await Attendance.findOne({
      biometricId,
      date: new Date(date).toDateString(),
    });

    if (!attendance) {
      attendance = new Attendance({
        biometricId,
        date,
        status: 'present',
      });
      await attendance.save();
    }

    res.status(200).json({ success: true, message: 'Attendance marked via biometric', attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rfidMarkAttendance = async (req, res) => {
  try {
    const { rfidId, date } = req.body;

    if (!rfidId || !date) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let attendance = await Attendance.findOne({
      rfidId,
      date: new Date(date).toDateString(),
    });

    if (!attendance) {
      attendance = new Attendance({
        rfidId,
        date,
        status: 'present',
      });
      await attendance.save();
    }

    res.status(200).json({ success: true, message: 'Attendance marked via RFID', attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(id, { status, remarks }, { new: true })
      .populate('student', 'personalDetails')
      .populate('subject', 'subjectName');

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.status(200).json({ success: true, message: 'Attendance updated', attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.status(200).json({ success: true, message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getBatchAttendance,
  getLowAttendanceAlerts,
  biometricMarkAttendance,
  rfidMarkAttendance,
  updateAttendance,
  deleteAttendance,
};
