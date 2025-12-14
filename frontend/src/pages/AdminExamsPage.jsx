import { useState, useEffect } from 'react';
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
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  BookOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../utils/api';

const AdminExamsPage = ({ user }) => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exams');
      if (response.data.success) {
        setExams(response.data.exams || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      message.error('Failed to load exams');
    } finally {
      setLoading(false);
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

  const handleCreateExam = () => {
    setIsEditMode(false);
    setSelectedExam(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditExam = (exam) => {
    setIsEditMode(true);
    setSelectedExam(exam);
    form.setFieldsValue({
      examName: exam.examName,
      examType: exam.examType,
      course: exam.course?._id,
      batch: exam.batch,
      date: exam.date ? dayjs(exam.date) : null,
      startTime: exam.startTime,
      endTime: exam.endTime,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      location: exam.location,
      description: exam.description
    });
    setIsModalOpen(true);
  };

  const handleDeleteExam = (examId) => {
    Modal.confirm({
      title: 'Delete Exam',
      content: 'Are you sure you want to delete this exam?',
      okText: 'Delete',
      okType: 'danger',
      async onOk() {
        try {
          await api.delete(`/exams/${examId}`);
          message.success('Exam deleted successfully');
          fetchExams();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete exam');
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const payload = {
        examName: values.examName,
        examType: values.examType,
        course: values.course,
        batch: values.batch,
        date: values.date?.format('YYYY-MM-DD'),
        startTime: values.startTime || '',
        endTime: values.endTime || '',
        totalMarks: values.totalMarks,
        passingMarks: values.passingMarks || 0,
        location: values.location || '',
        description: values.description || ''
      };

      if (isEditMode) {
        await api.put(`/exams/${selectedExam._id}`, payload);
        message.success('Exam updated successfully');
      } else {
        await api.post('/exams/create', payload);
        message.success('Exam created successfully');
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchExams();
    } catch (error) {
      console.error('Error saving exam:', error);
      message.error(error.response?.data?.message || 'Failed to save exam');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Exam Name',
      dataIndex: 'examName',
      key: 'examName',
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
      title: 'Total Marks',
      dataIndex: 'totalMarks',
      key: 'totalMarks',
    },
    {
      title: 'Batch',
      dataIndex: 'batch',
      key: 'batch',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditExam(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteExam(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card
            title={<span><BookOutlined /> Exams Management</span>}
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateExam}>
                Create Exam
              </Button>
            }
            style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={exams}
                loading={loading}
                rowKey="_id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200 }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>

      <Modal
        title={isEditMode ? 'Edit Exam' : 'Create New Exam'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        width={700}
        okText={isEditMode ? 'Update Exam' : 'Create Exam'}
        okButtonProps={{ loading: submitting }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="examName"
            label="Exam Name"
            rules={[{ required: true, message: 'Please enter exam name' }]}
          >
            <Input placeholder="e.g., Midterm Exam 2024" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="examType"
                label="Exam Type"
                rules={[{ required: true, message: 'Please select exam type' }]}
              >
                <Select placeholder="Select exam type">
                  <Select.Option value="midterm">Midterm</Select.Option>
                  <Select.Option value="final">Final</Select.Option>
                  <Select.Option value="internal">Internal</Select.Option>
                  <Select.Option value="practical">Practical</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="course"
                label="Course"
                rules={[{ required: true, message: 'Please select course' }]}
              >
                <Select placeholder="Select course">
                  {courses.map(course => (
                    <Select.Option key={course._id} value={course._id}>
                      {course.courseName} ({course.courseCode})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="batch"
                label="Batch"
                rules={[{ required: true, message: 'Please enter batch' }]}
              >
                <Input placeholder="e.g., 2024-A" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="date"
                label="Exam Date"
                rules={[{ required: true, message: 'Please select exam date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="startTime"
                label="Start Time"
              >
                <Input type="time" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="endTime"
                label="End Time"
              >
                <Input type="time" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="totalMarks"
                label="Total Marks"
                rules={[{ required: true, message: 'Please enter total marks' }]}
              >
                <Input type="number" placeholder="100" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="passingMarks"
                label="Passing Marks"
              >
                <Input type="number" placeholder="40" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Location/Classroom"
          >
            <Input placeholder="e.g., Room 101" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea placeholder="Additional details about the exam" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminExamsPage;
