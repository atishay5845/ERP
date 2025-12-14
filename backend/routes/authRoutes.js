const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const Course = require('../models/Course');

router.post('/register-student', authController.registerStudent);
router.post('/login-student', authController.loginStudent);
router.post('/login-teacher', authController.loginTeacher);
router.post('/login-admin', authController.loginAdmin);
router.get('/verify-token', authMiddleware, authController.verifyToken);

router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().select('_id name description');
    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
