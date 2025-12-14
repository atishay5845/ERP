import React, { useState } from 'react';
import { Layout, Menu, Avatar, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Dropdown, Space, Tooltip } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/TeacherSidebar.css';

const { Sider } = Layout;

const TeacherSidebar = ({ profile, user, onLogout }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [creatingExam, setCreatingExam] = useState(false);
  const [examForm] = Form.useForm();
  const [courses, setCourses] = useState([]);

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

  const handleExamModalOpen = () => {
    fetchCourses();
    setExamModalVisible(true);
  };

  const handleCreateExam = async (values) => {
    try {
      setCreatingExam(true);
      const response = await api.post('/exams/create', {
        examName: values.examName,
        examType: values.examType,
        course: values.course,
        batch: values.batch,
        date: values.date?.format('YYYY-MM-DD'),
        totalMarks: values.totalMarks,
        passingMarks: values.passingMarks,
      });

      if (response.data.success) {
        message.success('Exam created successfully');
        setExamModalVisible(false);
        examForm.resetFields();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create exam');
    } finally {
      setCreatingExam(false);
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Logout',
      content: 'Are you sure you want to logout?',
      okText: 'Yes',
      cancelText: 'No',
      okType: 'danger',
      onOk() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        onLogout && onLogout();
      },
    });
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/teacher/courses',
      icon: <BookOutlined />,
      label: 'My Courses',
      onClick: () => navigate('/teacher/courses'),
    },
    {
      key: 'exams',
      icon: <FileTextOutlined />,
      label: 'Exams',
      children: [
        {
          key: '/teacher/create-exam',
          label: 'Create Exam',
          onClick: () => navigate('/teacher/create-exam'),
        },
        {
          key: '/teacher/manage-exams',
          label: 'Manage Exams',
          onClick: () => navigate('/teacher/manage-exams'),
        },
      ],
    },
    {
      key: '/teacher/students',
      icon: <TeamOutlined />,
      label: 'Students',
      onClick: () => navigate('/teacher/students'),
    },
    {
      key: '/teacher/results',
      icon: <BarChartOutlined />,
      label: 'Results & Marks',
      onClick: () => navigate('/teacher/results'),
    },
    {
      key: '/resources',
      icon: <FileTextOutlined />,
      label: 'Learning Resources',
      onClick: () => navigate('/resources'),
    },
    {
      key: '/attendance',
      icon: <CheckOutlined />,
      label: 'Attendance',
      onClick: () => navigate('/attendance'),
    },
  ];

  const profileMenuItems = [
    {
      key: 'profile',
      label: 'View Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/teacher/profile'),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/teacher/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        collapsedWidth={80}
        className="teacher-sidebar"
        trigger={null}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">📚</span>
            {!collapsed && <span className="logo-text">EduManage</span>}
          </div>
        </div>

        <div className="sidebar-profile">
          <Dropdown menu={{ items: profileMenuItems }} trigger={['click']}>
            <div className="profile-card">
              <Avatar
                size={50}
                src={profile?.personalDetails?.photo ? `http://localhost:5000/uploads/${profile.personalDetails.photo.split('/').pop()}` : undefined}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
              {!collapsed && (
                <div className="profile-info">
                  <div className="profile-name">{profile?.personalDetails?.firstName || 'Teacher'}</div>
                  <div className="profile-role">Faculty</div>
                </div>
              )}
            </div>
          </Dropdown>
        </div>

        <Menu
          mode="vertical"
          items={menuItems}
          className="teacher-menu"
          theme="light"
        />

        <div className="sidebar-footer">
          <Tooltip title="Create New Exam">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleExamModalOpen}
              block
              className="create-exam-btn"
            >
              {!collapsed && 'New Exam'}
            </Button>
          </Tooltip>
        </div>
      </Sider>

      <Modal
        title="Create New Exam"
        open={examModalVisible}
        onCancel={() => setExamModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={examForm}
          layout="vertical"
          onFinish={handleCreateExam}
        >
          <Form.Item
            name="examName"
            label="Exam Name"
            rules={[{ required: true, message: 'Please enter exam name' }]}
          >
            <Input placeholder="e.g., Midterm Exam 2024" />
          </Form.Item>

          <Form.Item
            name="examType"
            label="Exam Type"
            rules={[{ required: true, message: 'Please select exam type' }]}
          >
            <Select placeholder="Select exam type">
              <Select.Option value="midterm">Midterm</Select.Option>
              <Select.Option value="final">Final</Select.Option>
              <Select.Option value="quiz">Quiz</Select.Option>
              <Select.Option value="assignment">Assignment</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="course"
            label="Course"
            rules={[{ required: true, message: 'Please select a course' }]}
          >
            <Select placeholder="Select course">
              {courses.map(course => (
                <Select.Option key={course._id} value={course._id}>
                  {course.courseName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="batch"
            label="Batch"
            rules={[{ required: true, message: 'Please enter batch' }]}
          >
            <Input placeholder="e.g., 2024-A" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Exam Date"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="totalMarks"
            label="Total Marks"
            rules={[{ required: true, message: 'Please enter total marks' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="100" />
          </Form.Item>

          <Form.Item
            name="passingMarks"
            label="Passing Marks"
            rules={[{ required: true, message: 'Please enter passing marks' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="40" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={creatingExam} block size="large">
              Create Exam
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const CheckOutlined = () => <span>✓</span>;

export default TeacherSidebar;
