import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Input,
  message,
  DatePicker,
  Select,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Spin,
  Space,
  Tabs,
  Progress
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  AlertOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const AdminAttendancePanel = ({ user }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentStats, setStudentStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dateFilter, setDateFilter] = useState(dayjs());
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    late: 0,
    presentPercentage: 0,
    absentPercentage: 0
  });
  const [activeTab, setActiveTab] = useState('daily');
  const [studentPage, setStudentPage] = useState(1);
  const [studentPageSize, setStudentPageSize] = useState(10);

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchAttendanceStatistics();
    } else {
      fetchStudentStats();
    }
  }, [activeTab, page, dateFilter, search]);

  const fetchAttendanceStatistics = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pageSize
      };
      if (dateFilter) {
        params.date = dateFilter.format('YYYY-MM-DD');
      }
      const response = await api.get('/admin/attendance/statistics', { params });
      if (response.data.success) {
        setAttendanceRecords(response.data.attendance || []);
        setStats(response.data.stats || {});
      }
    } catch (error) {
      message.error('Failed to load attendance statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentStats = async () => {
    try {
      setLoading(true);
      const params = {
        page: studentPage,
        limit: studentPageSize,
        search
      };
      const response = await api.get('/admin/attendance/student-stats', { params });
      if (response.data.success) {
        setStudentStats(response.data.students || []);
      }
    } catch (error) {
      message.error('Failed to load student attendance stats');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'green';
      case 'absent': return 'red';
      case 'leave': return 'orange';
      case 'late': return 'blue';
      default: return 'default';
    }
  };

  const attendanceColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
      width: 120
    },
    {
      title: 'Admission No.',
      dataIndex: ['student', 'admissionNumber'],
      key: 'admissionNumber',
      width: 140
    },
    {
      title: 'Student Name',
      key: 'studentName',
      render: (_, record) => (
        `${record.student?.personalDetails?.firstName || ''} ${record.student?.personalDetails?.lastName || ''}`
      ),
      width: 180
    },
    {
      title: 'Email',
      dataIndex: ['student', 'email'],
      key: 'email',
      width: 180
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          icon={status === 'present' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={getStatusColor(status)}
        >
          {status?.toUpperCase()}
        </Tag>
      ),
      width: 120
    },
    {
      title: 'Marked By',
      dataIndex: ['teacher', 'personalDetails'],
      key: 'teacher',
      render: (personalDetails) =>
        personalDetails ? `${personalDetails.firstName} ${personalDetails.lastName}` : 'N/A',
      width: 160
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (text) => text || '-',
      width: 140
    }
  ];

  const studentColumns = [
    {
      title: 'Admission No.',
      dataIndex: 'admissionNumber',
      key: 'admissionNumber',
      width: 140
    },
    {
      title: 'Student Name',
      key: 'studentName',
      render: (_, record) => (
        `${record.personalDetails?.firstName || ''} ${record.personalDetails?.lastName || ''}`
      ),
      width: 180
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180
    },
    {
      title: 'Total Days',
      dataIndex: ['attendanceStats', 'totalDays'],
      key: 'totalDays',
      align: 'center',
      width: 100
    },
    {
      title: 'Present',
      dataIndex: ['attendanceStats', 'presentDays'],
      key: 'presentDays',
      render: (value) => (
        <Tag color="green">{value}</Tag>
      ),
      align: 'center',
      width: 100
    },
    {
      title: 'Absent',
      dataIndex: ['attendanceStats', 'absentDays'],
      key: 'absentDays',
      render: (value) => (
        <Tag color="red">{value}</Tag>
      ),
      align: 'center',
      width: 100
    },
    {
      title: 'Leave',
      dataIndex: ['attendanceStats', 'leaveDays'],
      key: 'leaveDays',
      render: (value) => (
        <Tag color="orange">{value}</Tag>
      ),
      align: 'center',
      width: 100
    },
    {
      title: 'Attendance %',
      dataIndex: ['attendanceStats', 'attendancePercentage'],
      key: 'attendancePercentage',
      render: (percentage) => {
        const pct = parseFloat(percentage) || 0;
        let color = 'green';
        if (pct < 75) color = 'orange';
        if (pct < 60) color = 'red';
        return (
          <span style={{ color, fontWeight: '600' }}>
            {pct.toFixed(2)}%
          </span>
        );
      },
      align: 'center',
      width: 120
    }
  ];

  const tabItems = [
    {
      key: 'daily',
      label: 'Daily Attendance',
      children: (
        <div>
          <Card
            style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total Records"
                  value={stats.total}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Present"
                  value={stats.present}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Absent"
                  value={stats.absent}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Leave"
                  value={stats.leave}
                  prefix={<AlertOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
          </Card>

          <Card
            title="Attendance Records"
            style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Search student..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <DatePicker
                  placeholder="Filter by date"
                  value={dateFilter}
                  onChange={setDateFilter}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={fetchAttendanceStatistics}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Refresh
                </Button>
              </Col>
            </Row>

            <Table
              columns={attendanceColumns}
              dataSource={attendanceRecords.map((item, idx) => ({
                ...item,
                key: item._id || idx
              }))}
              loading={loading}
              pagination={{
                current: page,
                pageSize,
                total: stats.total,
                onChange: (p) => setPage(p),
                onShowSizeChange: (p, size) => {
                  setPageSize(size);
                  setPage(1);
                }
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </div>
      )
    },
    {
      key: 'student',
      label: 'Student Statistics',
      children: (
        <Card
          title="Student Attendance Summary"
          style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        >
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={12} md={12}>
              <Input
                placeholder="Search by name, email or admission number..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setStudentPage(1);
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={fetchStudentStats}
                loading={loading}
                style={{ width: '100%' }}
              >
                Refresh
              </Button>
            </Col>
          </Row>

          <Table
            columns={studentColumns}
            dataSource={studentStats.map((item, idx) => ({
              ...item,
              key: item._id || idx
            }))}
            loading={loading}
            pagination={{
              current: studentPage,
              pageSize: studentPageSize,
              total: studentStats.length * studentPage,
              onChange: (p) => setStudentPage(p),
              onShowSizeChange: (p, size) => {
                setStudentPageSize(size);
                setStudentPage(1);
              }
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '24px'
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ color: 'white', margin: 0, marginBottom: '4px' }}>Attendance Management</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
              Monitor and manage student attendance records
            </p>
          </Col>
          <Col>
            {/* Export button removed as per request */}
          </Col>
        </Row>
      </Card>

      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{ marginBottom: '16px' }}
      />

      <Modal
        title="Attendance Record Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRecord && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <strong>Date:</strong> {dayjs(selectedRecord.date).format('DD/MM/YYYY')}
            </div>
            <div>
              <strong>Status:</strong>
              <Tag color={getStatusColor(selectedRecord.status)} style={{ marginLeft: '8px' }}>
                {selectedRecord.status?.toUpperCase()}
              </Tag>
            </div>
            <div>
              <strong>Admission Number:</strong> {selectedRecord.student?.admissionNumber}
            </div>
            <div>
              <strong>Student Name:</strong>{' '}
              {selectedRecord.student?.personalDetails?.firstName}{' '}
              {selectedRecord.student?.personalDetails?.lastName}
            </div>
            <div>
              <strong>Remarks:</strong> {selectedRecord.remarks || 'None'}
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default AdminAttendancePanel;
