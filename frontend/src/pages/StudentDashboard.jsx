import { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Spin,
  Empty,
  Tag,
  Space,
  message,
  Avatar,
  Typography,
  Tabs,
  Table,
  Divider,
  Modal
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import useStudentDashboard from '../hooks/useStudentDashboard';
import useAuth from '../hooks/useAuth';   // ✅ add this

const { Title, Text, Paragraph } = Typography;

const StudentDashboard = () => {
    const { user } = useAuth();            // ✅ get user from auth

  const {
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
  } = useStudentDashboard(user);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [confirmTeacherVisible, setConfirmTeacherVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [courseSelectModalVisible, setCourseSelectModalVisible] = useState(false);
  const [selectingCourse, setSelectingCourse] = useState(false);

  const handleOpenCourseSelector = () => {
    fetchAvailableCourses();
    setCourseSelectModalVisible(true);
  };

  const handleSelectCourse = async (courseId) => {
    try {
      setSelectingCourse(true);
      const response = await api.post('/student/select-course', { courseId });
      if (response.data.success) {
        message.success('Course selected successfully!');
        setStudent(response.data.student);
        setCourseSelectModalVisible(false);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to select course');
    } finally {
      setSelectingCourse(false);
    }
  };

  const handleSelectTeacher = async (teacher) => {
    setSelectedTeacher(teacher);
    setConfirmTeacherVisible(true);
  };

  const confirmTeacherSelection = async () => {
    try {
      const response = await api.post('/student/select-teacher', {
        teacherId: selectedTeacher._id
      });
      if (response.data.success) {
        message.success('Teacher selected successfully!');
        setConfirmTeacherVisible(false);
        fetchStudentData(); // Refresh data to show selection
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to select teacher');
    }
  };

  const timetableColumns = [
    { title: 'Day', dataIndex: 'day', key: 'day', width: '15%' },
    { title: 'Start Time', dataIndex: 'startTime', key: 'startTime', width: '15%' },
    { title: 'End Time', dataIndex: 'endTime', key: 'endTime', width: '15%' },
    { title: 'Classroom', dataIndex: 'classroom', key: 'classroom', width: '15%' },
    { title: 'Description', dataIndex: 'description', key: 'description', width: '40%' }
  ];

  const examColumns = [
    { title: 'Exam Name', dataIndex: 'examName', key: 'examName' },
    { title: 'Type', dataIndex: 'examType', key: 'examType', render: t => <Tag color="blue">{t?.toUpperCase()}</Tag> },
    { title: 'Date', dataIndex: 'date', key: 'date', render: d => new Date(d).toLocaleDateString() },
    { title: 'Time', key: 'time', render: (_, r) => `${r.startTime || ''} - ${r.endTime || ''}` },
    { title: 'Marks', dataIndex: 'totalMarks', key: 'totalMarks' },
  ];

  const resultColumns = [
    {
      title: 'Exam',
      dataIndex: 'exam',
      key: 'exam',
      render: (examId) => {
        // Try to find exam name from loaded exams, or fallback to ID
        const exam = exams.find(e => e._id === examId);
        return exam ? exam.examName : 'Unknown Exam';
      }
    },
    {
      title: 'Subject / Course',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject, record) => {
        return subject?.subjectName || record.subjectName || student?.academicDetails?.course?.courseName || '-';
      }
    },
    {
      title: 'Marks Obtained',
      dataIndex: 'marksObtained',
      key: 'marksObtained',
      render: (marks, record) => (
        <span>{marks} / {record.totalMarks}</span>
      )
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (pct) => pct ? `${pct.toFixed(2)}%` : '-'
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => (
        <Tag color={grade === 'F' ? 'red' : 'green'}>{grade}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isPublished',
      key: 'status',
      render: (published) => (
        <Tag color={published ? 'blue' : 'orange'}>
          {published ? 'Published' : 'Pending'}
        </Tag>
      )
    }
  ];

  const tabItems = [
    {
      key: '1',
      label: <span><TeamOutlined /> Select Teacher</span>,
      children: (
        <div>
          {student?.preferredTeacher && (
            <Card style={{ marginBottom: '16px', background: '#e6f7ff', borderColor: '#1890ff' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                  <Text strong>Teacher Already Selected</Text>
                </Space>
                <Paragraph>You have already selected a teacher.</Paragraph>
              </Space>
            </Card>
          )}

          {teacherLoading ? <Spin /> : teachers.length > 0 ? (
            <Row gutter={[16, 16]}>
              {teachers.map((teacher) => (
                <Col xs={24} sm={12} md={8} key={teacher._id}>
                  <Card hoverable style={{
                    borderRadius: '12px', textAlign: 'center',
                    border: student?.preferredTeacher?._id === teacher._id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                    background: student?.preferredTeacher?._id === teacher._id ? '#f0f5ff' : 'white'
                  }}>
                    <Avatar size={80} src={teacher.personalDetails?.photo} icon={<UserOutlined />} style={{ marginBottom: '12px', backgroundColor: '#667eea' }} />
                    <Title level={5}>{teacher.personalDetails?.firstName} {teacher.personalDetails?.lastName}</Title>
                    <Text type="secondary">{teacher.designation || 'Faculty'} • {teacher.department}</Text>
                    <div style={{ marginTop: 12 }}>
                      {student?.preferredTeacher?._id === teacher._id ?
                        <Tag color="green">Selected</Tag> :
                        <Button type="primary" block onClick={() => handleSelectTeacher(teacher)}>Select</Button>
                      }
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : <Empty description="No teachers available" />}
        </div>
      )
    },
    {
      key: '2',
      label: <span><BookOutlined /> My Timetable</span>,
      children: (
        <Card title="My Class Timetable">
          <Table
            columns={timetableColumns}
            dataSource={timetable}
            rowKey={(record, index) => index}
            loading={timetableLoading}
            locale={{ emptyText: 'No timetable assigned yet' }}
            pagination={false}
          />
        </Card>
      )
    },
    {
      key: '3',
      label: <span><FileTextOutlined /> Exams</span>,
      children: (
        <Card title="Upcoming Exams">
          <Table
            columns={examColumns}
            dataSource={exams}
            rowKey="_id"
            loading={examsLoading}
            locale={{ emptyText: 'No exams scheduled yet' }}
          />
        </Card>
      )
    },
    {
      key: '4',
      label: <span><CheckCircleOutlined /> Results</span>,
      children: (
        <Card title="Academic Results">
          <Table
            columns={resultColumns}
            dataSource={results}
            rowKey="_id"
            loading={resultsLoading}
            locale={{ emptyText: 'No results published yet' }}
          />
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Avatar size={96} icon={<UserOutlined />} style={{ backgroundColor: '#667eea', marginBottom: '16px' }} />
            <Title level={3}>{student?.personalDetails?.firstName} {student?.personalDetails?.lastName}</Title>
            <Text type="secondary">{student?.email}</Text>
            <Divider />
            <div style={{ textAlign: 'left' }}>
              <Paragraph><Text strong>Admission No:</Text> {student?.admissionNumber}</Paragraph>
              <Paragraph><Text strong>Course:</Text> {student?.academicDetails?.course?.courseName || 'N/A'}</Paragraph>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          {!student?.academicDetails?.course ? (
            <Card style={{ background: '#fff7e6', borderColor: '#ffbb96' }}>
              <Title level={4} style={{ color: '#d46b08' }}>⚠️ Please Select a Course</Title>
              <Button type="primary" onClick={handleOpenCourseSelector} icon={<BookOutlined />}>Select Course</Button>
            </Card>
          ) : (
            <Card>
              <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
            </Card>
          )}
        </Col>
      </Row>

      <Modal title="Confirm Teacher" open={confirmTeacherVisible} onOk={confirmTeacherSelection} onCancel={() => setConfirmTeacherVisible(false)}>
        <p>Select {selectedTeacher?.personalDetails?.firstName} as your teacher?</p>
      </Modal>

      <Modal title="Select Course" open={courseSelectModalVisible} onCancel={() => setCourseSelectModalVisible(false)} footer={null} width={700}>
        <Spin spinning={coursesLoading}>
          <Row gutter={[16, 16]}>
            {availableCourses.map(course => (
              <Col xs={24} sm={12} key={course._id}>
                <Card hoverable onClick={() => handleSelectCourse(course._id)}>
                  <Title level={5}>{course.courseName}</Title>
                  <Text>{course.courseCode}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Spin>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
