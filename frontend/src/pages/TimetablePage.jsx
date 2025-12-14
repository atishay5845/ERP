import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, message, Button, Modal, Form, Input, Select, Tag, Space, Calendar, Badge } from 'antd';
import { CalendarOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../utils/api';

const TimetablePage = ({ user }) => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('week');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'student' ? '/student/timetable' : '/teacher/timetable';
      // If endpoint logic is more complex, handle it

      const response = await api.get(endpoint);
      // Backend response structure might differ, ensure we handle it
      // Student: { success: true, timetable: { ... } }
      // Teacher: { success: true, timetable: { ... } }

      const timetableData = response.data?.timetable?.schedule || [];
      setTimetable(timetableData);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      message.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  const getDaySchedule = (day) => {
    return timetable.filter((item) => item.dayOfWeek === day);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const scheduleColumns = [
    {
      title: 'Time',
      dataIndex: 'startTime',
      key: 'time',
      render: (text, record) => `${text} - ${record.endTime}`,
    },

    {
      title: 'Teacher',
      dataIndex: ['teacher', 'name'],
      key: 'teacher',
      render: (text) => text || 'TBA',
    },
    {
      title: 'Classroom',
      dataIndex: 'classroom',
      key: 'classroom',
      render: (text) => text || 'TBA',
    },
    {
      title: 'Type',
      dataIndex: 'classType',
      key: 'type',
      render: (text) => (
        <Tag color={text === 'lecture' ? 'blue' : text === 'practical' ? 'green' : 'orange'}>
          {text?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const renderWeekView = () => (
    <Row gutter={[16, 16]}>
      {daysOfWeek.map((day) => {
        const daySchedule = getDaySchedule(day);
        return (
          <Col xs={24} sm={12} md={8} lg={4} key={day}>
            <Card title={day} size="small" loading={loading}>
              {daySchedule.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>No classes</p>
              ) : (
                <div>
                  {daySchedule.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        marginBottom: '10px',
                        padding: '8px',
                        backgroundColor: '#f0f5ff',
                        borderRadius: '4px',
                        borderLeft: '3px solid #1890ff',
                      }}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                        {item.startTime} - {item.endTime}
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '4px' }}>
                        {item.description || ''}
                      </div>
                      <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                        {item.classroom || 'Room TBA'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        );
      })}
    </Row>
  );

  const renderTableView = () => (
    <Card loading={loading}>
      <Table
        columns={scheduleColumns}
        dataSource={timetable.map((item, idx) => ({
          ...item,
          key: idx,
        }))}
        pagination={{ pageSize: 15 }}
        scroll={{ x: 800 }}
      />
    </Card>
  );

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <h2>
                  <CalendarOutlined /> Class Timetable
                </h2>
              </Col>
              <Col>
                <Space>
                  <Button
                    type={viewType === 'week' ? 'primary' : 'default'}
                    onClick={() => setViewType('week')}
                  >
                    Week View
                  </Button>
                  <Button
                    type={viewType === 'table' ? 'primary' : 'default'}
                    onClick={() => setViewType('table')}
                  >
                    Table View
                  </Button>
                  <Button icon={<DownloadOutlined />}>Download</Button>
                  <Button icon={<PrinterOutlined />}>Print</Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {viewType === 'week' ? renderWeekView() : renderTableView()}

      <Card title="Legend" style={{ marginTop: '20px' }}>
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Tag color="blue">LECTURE</Tag>
              <span>Classroom lecture</span>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Tag color="green">PRACTICAL</Tag>
              <span>Lab/Practical session</span>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Tag color="orange">TUTORIAL</Tag>
              <span>Tutorial/Discussion</span>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card title="Important Notes" style={{ marginTop: '20px' }}>
        <ul>
          <li>Attendance is mandatory for all classes</li>
          <li>Check your email for any timetable changes</li>
          <li>Lab sessions are mandatory - no makeup classes</li>
          <li>Consult faculty for any class rescheduling</li>
        </ul>
      </Card>
    </div>
  );
};

export default TimetablePage;
