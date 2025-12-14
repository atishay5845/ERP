import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Modal, Form, Input, InputNumber, message, Space, Spin, Empty, Tag, Layout } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../utils/api';
import TeacherTopNav from '../components/teacher/TeacherTopNav';

const TeacherCoursesPage = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teachers/courses');
      if (response.data.success) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      message.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (values) => {
    try {
      if (editingCourse) {
        await api.put(`/teachers/courses/${editingCourse._id}`, values);
        message.success('Course updated successfully');
      } else {
        await api.post('/teachers/courses', values);
        message.success('Course created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleDeleteCourse = (courseId) => {
    Modal.confirm({
      title: 'Delete Course',
      content: 'Are you sure you want to delete this course?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await api.delete(`/teachers/courses/${courseId}`);
          message.success('Course deleted successfully');
          fetchCourses();
        } catch (error) {
          message.error('Failed to delete course');
        }
      }
    });
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    form.setFieldsValue(course);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Course Code',
      dataIndex: 'courseCode',
      key: 'courseCode'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₹${price || 0}`
    },
    {
      title: 'Students',
      dataIndex: 'studentsCount',
      key: 'students',
      render: (count) => count || 0
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" size="small" icon={<EyeOutlined />}>
            View
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEditCourse(record)}>
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDeleteCourse(record._id)}>
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9fc' }}>
      <TeacherTopNav profile={null} user={user} />
      <Layout.Content style={{ padding: '32px', background: '#f8f9fc', minHeight: 'calc(100vh - 100px)' }}>
      <Card style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>My Courses</h2>
            <p style={{ color: '#666', marginTop: '4px' }}>Create and manage your courses</p>
          </Col>
          <Col>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => {
              setEditingCourse(null);
              form.resetFields();
              setModalVisible(true);
            }}>
              Create New Course
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          {courses.length > 0 ? (
            <Table
              columns={columns}
              dataSource={courses.map((course, idx) => ({ ...course, key: idx }))}
              pagination={{ pageSize: 10 }}
              style={{ borderRadius: '12px' }}
            />
          ) : (
            <Empty description="No courses yet. Create one to get started!" />
          )}
        </Card>
      </Spin>

      <Modal
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingCourse(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCourse}
        >
          <Form.Item
            label="Course Name"
            name="courseName"
            rules={[{ required: true, message: 'Please enter course name' }]}
          >
            <Input placeholder="e.g., Web Development 101" />
          </Form.Item>

          <Form.Item
            label="Course Code"
            name="courseCode"
            rules={[{ required: true, message: 'Please enter course code' }]}
          >
            <Input placeholder="e.g., CS101" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={4} placeholder="Course description" />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber min={0} prefix="₹" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              {editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      </Layout.Content>
    </Layout>
  );
};

export default TeacherCoursesPage;
