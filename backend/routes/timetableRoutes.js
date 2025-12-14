const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, roleMiddleware(['admin']), timetableController.createTimetable);
router.get('/batch', authMiddleware, timetableController.getTimetableByBatch);
router.get('/', authMiddleware, timetableController.getAllTimetables);
router.get('/:id', authMiddleware, timetableController.getTimetableById);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'teacher']), timetableController.updateTimetable);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), timetableController.deleteTimetable);

module.exports = router;
