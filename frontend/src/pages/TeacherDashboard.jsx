import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  Empty,
  Tag,
  Space,
  message,
  Avatar,
  Typography,
  Layout,
  Tabs,
  Badge,
  Descriptions,
  Statistic
} from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  BookOutlined,
  LogoutOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../utils/api';
import TeacherTopNav from '../components/teacher/TeacherTopNav';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TeacherDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [studentsError, setStudentsError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState([]);
  const [studentDetailsVisible, setStudentDetailsVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editForm] = Form.useForm();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(dayjs());
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    fetchTeacherProfile();
    fetchAssignedStudents();
    fetchCourses();
    fetchExams();
  }, [user?.id]);

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams');
      if (response.data.success) {
        // Filter exams that are in the future
        const upcoming = response.data.exams.filter(exam => dayjs(exam.date).isAfter(dayjs())).sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
        setExams(upcoming);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchTeacherProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      const response = await api.get('/teachers/profile');
      if (response.data?.success && response.data?.teacher) {
        setProfile(response.data.teacher);
      } else {
        setProfileError('Invalid response from server');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load teacher profile';
      setProfileError(errorMsg);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAssignedStudents = async () => {
    try {
      setLoading(true);
      setStudentsError(null);
      const response = await api.get('/teachers/assigned-students');
      if (response.data?.success && response.data?.students !== undefined) {
        setStudents(response.data.students || []);
      }
    } catch (error) {
      setStudentsError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditProfile = () => {
    if (profile) {
      editForm.setFieldsValue({
        firstName: profile.personalDetails?.firstName,
        lastName: profile.personalDetails?.lastName,
        phone: profile.personalDetails?.phone,
        gender: profile.personalDetails?.gender,
        department: profile.department,
        designation: profile.designation,
        specialization: profile.specialization?.join(', ')
      });
      setPhotoPreview(profile.personalDetails?.photo ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${profile.personalDetails.photo}` : null);
      setEditProfileVisible(true);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      setUpdateLoading(true);
      const formDataObj = new FormData();

      const personalDetails = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        gender: values.gender
      };

      const specializations = values.specialization
        ? values.specialization.split(',').map(s => s.trim()).filter(s => s)
        : [];

      formDataObj.append('personalDetails', JSON.stringify(personalDetails));
      formDataObj.append('department', values.department);
      formDataObj.append('specialization', JSON.stringify(specializations));

      if (photoFile) {
        formDataObj.append('photo', photoFile);
      }

      const response = await api.put('/teachers/profile', formDataObj);

      if (response.data.success) {
        setProfile(response.data.teacher);
        setPhotoFile(null);
        setEditProfileVisible(false);
        message.success('Profile updated successfully');
        fetchTeacherProfile();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCreateTimetable = async (student) => {
    setSelectedStudent(student);
    setFormData([{ day: 'Monday', startTime: '', endTime: '', classroom: '' }]);
    setIsModalOpen(true);
  };

  const handleAddSlot = () => {
    setFormData([...formData, { day: 'Monday', startTime: '', endTime: '', classroom: '' }]);
  };

  const handleRemoveSlot = (index) => {
    const newData = formData.filter((_, i) => i !== index);
    setFormData(newData);
  };

  const handleSlotChange = (index, field, value) => {
    const newData = [...formData];
    newData[index] = { ...newData[index], [field]: value };
    setFormData(newData);
  };

  const handleSaveTimetable = async () => {
    try {
      if (!formData || formData.length === 0) {
        message.warning('Please add at least one timetable slot');
        return;
      }

      const schedule = formData.map(slot => ({
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        classroom: slot.classroom || ''
      }));

      const courseId = typeof selectedStudent.academicDetails.course === 'object'
        ? selectedStudent.academicDetails.course._id
        : selectedStudent.academicDetails.course;

      const response = await api.post('/teachers/create-student-timetable', {
        studentId: selectedStudent._id,
        courseId: courseId,
        schedule
      });

      if (response.data.success) {
        message.success('Timetable created successfully');
        setIsModalOpen(false);
        setFormData([]);
        setSelectedStudent(null);
        fetchAssignedStudents();
      }
    } catch (error) {
      console.error('Error saving timetable:', error);
      message.error(error.response?.data?.message || 'Failed to save timetable');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      if (response.data.success) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleOpenAttendanceModal = () => {
    const initialAttendance = {};
    students.forEach(student => {
      initialAttendance[student._id] = 'present';
    });
    setAttendanceData(initialAttendance);
    setAttendanceDate(dayjs());
    setAttendanceModalVisible(true);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async () => {
    try {
      if (Object.keys(attendanceData).length === 0) {
        message.warning('Please select students');
        return;
      }

      setMarkingAttendance(true);
      const recordsToSubmit = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId,
        status
      }));

      const response = await api.post('/teachers/mark-assigned-attendance', {
        attendanceData: recordsToSubmit,
        date: attendanceDate.format('YYYY-MM-DD')
      });

      if (response.data.success) {
        message.success(`Attendance marked for ${response.data.recordsCount} students`);
        setAttendanceModalVisible(false);
        setAttendanceData({});
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };


  const studentsColumns = [
    {
      title: 'Student Name',
      dataIndex: 'personalDetails',
      key: 'name',
      render: (personalDetails) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <Text strong>{personalDetails?.firstName} {personalDetails?.lastName}</Text>
        </Space>
      )
    },
    {
      title: 'Admission No',
      dataIndex: 'admissionNumber',
      key: 'admissionNumber',
      render: (text) => <Text copyable>{text}</Text>
    },
    {
      title: 'Course',
      dataIndex: ['academicDetails', 'course'],
      key: 'course',
      render: (course) => <Tag color="blue">{course?.courseName || 'N/A'}</Tag>
    },
    {
      title: 'Status',
      dataIndex: ['academicDetails', 'enrollmentStatus'],
      key: 'status',
      render: (status) => (
        <Badge status={status === 'active' ? 'success' : 'default'} text={status} />
      )
    },
    {
      title: 'Action',
      key: 'actions',
      render: (_, record) => (
        <Space split={<div style={{ borderLeft: '1px solid #f0f0f0', height: '1em' }} />}>
          <Button
            type="link"
            size="small"
            onClick={() => handleCreateTimetable(record)}
          >
            Timetable
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedStudent(record);
              setStudentDetailsVisible(true);
            }}
          >
            Details
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #f8fbff 100%)' }}>
      <TeacherTopNav profile={profile} user={user} />
      <Layout.Content style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

        {/* Profile Header Block */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
          {profileLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}><Spin size="large" /></div>
          ) : profile ? (
            <Card
              style={{
                width: '100%',
                maxWidth: '900px',
                border: '2px solid rgba(59, 130, 246, 0.15)',
                borderRadius: '20px',
                boxShadow: '0 12px 32px rgba(59, 130, 246, 0.12)',
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(59, 130, 246, 0.03) 100%)'
              }}
              bodyStyle={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Avatar
                  size={200}
                  src={profile?.personalDetails?.photo ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${profile.personalDetails.photo}` : undefined}
                  icon={<UserOutlined />}
                  style={{
                    border: '5px solid #ffffff',
                    boxShadow: '0 0 0 6px rgba(59, 130, 246, 0.2)',
                    backgroundColor: 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  }}
                />
                <Button
                  icon={<EditOutlined />}
                  shape="circle"
                  type="primary"
                  size="large"
                  style={{ position: 'absolute', bottom: '10px', right: '10px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
                  onClick={handleOpenEditProfile}
                />
              </div>

              <Title level={2} style={{ margin: '12px 0 8px 0', color: '#111827', fontSize: '28px' }}>
                {profile.personalDetails?.firstName} {profile.personalDetails?.lastName}
              </Title>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', color: '#6b7280', fontSize: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontWeight: 600 }}>{profile.designation}</span>
                <span style={{ color: '#d1d5db' }}>•</span>
                <span style={{ fontWeight: 600 }}>{profile.department}</span>
                <span style={{ color: '#d1d5db' }}>•</span>
                <span>ID: {profile.employeeId}</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Tag color="blue" variant="plain" style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}>
                  {profile.email}
                </Tag>
                {profile.personalDetails?.phone && (
                  <Tag color="purple" variant="plain" style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}>
                    {profile.personalDetails.phone}
                  </Tag>
                )}
              </div>
            </Card>
          ) : (
            <Empty description="Profile not found" />
          )}
        </div>

        <Row gutter={[24, 24]}>
          {/* Main Content Area */}
          <Col xs={24} lg={16}>
            {/* Statistics Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: '28px' }}>
              <Col span={12}>
                <Card 
                  variant="plain"
                  style={{ 
                    height: '100%', 
                    border: '2px solid rgba(59, 130, 246, 0.15)',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #ffffff 0%, rgba(59, 130, 246, 0.04) 100%)',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)'
                  }}
                >
                  <Statistic
                    title="Assigned Students"
                    value={students.length}
                    prefix={<TeamOutlined style={{ color: '#3b82f6', fontSize: '20px' }} />}
                    valueStyle={{ color: '#1f2937', fontSize: '28px', fontWeight: 700 }}
                    titleStyle={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card 
                  variant="plain"
                  style={{ 
                    height: '100%', 
                    border: '2px solid rgba(34, 197, 94, 0.15)',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #ffffff 0%, rgba(34, 197, 94, 0.04) 100%)',
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.08)'
                  }}
                >
                  <Statistic
                    title="Courses Assigned"
                    value={profile?.coursesAssigned?.length || 0}
                    prefix={<BookOutlined style={{ color: '#22c55e', fontSize: '20px' }} />}
                    valueStyle={{ color: '#1f2937', fontSize: '28px', fontWeight: 700 }}
                    titleStyle={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Students Table */}
            <Card
              title={<Title level={4} style={{ margin: 0 }}>Assigned Students</Title>}
              extra={
                <Button
                  type="primary"
                  ghost
                  onClick={handleOpenAttendanceModal}
                  disabled={students.length === 0}
                >
                  Mark Attendance
                </Button>
              }
              variant="plain"
              style={{ border: '1px solid #eaecf0', borderRadius: '8px' }}
            >
              <Table
                columns={studentsColumns}
                dataSource={students}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Col>

          {/* Sidebar / Secondary Content */}
          <Col xs={24} lg={8}>
            <Card
              title="Assigned Courses"
              variant="plain"
              style={{ border: '1px solid #eaecf0', borderRadius: '8px' }}
            >
              {profile?.coursesAssigned?.map(course => (
                <Card.Grid style={{ width: '100%', padding: '12px' }} key={course._id}>
                  <Text strong>{course.courseName}</Text><br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>{course.courseCode}</Text>
                </Card.Grid>
              ))}
              {(!profile?.coursesAssigned || profile.coursesAssigned.length === 0) && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </Card>

            <Card
              title="Upcoming Exams"
              variant="plain"
              style={{ border: '1px solid #eaecf0', borderRadius: '8px', marginTop: '24px' }}
            >
              {exams.slice(0, 5).map(exam => (
                <Card.Grid style={{ width: '100%', padding: '12px' }} key={exam._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{exam.examName}</Text><br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(exam.date).format('MMM D, YYYY')} • {exam.startTime}
                      </Text>
                    </div>
                    <Tag color="blue">{exam.examType}</Tag>
                  </div>
                </Card.Grid>
              ))}
              {exams.length === 0 && <Empty description="No upcoming exams" image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </Card>
          </Col>
        </Row>
      </Layout.Content>

      {/* Modals */}
      <Modal
        title="Create Timetable"
        open={isModalOpen}
        onOk={handleSaveTimetable}
        onCancel={() => { setIsModalOpen(false); setFormData([]); }}
        width={700}
      >
        <Form layout="vertical">
          <div style={{ marginBottom: 16 }}>
            <Text strong>Student:</Text> {selectedStudent?.personalDetails?.firstName} {selectedStudent?.personalDetails?.lastName}
          </div>
          {formData.map((slot, index) => (
            <Card key={index} size="small" style={{ marginBottom: 12, background: '#fafafa' }}>
              <Row gutter={12} align="middle">
                <Col span={6}>
                  <Form.Item label="Day" style={{ marginBottom: 0 }}>
                    <Select value={slot.day} onChange={(val) => handleSlotChange(index, 'day', val)}>
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <Select.Option key={d} value={d}>{d}</Select.Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item label="Start" style={{ marginBottom: 0 }}>
                    <Input type="time" value={slot.startTime} onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={5}>
                  <Form.Item label="End" style={{ marginBottom: 0 }}>
                    <Input type="time" value={slot.endTime} onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Classroom" style={{ marginBottom: 0 }}>
                    <Input value={slot.classroom} onChange={(e) => handleSlotChange(index, 'classroom', e.target.value)} />
                  </Form.Item>
                </Col>
                <Col span={2}>
                  {formData.length > 1 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveSlot(index)} />}
                </Col>
              </Row>
            </Card>
          ))}
          <Button type="dashed" block icon={<CalendarOutlined />} onClick={handleAddSlot}>Add Slot</Button>
        </Form>
      </Modal>

      <Modal
        title="Edit Profile"
        open={editProfileVisible}
        onCancel={() => setEditProfileVisible(false)}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateProfile}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="firstName" label="First Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item label="Profile Photo">
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            {photoPreview && <div style={{ marginTop: 10 }}><Avatar size={64} src={photoPreview} /></div>}
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={updateLoading} block>Update Profile</Button>
        </Form>
      </Modal>

      <Modal title="Student Details" open={studentDetailsVisible} onCancel={() => setStudentDetailsVisible(false)} footer={null}>
        {selectedStudent && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Name">{selectedStudent.personalDetails.firstName} {selectedStudent.personalDetails.lastName}</Descriptions.Item>
            <Descriptions.Item label="Admission No">{selectedStudent.admissionNumber}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedStudent.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selectedStudent.personalDetails.phone || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Address">{selectedStudent.guardianDetails?.address || 'N/A'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal title="Mark Attendance" open={attendanceModalVisible} onOk={handleSubmitAttendance} onCancel={() => setAttendanceModalVisible(false)} confirmLoading={markingAttendance}>
        <div style={{ marginBottom: 16 }}><Text strong>Date: </Text> {attendanceDate.format('YYYY-MM-DD')}</div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {students.map(student => (
            <Row key={student._id} justify="space-between" align="middle" style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <Col>{student.personalDetails.firstName} {student.personalDetails.lastName}</Col>
              <Col>
                <Select value={attendanceData[student._id] || 'present'} onChange={(val) => handleAttendanceChange(student._id, val)} style={{ width: 100 }}>
                  <Select.Option value="present">Present</Select.Option>
                  <Select.Option value="absent">Absent</Select.Option>
                  <Select.Option value="leave">Leave</Select.Option>
                </Select>
              </Col>
            </Row>
          ))}
        </div>
      </Modal>
    </Layout>
  );
};

export default TeacherDashboard;
