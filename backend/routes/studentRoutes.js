const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.get('/profile', authMiddleware, roleMiddleware(['student']), studentController.getStudentProfile);
router.put('/profile', authMiddleware, roleMiddleware(['student']), studentController.updateStudentProfile);
router.post('/upload-document', authMiddleware, roleMiddleware(['student']), upload.single('document'), studentController.uploadDocument);
router.get('/attendance', authMiddleware, roleMiddleware(['student']), studentController.getStudentAttendance);
router.get('/results', authMiddleware, roleMiddleware(['student']), studentController.getStudentResults);
router.get('/fees', authMiddleware, roleMiddleware(['student']), studentController.getStudentFees);
router.get('/marksheet/:marksheeetId/download', authMiddleware, roleMiddleware(['student']), studentController.downloadMarksheet);
router.get('/timetable', authMiddleware, roleMiddleware(['student']), studentController.getAssignedTimetable);
router.get('/teachers/by-course/:courseId', authMiddleware, roleMiddleware(['student']), studentController.getTeachersForCourse);
router.post('/select-teacher', authMiddleware, roleMiddleware(['student']), studentController.selectPreferredTeacher);
router.get('/courses/available', authMiddleware, roleMiddleware(['student']), studentController.getAvailableCourses);
router.post('/select-course', authMiddleware, roleMiddleware(['student']), studentController.selectCourse);

router.get('/', authMiddleware, roleMiddleware(['admin']), studentController.getAllStudents);
router.get('/:id', authMiddleware, roleMiddleware(['admin']), studentController.getStudentById);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), studentController.updateStudent);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), studentController.deleteStudent);

module.exports = router;
