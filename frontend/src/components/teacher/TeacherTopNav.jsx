import { Layout, Menu, Avatar, Dropdown, Button, Space, Breadcrumb, Modal, Form, Input, Select, message, DatePicker } from 'antd';
import { UserOutlined, LogoutOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

const { Header } = Layout;

const TeacherTopNav = ({ profile, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [examModalVisible, setExamModalVisible] = useState(false);
  const [creatingExam, setCreatingExam] = useState(false);
  const [examForm] = Form.useForm();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (examModalVisible) {
      fetchCourses();
    }
  }, [examModalVisible]);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
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
        startTime: values.startTime || '',
        endTime: values.endTime || '',
        location: values.location || ''
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

  const navigationItems = [
    { key: '/dashboard', label: 'Dashboard' },
    { key: '/teacher/manage-exams', label: 'Manage Exams' },
    { key: '/resources', label: 'Upload Resources' },
    { key: '/teacher/students', label: 'Students' },
    { key: '/teacher/results', label: 'Results' },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: 'My Profile',
      onClick: () => navigate('/teacher/profile'),
    },
    {
      key: 'settings',
      label: 'Settings',
      onClick: () => navigate('/teacher/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems = [{ title: 'Dashboard', href: '/dashboard' }];

    let path = '';
    pathSegments.forEach((segment) => {
      path += `/${segment}`;
      const navItem = navigationItems.find(item => item.key === path);
      if (navItem) {
        breadcrumbItems.push({ title: navItem.label, href: path });
      }
    });

    return breadcrumbItems;
  };

  return (
    <>
      <Header
        style={{
          background: '#ffffff',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          padding: '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: '64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', letterSpacing: '-0.5px' }}>
            📚 ERP Portal
          </div>

          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navigationItems.map(item => ({
              key: item.key,
              label: item.label,
              onClick: item.onClick ? item.onClick : () => navigate(item.key),
            }))}
            style={{
              border: 'none',
              background: 'transparent',
              flex: 1,
              color: '#374151',
              fontWeight: 500,
            }}
          />
        </div>

        <Space size="large" align="center">
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <Avatar
                size={40}
                src={profile?.personalDetails?.photo ? `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${profile.personalDetails.photo}` : undefined}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
              <div style={{ display: 'block' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  {profile?.personalDetails?.firstName}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Teacher</div>
              </div>
            </div>
          </Dropdown>
        </Space>
      </Header>

      <div style={{ padding: '12px 32px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
        <Breadcrumb
          items={getBreadcrumbs()}
          style={{ fontSize: '13px' }}
        />
      </div>

      <Modal title="Create Exam" open={examModalVisible} onCancel={() => setExamModalVisible(false)} footer={null}>
        <Form form={examForm} layout="vertical" onFinish={handleCreateExam}>
          <Form.Item name="examName" label="Exam Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="examType" label="Exam Type" rules={[{ required: true }]}>
            <Select><Select.Option value="midterm">Midterm</Select.Option><Select.Option value="final">Final</Select.Option></Select>
          </Form.Item>
          <Form.Item name="course" label="Course" rules={[{ required: true }]}>
            <Select>{courses.map(c => <Select.Option key={c._id} value={c._id}>{c.courseName}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="batch" label="Batch" rules={[{ required: true }]}><Input placeholder="e.g. 2024-A" /></Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="totalMarks" label="Total Marks" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="passingMarks" label="Passing Marks" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="startTime" label="Start Time"><Input type="time" /></Form.Item>
          <Form.Item name="endTime" label="End Time"><Input type="time" /></Form.Item>
          <Button type="primary" htmlType="submit" loading={creatingExam} block>Create Exam</Button>
        </Form>
      </Modal>
    </>
  );
};

export default TeacherTopNav;
