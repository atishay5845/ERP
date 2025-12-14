import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Modal, Form, Input, Select, message, Statistic, Tag, Space, Tabs, Spin } from 'antd';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, BookOutlined } from '@ant-design/icons';
import api from '../utils/api';

const ExamsPage = ({ user }) => {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState({
    totalExams: 0,
    completed: 0,
    pending: 0,
    averageMarks: 0,
  });

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (student?.academicDetails?.course) {
      fetchExamsData();
    }
  }, [student]);

  const fetchStudentData = async () => {
    try {
      const response = await api.get('/student/profile');
      if (response.data?.success && response.data?.student) {
        setStudent(response.data.student);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      message.error('Failed to load student profile');
    }
  };

  const fetchExamsData = async () => {
    try {
      setLoading(true);
      if (!student?.academicDetails?.course) {
        message.warning('Please select a course first');
        return;
      }

      const courseId = typeof student.academicDetails.course === 'object'
        ? student.academicDetails.course._id
        : student.academicDetails.course;

      const examsRes = await api.get('/exams', {
        params: { course: courseId }
      });

      const allExams = examsRes.data.exams || [];
      
      setExams(allExams);

      const completed = allExams.filter(exam => new Date(exam.date) < new Date()).length;
      const avgMarks = completed > 0
        ? Math.round(allExams.filter(e => e.date < new Date()).reduce((sum, e) => sum + (e.totalMarks || 0), 0) / completed)
        : 0;

      setStats({
        totalExams: allExams.length,
        completed,
        pending: allExams.length - completed,
        averageMarks: avgMarks,
      });
    } catch (error) {
      console.error('Error loading exams:', error);
      message.error('Failed to load exams data');
    } finally {
      setLoading(false);
    }
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const examDate = new Date(exam.examDate);
    if (examDate < now) {
      return { color: 'green', text: 'Completed' };
    } else if (examDate - now < 7 * 24 * 60 * 60 * 1000) {
      return { color: 'orange', text: 'Upcoming' };
    }
    return { color: 'blue', text: 'Scheduled' };
  };

  const examColumns = [
    {
      title: 'Exam Name',
      dataIndex: 'examName',
      key: 'name',
    },
    {
      title: 'Course',
      dataIndex: ['course', 'courseName'],
      key: 'course',
    },
    {
      title: 'Exam Type',
      dataIndex: 'examType',
      key: 'examType',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Time',
      dataIndex: 'startTime',
      key: 'time',
      render: (text) => text || '-',
    },
    {
      title: 'Total Marks',
      dataIndex: 'totalMarks',
      key: 'totalMarks',
    },
  ];

  const resultColumns = [
    {
      title: 'Exam',
      dataIndex: ['exam', 'examName'],
      key: 'exam',
    },
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'course',
    },
    {
      title: 'Marks',
      key: 'marks',
      render: (_, record) => `${record.marksObtained}/${record.totalMarks}`,
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (_, record) => {
        const percentage = Math.round((record.marksObtained / record.totalMarks) * 100);
        const color = percentage >= 75 ? 'green' : percentage >= 60 ? 'orange' : 'red';
        return <Tag color={color}>{percentage}%</Tag>;
      },
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
  ];

  if (!student?.academicDetails?.course) {
    return (
      <Spin spinning={!student} tip="Loading...">
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Card style={{ marginTop: '40px' }}>
            <h2 style={{ color: '#ff7a45' }}>⚠️ Please Select a Course</h2>
            <p style={{ fontSize: '16px', color: '#666' }}>
              You need to select a course before viewing exams. Please go to your Student Dashboard and select a course.
            </p>
          </Card>
        </div>
      </Spin>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Exams"
              value={stats.totalExams}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Marks"
              value={stats.averageMarks}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        style={{ marginTop: '20px' }}
        items={[
          {
            key: '1',
            label: 'Upcoming Exams',
            children: (
              <Card loading={loading}>
                {exams.length > 0 ? (
                  <Table
                    columns={examColumns}
                    dataSource={exams.filter(e => new Date(e.date) >= new Date()).map((item, idx) => ({ ...item, key: idx }))}
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#999' }}>No upcoming exams</p>
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: '2',
            label: 'Completed Exams',
            children: (
              <Card loading={loading}>
                {exams.filter(e => new Date(e.date) < new Date()).length > 0 ? (
                  <Table
                    columns={examColumns}
                    dataSource={exams.filter(e => new Date(e.date) < new Date()).map((item, idx) => ({ ...item, key: idx }))}
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p style={{ color: '#999' }}>No completed exams yet</p>
                  </div>
                )}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ExamsPage;
