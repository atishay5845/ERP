import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import api from '../utils/api';

/**
 * Custom hook for teacher dashboard data management
 * @param {object} user - Current teacher user object
 * @returns {object} Teacher dashboard data and loading states
 */
const useTeacherDashboard = (user) => {
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [examsLoading, setExamsLoading] = useState(false);

  const fetchTeacherProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/teacher/profile');
      if (response.data?.success && response.data?.teacher) {
        setTeacher(response.data.teacher);
      } else {
        message.error('Failed to load teacher profile');
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      message.error(error.response?.data?.message || 'Failed to load teacher profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const response = await api.get('/teacher/courses');
      if (response.data.success) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    try {
      setStudentsLoading(true);
      const response = await api.get('/teacher/students');
      if (response.data.success) {
        setStudents(response.data.students || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const fetchExams = useCallback(async () => {
    try {
      setExamsLoading(true);
      const response = await api.get('/teacher/exams');
      if (response.data.success) {
        setExams(response.data.exams || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
    } finally {
      setExamsLoading(false);
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await api.get('/teacher/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchTeacherProfile();
      fetchCourses();
      fetchStudents();
      fetchExams();
      fetchDashboardStats();
    }
  }, [user?.id, fetchTeacherProfile, fetchCourses, fetchStudents, fetchExams, fetchDashboardStats]);

  return {
    teacher,
    setTeacher,
    courses,
    students,
    exams,
    stats,
    loading,
    coursesLoading,
    studentsLoading,
    examsLoading,
    fetchTeacherProfile,
    fetchCourses,
    fetchStudents,
    fetchExams,
    fetchDashboardStats
  };
};

export default useTeacherDashboard;
