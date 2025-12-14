const express = require('express');
const router = express.Router();

router.get('/summary', (req, res) => {
  const apiDocumentation = {
    version: '1.0.0',
    baseUrl: 'http://localhost:5000/api',
    lastUpdated: new Date().toISOString(),
    endpoints: {
      auth: {
        description: 'Authentication endpoints',
        endpoints: [
          {
            method: 'POST',
            path: '/auth/register-student',
            description: 'Register a new student',
            authentication: 'None',
            body: { email: 'string', password: 'string', name: 'string' }
          },
          {
            method: 'POST',
            path: '/auth/login-student',
            description: 'Login as student',
            authentication: 'None',
            body: { email: 'string', password: 'string' }
          },
          {
            method: 'POST',
            path: '/auth/login-teacher',
            description: 'Login as teacher',
            authentication: 'None',
            body: { email: 'string', password: 'string' }
          },
          {
            method: 'POST',
            path: '/auth/login-admin',
            description: 'Login as admin',
            authentication: 'None',
            body: { email: 'string', password: 'string' }
          },
          {
            method: 'GET',
            path: '/auth/verify-token',
            description: 'Verify JWT token',
            authentication: 'Required (Token)'
          },
          {
            method: 'GET',
            path: '/auth/courses',
            description: 'Get all available courses',
            authentication: 'None'
          }
        ]
      },
      admissions: {
        description: 'Admission management endpoints',
        endpoints: [
          {
            method: 'POST',
            path: '/admissions/submit',
            description: 'Submit initial admission form',
            authentication: 'None',
            body: { fullName: 'string', email: 'string', course: 'string' }
          },
          {
            method: 'POST',
            path: '/admissions/submit-application',
            description: 'Submit phase 2 application for admitted students',
            authentication: 'Required (Student)',
            body: { additionalInfo: 'string' }
          },
          {
            method: 'GET',
            path: '/admissions/pending',
            description: 'Get pending admissions',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'GET',
            path: '/admissions/all',
            description: 'Get all admissions',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'GET',
            path: '/admissions/stats',
            description: 'Get admission statistics',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'GET',
            path: '/admissions/:id',
            description: 'Get admission by ID',
            authentication: 'None'
          },
          {
            method: 'PUT',
            path: '/admissions/approve/:id',
            description: 'Approve an admission',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'PUT',
            path: '/admissions/reject/:id',
            description: 'Reject an admission',
            authentication: 'Required (Admin/Superadmin)'
          }
        ]
      },
      students: {
        description: 'Student profile and data endpoints',
        endpoints: [
          {
            method: 'GET',
            path: '/students/profile',
            description: 'Get current student profile',
            authentication: 'Required (Student)'
          },
          {
            method: 'PUT',
            path: '/students/profile',
            description: 'Update student profile',
            authentication: 'Required (Student)',
            body: { name: 'string', email: 'string', phone: 'string' }
          },
          {
            method: 'POST',
            path: '/students/upload-document',
            description: 'Upload document',
            authentication: 'Required (Student)',
            body: { document: 'file' }
          },
          {
            method: 'GET',
            path: '/students/attendance',
            description: 'Get student attendance records',
            authentication: 'Required (Student)'
          },
          {
            method: 'GET',
            path: '/students/results',
            description: 'Get student exam results',
            authentication: 'Required (Student)'
          },
          {
            method: 'GET',
            path: '/students/fees',
            description: 'Get student fee structure',
            authentication: 'Required (Student)'
          },
          {
            method: 'GET',
            path: '/students/marksheet/:marksheeetId/download',
            description: 'Download marksheet',
            authentication: 'Required (Student)'
          },
          {
            method: 'GET',
            path: '/students/timetable',
            description: 'Get assigned timetable',
            authentication: 'Required (Student)'
          },
          {
            method: 'GET',
            path: '/students/teachers/by-course/:courseId',
            description: 'Get teachers for a course',
            authentication: 'Required (Student)'
          },
          {
            method: 'POST',
            path: '/students/select-teacher',
            description: 'Select preferred teacher',
            authentication: 'Required (Student)',
            body: { teacherId: 'string', courseId: 'string' }
          },
          {
            method: 'GET',
            path: '/students/courses/available',
            description: 'Get available courses',
            authentication: 'Required (Student)'
          },
          {
            method: 'POST',
            path: '/students/select-course',
            description: 'Select a course',
            authentication: 'Required (Student)',
            body: { courseId: 'string' }
          },
          {
            method: 'GET',
            path: '/students',
            description: 'Get all students (Admin only)',
            authentication: 'Required (Admin)'
          },
          {
            method: 'GET',
            path: '/students/:id',
            description: 'Get student by ID (Admin only)',
            authentication: 'Required (Admin)'
          },
          {
            method: 'PUT',
            path: '/students/:id',
            description: 'Update student (Admin only)',
            authentication: 'Required (Admin)'
          },
          {
            method: 'DELETE',
            path: '/students/:id',
            description: 'Delete student (Admin only)',
            authentication: 'Required (Admin)'
          }
        ]
      },
      teachers: {
        description: 'Teacher profile and management endpoints',
        endpoints: [
          {
            method: 'GET',
            path: '/teacher/profile',
            description: 'Get current teacher profile',
            authentication: 'Required (Teacher)'
          },
          {
            method: 'PUT',
            path: '/teacher/profile',
            description: 'Update teacher profile',
            authentication: 'Required (Teacher)',
            body: { name: 'string', email: 'string', qualifications: 'string', photo: 'file' }
          },
          {
            method: 'POST',
            path: '/teacher/mark-attendance',
            description: 'Mark student attendance',
            authentication: 'Required (Teacher)',
            body: { studentId: 'string', date: 'string', status: 'string' }
          },
          {
            method: 'POST',
            path: '/teacher/mark-assigned-attendance',
            description: 'Mark attendance for assigned students',
            authentication: 'Required (Teacher)',
            body: { studentIds: 'array', date: 'string', status: 'array' }
          },
          {
            method: 'GET',
            path: '/teacher/attendance',
            description: 'Get attendance by subject',
            authentication: 'Required (Teacher)'
          },
          {
            method: 'POST',
            path: '/teacher/enter-marks',
            description: 'Enter student marks',
            authentication: 'Required (Teacher)',
            body: { studentId: 'string', marks: 'number', subjectId: 'string' }
          },
          {
            method: 'GET',
            path: '/teacher/timetable',
            description: 'Get teacher timetable',
            authentication: 'Required (Teacher)'
          },
          {
            method: 'POST',
            path: '/teacher/upload-lms',
            description: 'Upload LMS content',
            authentication: 'Required (Teacher)',
            body: { file: 'file', title: 'string', description: 'string' }
          },
          {
            method: 'GET',
            path: '/teacher/assigned-students',
            description: 'Get assigned students',
            authentication: 'Required (Teacher)'
          },
          {
            method: 'POST',
            path: '/teacher/create-student-timetable',
            description: 'Create student timetable',
            authentication: 'Required (Teacher)',
            body: { studentId: 'string', schedule: 'object' }
          },
          {
            method: 'GET',
            path: '/teacher/student-timetable/:studentId',
            description: 'Get student timetable',
            authentication: 'Required (Teacher)'
          },
          {
            method: 'PUT',
            path: '/teacher/student-timetable/:studentId',
            description: 'Update student timetable',
            authentication: 'Required (Teacher)',
            body: { schedule: 'object' }
          },
          {
            method: 'GET',
            path: '/teacher/student-attendance/:studentId',
            description: 'Get student attendance records',
            authentication: 'Required (Teacher)'
          },
          {
            method: 'GET',
            path: '/teacher/students/by-course-batch',
            description: 'Get students by course and batch',
            authentication: 'Required (Teacher)'
          },
          {
            method: 'GET',
            path: '/teachers',
            description: 'Get all teachers (Admin only)',
            authentication: 'Required (Admin)'
          },
          {
            method: 'GET',
            path: '/teachers/:id',
            description: 'Get teacher by ID (Admin only)',
            authentication: 'Required (Admin)'
          },
          {
            method: 'PUT',
            path: '/teachers/:id',
            description: 'Update teacher (Admin only)',
            authentication: 'Required (Admin)'
          },
          {
            method: 'DELETE',
            path: '/teachers/:id',
            description: 'Delete teacher (Admin only)',
            authentication: 'Required (Admin)'
          }
        ]
      },
      admin: {
        description: 'Admin management endpoints',
        endpoints: [
          {
            method: 'POST',
            path: '/admin/create-admin',
            description: 'Create new admin',
            authentication: 'Required (Admin/Superadmin)',
            body: { email: 'string', password: 'string', name: 'string' }
          },
          {
            method: 'GET',
            path: '/admin/admissions',
            description: 'Get all admissions',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'POST',
            path: '/admin/admission/:id/approve',
            description: 'Approve admission',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'POST',
            path: '/admin/admission/:id/reject',
            description: 'Reject admission',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'POST',
            path: '/admin/course/create',
            description: 'Create new course',
            authentication: 'Required (Admin/Superadmin)',
            body: { name: 'string', description: 'string', code: 'string' }
          },
          {
            method: 'GET',
            path: '/admin/courses',
            description: 'Get all courses',
            authentication: 'Required (Admin/Superadmin/Teacher)'
          },
          {
            method: 'POST',
            path: '/admin/subject/create',
            description: 'Create new subject',
            authentication: 'Required (Admin/Superadmin)',
            body: { name: 'string', courseId: 'string', code: 'string' }
          },
          {
            method: 'GET',
            path: '/admin/subjects',
            description: 'Get all subjects',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'POST',
            path: '/admin/teacher/create',
            description: 'Create new teacher',
            authentication: 'Required (Admin/Superadmin)',
            body: { email: 'string', password: 'string', name: 'string', qualifications: 'string' }
          },
          {
            method: 'GET',
            path: '/admin/teachers',
            description: 'Get all teachers',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'GET',
            path: '/admin/teacher/:id',
            description: 'Get teacher by ID',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'PUT',
            path: '/admin/teacher/:id',
            description: 'Update teacher',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'DELETE',
            path: '/admin/teacher/:id',
            description: 'Delete teacher',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'GET',
            path: '/admin/dashboard-stats',
            description: 'Get dashboard statistics',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'POST',
            path: '/admin/teacher/assign-course',
            description: 'Assign teacher to course',
            authentication: 'Required (Admin/Superadmin)',
            body: { teacherId: 'string', courseId: 'string' }
          },
          {
            method: 'POST',
            path: '/admin/teacher/remove-course',
            description: 'Remove teacher from course',
            authentication: 'Required (Admin/Superadmin)',
            body: { teacherId: 'string', courseId: 'string' }
          },
          {
            method: 'GET',
            path: '/admin/teachers/by-course/:courseId',
            description: 'Get teachers by course',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'GET',
            path: '/admin/course-teacher-assignments',
            description: 'Get all course-teacher assignments',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'GET',
            path: '/admin/students',
            description: 'Get all students',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'POST',
            path: '/admin/student/assign-teacher',
            description: 'Assign teacher to student',
            authentication: 'Required (Admin/Superadmin)',
            body: { studentId: 'string', teacherId: 'string' }
          },
          {
            method: 'DELETE',
            path: '/admin/student/:studentId/teacher',
            description: 'Remove teacher from student',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'GET',
            path: '/admin/attendance/statistics',
            description: 'Get attendance statistics',
            authentication: 'Required (Admin/Superadmin)'
          },
          {
            method: 'GET',
            path: '/admin/attendance/student-stats',
            description: 'Get student attendance statistics',
            authentication: 'Required (Admin/Superadmin)'
          }
        ]
      },
      attendance: {
        description: 'Attendance tracking endpoints',
        endpoints: [
          {
            method: 'POST',
            path: '/attendance/mark',
            description: 'Mark attendance',
            authentication: 'Required (Teacher/Admin)',
            body: { studentId: 'string', date: 'string', status: 'string' }
          },
          {
            method: 'GET',
            path: '/attendance/student/:studentId',
            description: 'Get student attendance',
            authentication: 'Required'
          },
          {
            method: 'GET',
            path: '/attendance/batch',
            description: 'Get batch attendance',
            authentication: 'Required (Teacher/Admin)'
          },
          {
            method: 'GET',
            path: '/attendance/low-attendance-alerts',
            description: 'Get low attendance alerts',
            authentication: 'Required (Admin)'
          },
          {
            method: 'POST',
            path: '/attendance/biometric',
            description: 'Mark attendance via biometric',
            authentication: 'Required'
          },
          {
            method: 'POST',
            path: '/attendance/rfid',
            description: 'Mark attendance via RFID',
            authentication: 'Required'
          },
          {
            method: 'PUT',
            path: '/attendance/:id',
            description: 'Update attendance',
            authentication: 'Required (Teacher/Admin)'
          },
          {
            method: 'DELETE',
            path: '/attendance/:id',
            description: 'Delete attendance record',
            authentication: 'Required (Admin)'
          }
        ]
      },
      exams: {
        description: 'Exam management endpoints',
        endpoints: [
          {
            method: 'POST',
            path: '/exams/create',
            description: 'Create new exam',
            authentication: 'Required (Admin/Teacher)',
            body: { name: 'string', date: 'string', totalMarks: 'number', courseId: 'string' }
          },
          {
            method: 'GET',
            path: '/exams',
            description: 'Get all exams',
            authentication: 'Required'
          },
          {
            method: 'GET',
            path: '/exams/:id',
            description: 'Get exam by ID',
            authentication: 'Required'
          },
          {
            method: 'PUT',
            path: '/exams/:id',
            description: 'Update exam',
            authentication: 'Required (Admin/Teacher)',
            body: { name: 'string', date: 'string', totalMarks: 'number' }
          },
          {
            method: 'DELETE',
            path: '/exams/:id',
            description: 'Delete exam',
            authentication: 'Required (Admin)'
          },
          {
            method: 'POST',
            path: '/exams/:examId/publish-results',
            description: 'Publish exam results',
            authentication: 'Required (Admin/Teacher)'
          },
          {
            method: 'GET',
            path: '/exams/:examId/results',
            description: 'Get exam results',
            authentication: 'Required (Admin/Teacher)'
          }
        ]
      },
      fees: {
        description: 'Fee management endpoints',
        endpoints: [
          {
            method: 'POST',
            path: '/fees/create',
            description: 'Create fee structure',
            authentication: 'Required (Admin)',
            body: { courseId: 'string', amount: 'number', dueDate: 'string' }
          },
          {
            method: 'POST',
            path: '/fees/payment',
            description: 'Record fee payment',
            authentication: 'Required (Admin/Student)',
            body: { studentId: 'string', amount: 'number', paymentMethod: 'string' }
          },
          {
            method: 'GET',
            path: '/fees/student/:studentId',
            description: 'Get student fees',
            authentication: 'Required (Student/Admin)'
          },
          {
            method: 'GET',
            path: '/fees',
            description: 'Get all fees',
            authentication: 'Required (Admin)'
          },
          {
            method: 'GET',
            path: '/fees/pending/all',
            description: 'Get pending fees',
            authentication: 'Required (Admin)'
          },
          {
            method: 'GET',
            path: '/fees/report/generate',
            description: 'Generate fee report',
            authentication: 'Required (Admin)'
          }
        ]
      },
      lms: {
        description: 'Learning Management System endpoints',
        endpoints: [
          {
            method: 'POST',
            path: '/lms/upload',
            description: 'Upload LMS content',
            authentication: 'Required (Teacher)',
            body: { file: 'file', title: 'string', description: 'string', courseId: 'string' }
          },
          {
            method: 'GET',
            path: '/lms/student/resources',
            description: 'Get student resources',
            authentication: 'Required (Student)'
          },
          {
            method: 'GET',
            path: '/lms',
            description: 'Get all LMS content',
            authentication: 'Required'
          },
          {
            method: 'GET',
            path: '/lms/:contentId',
            description: 'Get content by ID',
            authentication: 'Required'
          },
          {
            method: 'POST',
            path: '/lms/:contentId/submit-assignment',
            description: 'Submit assignment',
            authentication: 'Required (Student)',
            body: { file: 'file' }
          },
          {
            method: 'POST',
            path: '/lms/:contentId/:studentId/grade-assignment',
            description: 'Grade assignment',
            authentication: 'Required (Teacher)',
            body: { grade: 'number', feedback: 'string' }
          },
          {
            method: 'POST',
            path: '/lms/:contentId/submit-quiz',
            description: 'Submit quiz answers',
            authentication: 'Required (Student)',
            body: { answers: 'array' }
          },
          {
            method: 'GET',
            path: '/lms/:contentId/submissions',
            description: 'Get assignment submissions',
            authentication: 'Required (Teacher)'
          },
          {
            method: 'PUT',
            path: '/lms/:contentId',
            description: 'Update LMS content',
            authentication: 'Required (Teacher)',
            body: { title: 'string', description: 'string' }
          },
          {
            method: 'DELETE',
            path: '/lms/:contentId',
            description: 'Delete LMS content',
            authentication: 'Required (Teacher)'
          }
        ]
      },
      messages: {
        description: 'Messaging and notices endpoints',
        endpoints: [
          {
            method: 'POST',
            path: '/messages/contact',
            description: 'Send contact form',
            authentication: 'None',
            body: { name: 'string', email: 'string', message: 'string' }
          },
          {
            method: 'POST',
            path: '/messages/send',
            description: 'Send message',
            authentication: 'Required',
            body: { recipientId: 'string', subject: 'string', message: 'string' }
          },
          {
            method: 'GET',
            path: '/messages/received',
            description: 'Get received messages',
            authentication: 'Required'
          },
          {
            method: 'GET',
            path: '/messages/sent',
            description: 'Get sent messages',
            authentication: 'Required'
          },
          {
            method: 'PUT',
            path: '/messages/:messageId/read',
            description: 'Mark message as read',
            authentication: 'Required'
          },
          {
            method: 'DELETE',
            path: '/messages/:messageId',
            description: 'Delete message',
            authentication: 'Required'
          },
          {
            method: 'POST',
            path: '/messages/notice/create',
            description: 'Create notice',
            authentication: 'Required',
            body: { title: 'string', content: 'string' }
          },
          {
            method: 'GET',
            path: '/messages/notice',
            description: 'Get all notices',
            authentication: 'Required'
          },
          {
            method: 'PUT',
            path: '/messages/notice/:noticeId',
            description: 'Update notice',
            authentication: 'Required',
            body: { title: 'string', content: 'string' }
          },
          {
            method: 'DELETE',
            path: '/messages/notice/:noticeId',
            description: 'Delete notice',
            authentication: 'Required'
          }
        ]
      },
      timetable: {
        description: 'Timetable management endpoints',
        endpoints: [
          {
            method: 'POST',
            path: '/timetable/create',
            description: 'Create timetable',
            authentication: 'Required (Admin)',
            body: { batchId: 'string', schedule: 'object' }
          },
          {
            method: 'GET',
            path: '/timetable/batch',
            description: 'Get batch timetable',
            authentication: 'Required'
          },
          {
            method: 'GET',
            path: '/timetable',
            description: 'Get all timetables',
            authentication: 'Required'
          },
          {
            method: 'GET',
            path: '/timetable/:id',
            description: 'Get timetable by ID',
            authentication: 'Required'
          },
          {
            method: 'PUT',
            path: '/timetable/:id',
            description: 'Update timetable',
            authentication: 'Required (Admin/Teacher)',
            body: { schedule: 'object' }
          },
          {
            method: 'DELETE',
            path: '/timetable/:id',
            description: 'Delete timetable',
            authentication: 'Required (Admin)'
          }
        ]
      }
    },
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
      description: 'Include JWT token in Authorization header for protected endpoints'
    },
    errorCodes: {
      200: 'Success',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error'
    }
  };

  res.status(200).json(apiDocumentation);
});

module.exports = router;
