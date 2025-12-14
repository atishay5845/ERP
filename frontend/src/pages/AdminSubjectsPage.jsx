import { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, message, Pagination, Row, Col, Form, Select, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../utils/api';

const AdminSubjectsPage = ({ user }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
  });

  useEffect(() => {
    fetchSubjects();
  }, [currentPage, search]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/subjects', {
        params: { page: currentPage, limit: pageSize },
      });
      
      setSubjects(response.data.subjects || []);
      setStats({
        total: response.data.pagination?.total || 0,
      });
    } catch (error) {
      message.error('Failed to fetch subjects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (values) => {
    try {
      setSubmitting(true);
      
      const payload = {
        subjectCode: values.subjectCode,
        subjectName: values.subjectName,
        credits: values.credits,
        semester: values.semester,
        department: values.department,
      };

      await api.post('/admin/subject/create', payload);

      message.success('Subject created successfully!');
      form.resetFields();
      setAddModalVisible(false);
      fetchSubjects();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create subject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (subjectId) => {
    Modal.confirm({
      title: 'Delete Subject',
      content: 'Are you sure you want to delete this subject? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      async onOk() {
        try {
          await api.delete(`/admin/subject/${subjectId}`).catch(() => {});
          message.success('Subject deleted successfully');
          fetchSubjects();
        } catch (error) {
          message.error('Failed to delete subject');
        }
      },
    });
  };

  return (
    <Spin spinning={loading} tip="Loading subjects...">
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Subject Management</h1>
          <p style={{ color: '#666' }}>Create and manage academic subjects</p>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card variant="plain" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
                  {stats.total}
                </p>
                <p style={{ color: '#666' }}>Total Subjects</p>
              </div>
            </Card>
          </Col>
        </Row>

        <Card variant="plain" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Subjects List</h2>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
              Add Subject
            </Button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Input
              placeholder="Search by subject name or code..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              size="large"
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                    Code
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                    Subject Name
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                    Department
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                    Semester
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                    Credits
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjects.length > 0 ? (
                  subjects.map((subject, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 16px', color: '#333', fontWeight: '500' }}>{subject.subjectCode}</td>
                      <td style={{ padding: '12px 16px', color: '#333' }}>{subject.subjectName}</td>
                      <td style={{ padding: '12px 16px', color: '#666' }}>{subject.department || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', color: '#666' }}>{subject.semester || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', color: '#666' }}>{subject.credits || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => {
                            setSelectedSubject(subject);
                            setViewModalVisible(true);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          type="link"
                          size="small"
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => handleDelete(subject._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
                      No subjects found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>
              Showing {subjects.length} of {stats.total}
            </span>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={stats.total}
              onChange={setCurrentPage}
            />
          </div>
        </Card>

        <Modal
          title="Subject Details"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedSubject && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ color: '#666', fontSize: '12px' }}>Subject Code</p>
                <p style={{ fontWeight: 'bold', color: '#333' }}>{selectedSubject.subjectCode}</p>
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '12px' }}>Credits</p>
                <p style={{ fontWeight: 'bold', color: '#333' }}>{selectedSubject.credits || 'N/A'}</p>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={{ color: '#666', fontSize: '12px' }}>Subject Name</p>
                <p style={{ fontWeight: 'bold', color: '#333' }}>{selectedSubject.subjectName}</p>
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '12px' }}>Department</p>
                <p style={{ fontWeight: 'bold', color: '#333' }}>{selectedSubject.department || 'N/A'}</p>
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '12px' }}>Semester</p>
                <p style={{ fontWeight: 'bold', color: '#333' }}>{selectedSubject.semester || 'N/A'}</p>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          title="Add New Subject"
          open={addModalVisible}
          onCancel={() => {
            setAddModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddSubject}
            autoComplete="off"
          >
            <Form.Item
              label="Subject Code"
              name="subjectCode"
              rules={[{ required: true, message: 'Please enter subject code' }]}
            >
              <Input placeholder="e.g., CS101" />
            </Form.Item>

            <Form.Item
              label="Subject Name"
              name="subjectName"
              rules={[{ required: true, message: 'Please enter subject name' }]}
            >
              <Input placeholder="e.g., Data Structures" />
            </Form.Item>

            <Form.Item
              label="Department"
              name="department"
              rules={[{ required: true, message: 'Please select department' }]}
            >
              <Select placeholder="Select department">
                <Select.Option value="Computer Science">Computer Science</Select.Option>
                <Select.Option value="Mathematics">Mathematics</Select.Option>
                <Select.Option value="Physics">Physics</Select.Option>
                <Select.Option value="Chemistry">Chemistry</Select.Option>
                <Select.Option value="Biology">Biology</Select.Option>
                <Select.Option value="English">English</Select.Option>
                <Select.Option value="History">History</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Semester"
              name="semester"
              rules={[{ required: true, message: 'Please enter semester' }]}
            >
              <Select placeholder="Select semester">
                <Select.Option value={1}>Semester 1</Select.Option>
                <Select.Option value={2}>Semester 2</Select.Option>
                <Select.Option value={3}>Semester 3</Select.Option>
                <Select.Option value={4}>Semester 4</Select.Option>
                <Select.Option value={5}>Semester 5</Select.Option>
                <Select.Option value={6}>Semester 6</Select.Option>
                <Select.Option value={7}>Semester 7</Select.Option>
                <Select.Option value={8}>Semester 8</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Credits"
              name="credits"
              rules={[{ required: true, message: 'Please enter credits' }]}
            >
              <Select placeholder="Select credits">
                <Select.Option value={1}>1 Credit</Select.Option>
                <Select.Option value={2}>2 Credits</Select.Option>
                <Select.Option value={3}>3 Credits</Select.Option>
                <Select.Option value={4}>4 Credits</Select.Option>
                <Select.Option value={5}>5 Credits</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
                Create Subject
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
};

export default AdminSubjectsPage;
