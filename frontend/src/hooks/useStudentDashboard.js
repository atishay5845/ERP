import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import api from '../utils/api';

const useStudentDashboard = (user) => {
  const [student, setStudent] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [exams, setExams] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [results, setResults] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [examsLoading, setExamsLoading] = useState(false);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/profile');
      if (response.data?.success && response.data?.student) {
        setStudent(response.data.student);
      } else {
        message.error('Failed to load student data');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      message.error(error.response?.data?.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeachersList = useCallback(async () => {
    if (!student?.academicDetails?.course) return;
    try {
      setTeacherLoading(true);
      let courseId = student.academicDetails.course;
      if (typeof courseId === 'object' && courseId !== null) courseId = courseId._id;

      const response = await api.get(`/student/teachers/by-course/${courseId}`);
      if (response.data.success) {
        setTeachers(response.data.teachers || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    } finally {
      setTeacherLoading(false);
    }
  }, [student]);

  const fetchExams = useCallback(async () => {
    if (!student?.academicDetails?.course) return;
    try {
      setExamsLoading(true);
      const courseId = student.academicDetails.course._id || student.academicDetails.course;
      const batch = student.academicDetails.batch;
      const response = await api.get(`/exams`, { params: { course: courseId, batch } });
      if (response.data.success) {
        setExams(response.data.exams || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setExamsLoading(false);
    }
  }, [student]);

  const fetchTimetable = useCallback(async () => {
    try {
      setTimetableLoading(true);
      if (!student?.academicDetails?.batch) return;

      let batch = student.academicDetails.batch;
      if (typeof batch === 'object' && batch !== null) batch = batch._id || batch;

      const semester = student.academicDetails.semester;

      const params = { batch };
      if (semester) params.semester = semester;

      const response = await api.get('/timetable/batch', { params });
      if (response.data.success && response.data.timetable) {
        setTimetable(response.data.timetable.schedule || []);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setTimetableLoading(false);
    }
  }, [student]);

  const fetchResults = useCallback(async () => {
    try {
      setResultsLoading(true);
      const response = await api.get('/student/results');
      if (response.data.success) {
        setResults(response.data.results || []);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setResultsLoading(false);
    }
  }, []);

  const fetchAvailableCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const response = await api.get('/student/courses/available');
      if (response.data.success) {
        setAvailableCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchStudentData();
    }
  }, [user?.id, fetchStudentData]);

  useEffect(() => {
    if (student?.academicDetails?.course) {
      fetchTeachersList();
      fetchExams();
      fetchTimetable();
      fetchResults();
    }
  }, [student, fetchTeachersList, fetchExams, fetchTimetable, fetchResults]);

  return {
    student, setStudent,
    teachers,
    exams,
    timetable,
    results,
    availableCourses,
    loading,
    teacherLoading,
    examsLoading,
    timetableLoading,
    resultsLoading,
    coursesLoading,
    fetchStudentData,
    fetchAvailableCourses
  };
};

export default useStudentDashboard;
