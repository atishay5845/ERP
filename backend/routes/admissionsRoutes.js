const express = require('express');
const router = express.Router();
const admissionsController = require('../controllers/admissionsController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.post('/submit', admissionsController.submitAdmission);
router.post('/submit-application', authMiddleware, roleMiddleware(['student']), admissionsController.submitApplicationForPhase2);
router.get('/pending', authMiddleware, roleMiddleware(['admin', 'superadmin']), admissionsController.getPendingAdmissions);
router.get('/all', authMiddleware, roleMiddleware(['admin', 'superadmin']), admissionsController.getAllAdmissions);
router.get('/stats', authMiddleware, roleMiddleware(['admin', 'superadmin']), admissionsController.getAdmissionStats);
router.get('/:id', admissionsController.getAdmissionById);
router.put('/approve/:id', authMiddleware, roleMiddleware(['admin', 'superadmin']), admissionsController.approveAdmission);
router.put('/reject/:id', authMiddleware, roleMiddleware(['admin', 'superadmin']), admissionsController.rejectAdmission);

module.exports = router;
