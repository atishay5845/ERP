import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Select,
  Spin,
  Empty,
  Tag,
  Space,
  message,
  Drawer,
  Input
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  InputNumber
} from '@ant-design/icons';
import api from '../utils/api';

const AdminCoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [courseForm] = Form.useForm();

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
    fetchAssignments();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      if (response.data.success) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Failed to load courses');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/admin/teachers');
      if (response.data.success) {
        setTeachers(response.data.teachers || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/course-teacher-assignments');
      if (response.data.success) {
        setAssignments(response.data.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async (courseId) => {
    if (selectedTeachers.length === 0) {
      message.warning('Please select at least one teacher');
      return;
    }

    try {
      for (const teacherId of selectedTeachers) {
        await api.post('/admin/teacher/assign-course', {
          teacherId,
          courseId
        });
      }
      message.success('Teachers assigned successfully');
      setSelectedTeachers([]);
      setIsModalOpen(false);
      fetchAssignments();
    } catch (error) {
      console.error('Error assigning teacher:', error);
      message.error(error.response?.data?.message || 'Failed to assign teacher');
    }
  };

  const handleRemoveTeacher = async (courseId, teacherId) => {
    try {
      await api.post('/admin/teacher/remove-course', {
        teacherId,
        courseId
      });
      message.success('Teacher removed from course');
      fetchAssignments();
    } catch (error) {
      message.error('Failed to remove teacher');
    }
  };

  const handleCreateCourse = async (values) => {
    try {
      const response = await api.post('/admin/course/create', {
        courseName: values.courseName,
        courseCode: values.courseCode,
        description: values.description,
        department: values.department,
        duration: values.duration,
        totalSemesters: values.totalSemesters,
        totalCredits: values.totalCredits,
        admissionCapacity: values.admissionCapacity,
        courseFee: values.courseFee,
        eligibility: values.eligibility
      });

      if (response.data.success) {
        message.success('Course created successfully');
        courseForm.resetFields();
        setIsCreateCourseModalOpen(false);
        fetchCourses();
      }
    } catch (error) {
      console.error('Error creating course:', error);
      message.error(error.response?.data?.message || 'Failed to create course');
    }
  };

  const showAssignmentModal = (course) => {
    setSelectedCourse(course);
    const assignment = assignments.find(a => a.courseId === course._id);
    setSelectedTeachers(assignment?.teachers?.map(t => t._id) || []);
    setIsModalOpen(true);
  };

  const coursesColumns = [
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Course Code',
      dataIndex: 'courseCode',
      key: 'courseCode'
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Total Semesters',
      dataIndex: 'totalSemesters',
      key: 'totalSemesters'
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<TeamOutlined />}
            size="small"
            onClick={() => showAssignmentModal(record)}
          >
            Assign Teachers
          </Button>
        </Space>
      )
    }
  ];

  const assignmentColumns = [
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName'
    },
    {
      title: 'Course Code',
      dataIndex: 'courseCode',
      key: 'courseCode'
    },
    {
      title: 'Teachers Assigned',
      dataIndex: 'teacherCount',
      key: 'teacherCount',
      render: (count) => (
        <Tag color="blue" icon={<TeamOutlined />}>
          {count} Teacher(s)
        </Tag>
      )
    },
    {
      title: 'Teachers',
      dataIndex: 'teachers',
      key: 'teachers',
      render: (teachers, record) => (
        <Space direction="vertical" size="small">
          {teachers && teachers.length > 0 ? (
            teachers.map((teacher, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {teacher.personalDetails?.firstName} {teacher.personalDetails?.lastName}
                </span>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveTeacher(record.courseId, teacher._id)}
                />
              </div>
            ))
          ) : (
            <span style={{ color: '#999' }}>No teachers assigned</span>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        {/* Courses List */}
        <Col xs={24}>
          <Card
            title={<span><BookOutlined /> Courses List</span>}
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateCourseModalOpen(true)}>Add Course</Button>}
            style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <Table
              columns={coursesColumns}
              dataSource={courses}
              loading={loading}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>

        {/* Teacher Assignments */}
        <Col xs={24}>
          <Card
            title={<span><TeamOutlined /> Teacher-Course Assignments</span>}
            style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            {loading ? (
              <Spin />
            ) : assignments.length > 0 ? (
              <Table
                columns={assignmentColumns}
                dataSource={assignments}
                rowKey="courseId"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
              />
            ) : (
              <Empty description="No courses available" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Create Course Modal */}
      <Modal
        title="Create New Course"
        open={isCreateCourseModalOpen}
        onOk={() => courseForm.submit()}
        onCancel={() => {
          setIsCreateCourseModalOpen(false);
          courseForm.resetFields();
        }}
        width={700}
        okText="Create Course"
      >
        <Form
          form={courseForm}
          layout="vertical"
          onFinish={handleCreateCourse}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Course Name"
                name="courseName"
                rules={[{ required: true, message: 'Course name is required' }]}
              >
                <Input placeholder="e.g., Computer Science" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Course Code"
                name="courseCode"
                rules={[{ required: true, message: 'Course code is required' }]}
              >
                <Input placeholder="e.g., CS101" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Description"
                name="description"
              >
                <Input.TextArea placeholder="Course description" rows={3} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Department"
                name="department"
              >
                <Input placeholder="e.g., Engineering" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Duration (months)"
                name="duration"
              >
                <Input type="number" placeholder="e.g., 24" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Total Semesters"
                name="totalSemesters"
              >
                <Input type="number" placeholder="e.g., 4" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Total Credits"
                name="totalCredits"
              >
                <Input type="number" placeholder="e.g., 120" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Admission Capacity"
                name="admissionCapacity"
              >
                <Input type="number" placeholder="e.g., 60" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Course Fee (₹)"
                name="courseFee"
              >
                <Input type="number" placeholder="e.g., 50000" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Eligibility"
                name="eligibility"
              >
                <Input.TextArea placeholder="e.g., 10+2 or equivalent" rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Assign Teachers Modal */}
      <Modal
        title={`Assign Teachers to ${selectedCourse?.courseName}`}
        open={isModalOpen}
        onOk={() => handleAssignTeacher(selectedCourse?._id)}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedTeachers([]);
        }}
        width={600}
      >
        <Form layout="vertical">
          <Form.Item label="Select Teachers" required>
            <Select
              mode="multiple"
              placeholder="Choose one or more teachers"
              value={selectedTeachers}
              onChange={setSelectedTeachers}
              options={teachers.map(teacher => ({
                label: `${teacher.personalDetails?.firstName} ${teacher.personalDetails?.lastName} (${teacher.email})`,
                value: teacher._id
              }))}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCoursesManagement;
