const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, roleMiddleware(['admin', 'teacher']), examController.createExam);
router.get('/', authMiddleware, examController.getAllExams);
router.get('/:id', authMiddleware, examController.getExamById);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'teacher']), examController.updateExam);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), examController.deleteExam);
router.post('/:examId/publish-results', authMiddleware, roleMiddleware(['admin', 'teacher']), examController.publishResults);
router.get('/:examId/results', authMiddleware, roleMiddleware(['admin', 'teacher']), examController.getExamResults);

module.exports = router;
