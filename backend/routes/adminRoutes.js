const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.post('/create-admin', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.createAdmin);

router.get('/admissions', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.getAdmissions);
router.post('/admission/:id/approve', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.approveAdmission);
router.post('/admission/:id/reject', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.rejectAdmission);

router.post('/course/create', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.createCourse);
router.get('/courses', authMiddleware, roleMiddleware(['admin', 'superadmin', 'teacher']), adminController.getAllCourses);

router.post('/subject/create', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.createSubject);
router.get('/subjects', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.getAllSubjects);

router.post('/teacher/create', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.createTeacher);
router.get('/teachers', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.getAllTeachers);
router.get('/teacher/:id', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.getTeacherById);
router.put('/teacher/:id', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.updateTeacher);
router.delete('/teacher/:id', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.deleteTeacher);

router.get('/dashboard-stats', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.getDashboardStats);

router.post('/teacher/assign-course', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.assignTeacherToCourse);
router.post('/teacher/remove-course', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.removeTeacherFromCourse);
router.get('/teachers/by-course/:courseId', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.getTeachersByCourseid);
router.get('/course-teacher-assignments', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.getCourseTeachersAssignments);

router.get('/students', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.getAllStudents);
router.post('/student/assign-teacher', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.assignTeacherToStudent);
router.delete('/student/:studentId/teacher', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.removeTeacherFromStudent);

router.get('/attendance/statistics', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.getAttendanceStatistics);
router.get('/attendance/student-stats', authMiddleware, roleMiddleware(['admin', 'superadmin']), adminController.getStudentAttendanceStats);

module.exports = router;
