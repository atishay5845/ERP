const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.post('/mark', authMiddleware, roleMiddleware(['teacher', 'admin']), attendanceController.markAttendance);
router.get('/student/:studentId', authMiddleware, attendanceController.getStudentAttendance);
router.get('/batch', authMiddleware, roleMiddleware(['teacher', 'admin']), attendanceController.getBatchAttendance);
router.get('/low-attendance-alerts', authMiddleware, roleMiddleware(['admin']), attendanceController.getLowAttendanceAlerts);
router.post('/biometric', authMiddleware, attendanceController.biometricMarkAttendance);
router.post('/rfid', authMiddleware, attendanceController.rfidMarkAttendance);
router.put('/:id', authMiddleware, roleMiddleware(['teacher', 'admin']), attendanceController.updateAttendance);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), attendanceController.deleteAttendance);

module.exports = router;
