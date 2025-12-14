import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, UserOutlined, TeamOutlined, BookOutlined } from '@ant-design/icons';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalSubjects: 0,
    pendingAdmissions: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard-stats');

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      message.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Students', value: stats.totalStudents, fill: '#6366f1' },
    { name: 'Teachers', value: stats.totalTeachers, fill: '#a855f7' },
    { name: 'Courses', value: stats.totalCourses, fill: '#22c55e' },
    { name: 'Courses', value: stats.totalCourses, fill: '#22c55e' },
  ];

  const barData = [
    { name: 'Students', count: stats.totalStudents },
    { name: 'Teachers', count: stats.totalTeachers },
    { name: 'Courses', count: stats.totalCourses },
    { name: 'Courses', count: stats.totalCourses },
    { name: 'Pending Admissions', count: stats.pendingAdmissions },
  ];

  return (
    <Spin spinning={loading} tip="Loading dashboard...">
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Admin Dashboard</h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Welcome back! Here's an overview of your institution</p>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card variant="plain">
              <Statistic
                title="Total Students"
                value={stats.totalStudents}
                prefix={<UserOutlined style={{ color: '#6366f1', marginRight: '8px' }} />}
                valueStyle={{ color: '#6366f1', fontSize: '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card variant="plain">
              <Statistic
                title="Total Teachers"
                value={stats.totalTeachers}
                prefix={<TeamOutlined style={{ color: '#a855f7', marginRight: '8px' }} />}
                valueStyle={{ color: '#a855f7', fontSize: '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card variant="plain">
              <Statistic
                title="Total Courses"
                value={stats.totalCourses}
                prefix={<BookOutlined style={{ color: '#22c55e', marginRight: '8px' }} />}
                valueStyle={{ color: '#22c55e', fontSize: '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card variant="plain">
              <Statistic
                title="Pending Admissions"
                value={stats.pendingAdmissions}
                prefix={<ClockCircleOutlined style={{ color: '#f59e0b', marginRight: '8px' }} />}
                valueStyle={{ color: '#f59e0b', fontSize: '28px' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="System Statistics" variant="plain">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Distribution Overview" variant="plain">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>System Management Overview</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Use the sidebar menu to access different management modules. Each option provides dedicated tools for managing that specific area.
          </p>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '16px', paddingTop: '8px', paddingBottom: '8px' }}>
                <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>📋 Admission Management</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Review and process student applications</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ borderLeft: '4px solid #4f46e5', paddingLeft: '16px', paddingTop: '8px', paddingBottom: '8px' }}>
                <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>👥 Students</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>View and manage enrolled students</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ borderLeft: '4px solid #a855f7', paddingLeft: '16px', paddingTop: '8px', paddingBottom: '8px' }}>
                <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>👨‍🏫 Teachers</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Manage faculty members and assignments</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ borderLeft: '4px solid #22c55e', paddingLeft: '16px', paddingTop: '8px', paddingBottom: '8px' }}>
                <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>📚 Courses & Subjects</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Create and manage academic programs</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ borderLeft: '4px solid #f59e0b', paddingLeft: '16px', paddingTop: '8px', paddingBottom: '8px' }}>
                <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>📅 Attendance</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Monitor class attendance records</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ borderLeft: '4px solid #ef4444', paddingLeft: '16px', paddingTop: '8px', paddingBottom: '8px' }}>
                <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>💰 Fees Management</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>Handle fees collection and tracking</p>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </Spin>
  );
};

export default AdminDashboard;
