const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext)
  }
})

const upload = multer({ storage: storage });

router.get('/profile', authMiddleware, roleMiddleware(['teacher']), teacherController.getTeacherProfile);
router.put('/profile', authMiddleware, roleMiddleware(['teacher']), upload.single('photo'), teacherController.updateTeacherProfile);
router.post('/mark-attendance', authMiddleware, roleMiddleware(['teacher']), teacherController.markAttendance);
router.post('/mark-assigned-attendance', authMiddleware, roleMiddleware(['teacher']), teacherController.markAssignedStudentAttendance);
router.get('/attendance', authMiddleware, roleMiddleware(['teacher']), teacherController.getAttendanceBySubject);
router.post('/enter-marks', authMiddleware, roleMiddleware(['teacher']), teacherController.enterMarks);
router.get('/timetable', authMiddleware, roleMiddleware(['teacher']), teacherController.getTeacherTimetable);
router.post('/upload-lms', authMiddleware, roleMiddleware(['teacher']), upload.single('file'), teacherController.uploadLMS);
router.get('/assigned-students', authMiddleware, roleMiddleware(['teacher']), teacherController.getAssignedStudents);
router.post('/create-student-timetable', authMiddleware, roleMiddleware(['teacher']), teacherController.createStudentTimetable);
router.get('/student-timetable/:studentId', authMiddleware, roleMiddleware(['teacher']), teacherController.getStudentTimetable);
router.put('/student-timetable/:studentId', authMiddleware, roleMiddleware(['teacher']), teacherController.updateStudentTimetable);
router.get('/student-attendance/:studentId', authMiddleware, roleMiddleware(['teacher']), teacherController.getStudentAttendanceRecords);
router.get('/students/by-course-batch', authMiddleware, roleMiddleware(['teacher']), teacherController.getStudentsByCourseAndBatch);

router.get('/', authMiddleware, roleMiddleware(['admin']), teacherController.getAllTeachers);
router.get('/:id', authMiddleware, roleMiddleware(['admin']), teacherController.getTeacherById);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), teacherController.updateTeacher);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), teacherController.deleteTeacher);

module.exports = router;
