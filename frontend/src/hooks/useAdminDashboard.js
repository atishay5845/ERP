import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import api from '../utils/api';

/**
 * Custom hook for admin dashboard data management
 * @param {object} user - Current admin user object
 * @returns {object} Admin dashboard data and loading states
 */
const useAdminDashboard = (user) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    pendingAdmissions: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingAdmissions, setPendingAdmissions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [admissionsLoading, setAdmissionsLoading] = useState(false);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.stats || {
          totalStudents: 0,
          totalTeachers: 0,
          totalCourses: 0,
          pendingAdmissions: 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      message.error(error.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentActivities = useCallback(async () => {
    try {
      setActivitiesLoading(true);
      const response = await api.get('/admin/activities/recent');
      if (response.data.success) {
        setRecentActivities(response.data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  const fetchPendingAdmissions = useCallback(async () => {
    try {
      setAdmissionsLoading(true);
      const response = await api.get('/admin/admissions?status=pending');
      if (response.data.success) {
        setPendingAdmissions(response.data.admissions || []);
      }
    } catch (error) {
      console.error('Error fetching pending admissions:', error);
      setPendingAdmissions([]);
    } finally {
      setAdmissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id && (user.role === 'admin' || user.role === 'superadmin')) {
      fetchDashboardStats();
      fetchRecentActivities();
      fetchPendingAdmissions();
    }
  }, [user?.id, user?.role, fetchDashboardStats, fetchRecentActivities, fetchPendingAdmissions]);

  return {
    stats,
    recentActivities,
    pendingAdmissions,
    loading,
    activitiesLoading,
    admissionsLoading,
    fetchDashboardStats,
    fetchRecentActivities,
    fetchPendingAdmissions
  };
};

export default useAdminDashboard;
