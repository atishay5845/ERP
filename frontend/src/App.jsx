import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';

// Import Pages
import ModernLandingPage from './pages/ModernLandingPage';
import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import TeacherLogin from './pages/TeacherLogin';
import AdminLogin from './pages/AdminLogin';
import ApplicationFormPage from './pages/ApplicationFormPage';
import AdmissionManagement from './pages/AdmissionManagement';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminTeachersPage from './pages/AdminTeachersPage';
import AdminSubjectsPage from './pages/AdminSubjectsPage';
import AdminAttendancePanel from './pages/AdminAttendancePanel';
import AdminFeesManagement from './pages/AdminFeesManagement';
import FeesPage from './pages/FeesPage';
import AttendancePage from './pages/AttendancePage';
import ExamsPage from './pages/ExamsPage';
import LMSPage from './pages/LMSPage';
import MessagesPage from './pages/MessagesPage';
import TimetablePage from './pages/TimetablePage';
import StudentProfile from './pages/StudentProfile';
import NoticesPage from './pages/NoticesPage';
import StudentRegistrationFlow from './pages/StudentRegistrationFlow';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminCoursesManagement from './pages/AdminCoursesManagement';
import AdminExamsPage from './pages/AdminExamsPage';
import TeacherResourcesPage from './pages/TeacherResourcesPage';
import TeacherAttendancePage from './pages/TeacherAttendancePage';
import TeacherCoursesPage from './pages/TeacherCoursesPage';
import TeacherCreateExamPage from './pages/TeacherCreateExamPage';
import TeacherManageExamsPage from './pages/TeacherManageExamsPage';
import TeacherStudentsPage from './pages/TeacherStudentsPage';
import TeacherResultsPage from './pages/TeacherResultsPage';
import TeacherProfile from './pages/TeacherProfile';
import Logout from './pages/Logout';

// Import Components
import Sidebar from './components/student/Sidebar';
import TeacherSidebar from './components/teacher/TeacherSidebar';

/**
 * Main application routes component
 * Handles routing based on user authentication and role
 */
function AppRoutes() {
  const { user, logout } = useAuth();

  // Public routes (not authenticated)
  if (!user) {
    return (
      <div className="main-content">
        <Routes>
          <Route path="/" element={<ModernLandingPage />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/register" element={<StudentRegister />} />
          <Route path="/register-flow" element={<StudentRegistrationFlow />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // Student who hasn't submitted application form
  if (user.role === 'student' && user.applicationSubmitted === false) {
    return (
      <Routes>
        <Route path="/application-form" element={<ApplicationFormPage user={user} />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<Navigate to="/application-form" replace />} />
      </Routes>
    );
  }

  // // Students with completed application - no dashboard, redirect to landing page
  // if (user.role === 'student' && user.applicationSubmitted === true) {
  //   return (
  //     <Routes>
  //       <Route path="/" element={<ModernLandingPage />} />
  //       <Route path="/logout" element={<Logout />} />
  //       <Route path="*" element={<Navigate to="/" replace />} />
  //     </Routes>
  //   );
  // }

  // Teacher routes
  if (user.role === 'teacher') {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <TeacherSidebar user={user} onLogout={logout} />
        <Layout style={{ marginLeft: '260px' }}>
          <Routes>
            <Route path="/dashboard" element={<TeacherDashboard user={user} />} />
            <Route path="/teacher/courses" element={<TeacherCoursesPage user={user} />} />
            <Route path="/teacher/create-exam" element={<TeacherCreateExamPage user={user} />} />
            <Route path="/teacher/manage-exams" element={<TeacherManageExamsPage user={user} />} />
            <Route path="/teacher/students" element={<TeacherStudentsPage user={user} />} />
            <Route path="/teacher/results" element={<TeacherResultsPage user={user} />} />
            <Route path="/teacher/profile" element={<TeacherProfile user={user} />} />
            <Route path="/attendance" element={<TeacherAttendancePage user={user} />} />
            <Route path="/exams" element={<ExamsPage user={user} />} />
            <Route path="/lms" element={<LMSPage user={user} />} />
            <Route path="/resources" element={<TeacherResourcesPage user={user} />} />
            <Route path="/messages" element={<MessagesPage user={user} />} />
            <Route path="/timetable" element={<TimetablePage user={user} />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Layout>
    );
  }

  // Student (with completed application) and Admin routes
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar user={user} onLogout={logout} />
      <Layout style={{ marginLeft: '200px' }}>
        <Routes>
          {user.role === 'student' && (
            <>
              <Route path="/dashboard" element={<StudentDashboard user={user} />} />
              <Route path="/profile" element={<StudentProfile user={user} />} />
              <Route path="/attendance" element={<AttendancePage user={user} />} />
              <Route path="/exams" element={<ExamsPage user={user} />} />
              <Route path="/fees" element={<FeesPage user={user} />} />
              <Route path="/lms" element={<LMSPage user={user} />} />
              <Route path="/messages" element={<MessagesPage user={user} />} />
              <Route path="/timetable" element={<TimetablePage user={user} />} />
              <Route path="/notices" element={<NoticesPage user={user} />} />
            </>
          )}
          {(user.role === 'admin' || user.role === 'superadmin') && (
            <>
              <Route path="/dashboard" element={<AdminDashboard user={user} />} />
              <Route path="/admissions" element={<AdmissionManagement user={user} />} />
              <Route path="/students" element={<AdminStudentsPage user={user} />} />
              <Route path="/teachers" element={<AdminTeachersPage user={user} />} />
              <Route path="/courses" element={<AdminCoursesManagement user={user} />} />
              <Route path="/subjects" element={<AdminSubjectsPage user={user} />} />
              <Route path="/attendance" element={<AdminAttendancePanel user={user} />} />
              <Route path="/fees" element={<AdminFeesManagement user={user} />} />
              <Route path="/exams" element={<AdminExamsPage user={user} />} />
              <Route path="/messages" element={<MessagesPage user={user} />} />
            </>
          )}
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Layout>
  );
}

/**
 * Main App component
 * Wraps the application with AuthProvider and Router
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
