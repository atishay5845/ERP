import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Modal, Form, Input, InputNumber, Select, message, Space, Spin, Empty, Tag, Layout } from 'antd';
import { UploadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../utils/api';
import TeacherTopNav from '../components/teacher/TeacherTopNav';

const TeacherResultsPage = ({ user }) => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchExams();
  }, [user?.id]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exams');
      if (response.data.success) {
        setExams(response.data.exams || []);
      }
    } catch (error) {
      message.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const [students, setStudents] = useState([]);

  // ... (inside handleExamSelect)
  const handleExamSelect = async (examId) => {
    try {
      setSelectedExam(examId);
      const selectedExamDetails = exams.find(e => e._id === examId);

      const response = await api.get(`/exams/${examId}/results`);
      if (response.data.success) {
        setResults(response.data.results || []);
      }

      if (selectedExamDetails) {
        // Fallback to fetching all assigned students and filtering in frontend
        // This bypasses the backend filter issue
        const strBatch = String(selectedExamDetails.batch).trim();
        const courseId = selectedExamDetails.course?._id || selectedExamDetails.course;

        try {
          // First try the specific endpoint (if it works)
          const specificResponse = await api.get('/teacher/students/by-course-batch', {
            params: {
              courseId: courseId,
              batch: strBatch
            }
          });

          if (specificResponse.data.success && specificResponse.data.students?.length > 0) {
            setStudents(specificResponse.data.students);
            return;
          }
        } catch (e) {
          // ignore failure
        }

        // If specific endpoint returns empty or fails, use assigned-students
        const response = await api.get('/teacher/assigned-students');
        if (response.data.success) {
          const allAssigned = response.data.students || [];
          // Filter manually
          const filtered = allAssigned.filter(s => {
            const sCourseId = s.academicDetails?.course?._id || s.academicDetails?.course;
            const sBatch = s.academicDetails?.batch;

            const courseMatch = String(sCourseId) === String(courseId);
            const batchMatch = String(sBatch).trim() === strBatch;

            return courseMatch && batchMatch;
          });

          if (filtered.length === 0 && allAssigned.length > 0) {
            // If strict match fails, try loose match (students in that course)
            const looseFiltered = allAssigned.filter(s => String(s.academicDetails?.course?._id || s.academicDetails?.course) === String(courseId));
            if (looseFiltered.length > 0) {
              message.info(`Found ${looseFiltered.length} students in this course (Batch filter relaxed)`);
              setStudents(looseFiltered);
              return;
            }
          }

          setStudents(filtered);
        }
      }
    } catch (error) {
      console.error(error);
      message.error('Failed to load results or students');
    }
  };

  const handleAddResult = async (values) => {
    try {
      const payload = {
        examId: selectedExam,
        studentId: values.studentId,
        marksObtained: values.marksObtained,
        remarks: values.remarks
      };

      if (editingResult) {
        await api.put(`/results/${editingResult._id}`, payload);
        message.success('Result updated successfully');
      } else {
        await api.post('/results/create', payload);
        message.success('Result added successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingResult(null);
      handleExamSelect(selectedExam);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to save result');
    }
  };

  const columns = [
    {
      title: 'Student Name',
      dataIndex: ['student', 'personalDetails'],
      key: 'name',
      render: (personalDetails) => `${personalDetails?.firstName} ${personalDetails?.lastName}`
    },
    {
      title: 'Admission Number',
      dataIndex: ['student', 'admissionNumber'],
      key: 'admissionNumber'
    },
    {
      title: 'Marks Obtained',
      dataIndex: 'marksObtained',
      key: 'marks'
    },
    {
      title: 'Total Marks',
      dataIndex: 'totalMarks',
      key: 'totalMarks'
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => `${percentage?.toFixed(2) || 0}%`
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => (
        <Tag color={grade === 'A' ? 'green' : grade === 'B' ? 'blue' : grade === 'C' ? 'orange' : 'red'}>
          {grade}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small">
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />} size="small">
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
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Upload Results</h2>
              <p style={{ color: '#666', marginTop: '4px' }}>Manage exam results and student marks</p>
            </Col>
          </Row>
        </Card>

        <Card style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Form layout="vertical">
            <Form.Item
              label="Select Exam"
              required
            >
              <Select
                placeholder="Choose an exam to add results"
                onChange={handleExamSelect}
              >
                {exams.map(exam => (
                  <Select.Option key={exam._id} value={exam._id}>
                    {exam.examName} - {exam.course?.courseName} ({new Date(exam.date).toLocaleDateString()})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Card>

        {selectedExam && (
          <>
            <Card style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <h3 style={{ margin: 0 }}>Results</h3>
                </Col>
                <Col>
                  <Button type="primary" icon={<UploadOutlined />} onClick={() => {
                    setEditingResult(null);
                    form.resetFields();
                    setModalVisible(true);
                  }}>
                    Add Result
                  </Button>
                </Col>
              </Row>
            </Card>

            <Spin spinning={loading}>
              <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                {results.length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={results.map((result, idx) => ({ ...result, key: idx }))}
                    pagination={{ pageSize: 10 }}
                  />
                ) : (
                  <Empty description="No results added for this exam yet" />
                )}
              </Card>
            </Spin>
          </>
        )}

        <Modal
          title={editingResult ? 'Edit Result' : 'Add Result'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setEditingResult(null);
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddResult}
          >
            <Form.Item
              label="Student"
              name="studentId"
              rules={[{ required: true, message: 'Please select a student' }]}
            >
              <Select placeholder="Select student" showSearch optionFilterProp="children">
                {students.map(student => (
                  <Select.Option key={student._id} value={student._id}>
                    {student.personalDetails?.firstName} {student.personalDetails?.lastName} ({student.admissionNumber})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Marks Obtained"
              name="marksObtained"
              rules={[{ required: true, message: 'Please enter marks' }]}
            >
              <InputNumber min={0} />
            </Form.Item>

            <Form.Item
              label="Remarks"
              name="remarks"
            >
              <Input.TextArea rows={3} placeholder="Optional remarks" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                {editingResult ? 'Update Result' : 'Add Result'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Layout.Content>
    </Layout>
  );
};

export default TeacherResultsPage;
