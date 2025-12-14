import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Statistic, Progress, Tag, message, Button, Modal, Form, Select, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined, AlertOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../utils/api';

const AttendancePage = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    attendancePercentage: 0,
  });
  const [markModal, setMarkModal] = useState(false);
  const [markForm] = Form.useForm();

  useEffect(() => {
    fetchAttendanceData();
  }, [user?.id]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/attendance');
      
      if (response.data.success) {
        setAttendance(response.data.attendance || []);
        setStats(response.data.stats || {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          leaveDays: 0,
          attendancePercentage: 0,
        });
      }
    } catch (error) {
      message.error('Failed to load attendance data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const attendanceColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Course',
      dataIndex: ['course', 'courseName'],
      key: 'course',
      render: (text) => text || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text) => (
        <Tag
          icon={text === 'present' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={text === 'present' ? 'green' : 'red'}
        >
          {text?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Present', value: 'present' },
        { text: 'Absent', value: 'absent' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (text) => text || '-',
    },
  ];

  const getAttendanceStatus = () => {
    const percentage = parseFloat(stats.attendancePercentage) || 0;
    if (percentage >= 75) {
      return { color: '#52c41a', text: 'Good' };
    } else if (percentage >= 60) {
      return { color: '#faad14', text: 'Needs Improvement' };
    } else {
      return { color: '#ff4d4f', text: 'Critical' };
    }
  };

  const status = getAttendanceStatus();

  return (
    <div style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh' }}>
      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0 }}>Your Attendance</h2>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchAttendanceData}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Statistic
              title="Total Classes"
              value={stats.totalDays}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Statistic
              title="Present"
              value={stats.presentDays}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Statistic
              title="Absent"
              value={stats.absentDays}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Statistic
              title="Attendance %"
              value={parseFloat(stats.attendancePercentage).toFixed(2)}
              suffix="%"
              valueStyle={{ color: status.color }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col xs={24} md={12}>
          <Card 
            title="Attendance Progress" 
            style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            loading={loading}
          >
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                percent={parseFloat(stats.attendancePercentage) || 0}
                size={150}
                strokeColor={status.color}
                format={(percent) => `${percent}%`}
              />
              <div style={{ marginTop: '20px', fontSize: '16px', fontWeight: '600', color: status.color }}>
                Status: {status.text}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="Attendance Guidelines" 
            style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <ul style={{ lineHeight: '2', marginBottom: 0 }}>
              <li><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} /> Minimum 75% attendance is required</li>
              <li><AlertOutlined style={{ color: '#faad14', marginRight: '8px' }} /> Medical certificates accepted for sick leave</li>
              <li><CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} /> Below 60% may result in action</li>
              <li><CalendarOutlined style={{ color: '#1890ff', marginRight: '8px' }} /> Approval required for leave requests</li>
            </ul>
          </Card>
        </Col>
      </Row>

      <Card 
        title="Attendance History" 
        style={{ marginTop: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        loading={loading}
      >
        {attendance && attendance.length > 0 ? (
          <Table
            columns={attendanceColumns}
            dataSource={attendance.map((item, idx) => ({ ...item, key: idx }))}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No attendance records found</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendancePage;
