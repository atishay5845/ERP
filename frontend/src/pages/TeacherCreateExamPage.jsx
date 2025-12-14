import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Input, Select, InputNumber, DatePicker, TimePicker, message, Spin, Layout } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';
import TeacherTopNav from '../components/teacher/TeacherTopNav';

const TeacherCreateExamPage = ({ user }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/courses');
      if (response.data.success) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      message.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (values) => {
    try {
      setSubmitting(true);
      const response = await api.post('/exams/create', {
        examName: values.examName,
        examType: values.examType || 'Theory',
        course: values.course,
        batch: values.batch || 'General',
        date: values.date?.format('YYYY-MM-DD'),
        totalMarks: values.totalMarks,
        passingMarks: values.passingMarks,
        startTime: values.startTime?.format('HH:mm') || '',
        endTime: values.endTime?.format('HH:mm') || '',
        location: values.location || ''
      });

      if (response.data.success) {
        message.success('Exam created successfully');
        form.resetFields();
        navigate('/teacher/manage-exams');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create exam');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9fc' }}>
      <TeacherTopNav profile={null} user={user} />
      <Layout.Content style={{ padding: '32px', background: '#f8f9fc', minHeight: 'calc(100vh - 100px)' }}>

      <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '800px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Create New Exam</h2>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateExam}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Exam Name"
                  name="examName"
                  rules={[{ required: true, message: 'Please enter exam name' }]}
                >
                  <Input placeholder="e.g., Midterm Exam" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Course"
                  name="course"
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
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Exam Type"
                  name="examType"
                  initialValue="Theory"
                >
                  <Select>
                    <Select.Option value="Theory">Theory</Select.Option>
                    <Select.Option value="Practical">Practical</Select.Option>
                    <Select.Option value="Mixed">Mixed</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Date"
                  name="date"
                  rules={[{ required: true, message: 'Please select date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Start Time"
                  name="startTime"
                >
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="End Time"
                  name="endTime"
                >
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Total Marks"
                  name="totalMarks"
                  rules={[{ required: true, message: 'Please enter total marks' }]}
                >
                  <InputNumber min={0} placeholder="e.g., 100" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  label="Passing Marks"
                  name="passingMarks"
                >
                  <InputNumber min={0} placeholder="e.g., 40" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label="Location"
                  name="location"
                >
                  <Input placeholder="e.g., Room 101" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  label="Batch"
                  name="batch"
                >
                  <Input placeholder="e.g., 2024-Batch" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '32px' }}>
              <Col xs={24} sm={12}>
                <Button block size="large" onClick={() => form.resetFields()}>
                  Clear Form
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button type="primary" block size="large" htmlType="submit" loading={submitting}>
                  Create Exam
                </Button>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
      </Layout.Content>
    </Layout>
  );
};

export default TeacherCreateExamPage;
