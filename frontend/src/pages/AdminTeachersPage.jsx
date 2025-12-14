import { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, message, Pagination, Tag, Row, Col, Form, Select, DatePicker, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, MailOutlined } from '@ant-design/icons';
import api from '../utils/api';

const AdminTeachersPage = ({ user }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, search]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/teachers', {
        params: { page: currentPage, limit: pageSize, search },
      });
      
      setTeachers(response.data.teachers || []);
      const activeCount = response.data.teachers?.filter(t => t.isActive).length || 0;
      setStats({
        total: response.data.pagination?.total || 0,
        active: activeCount,
        inactive: (response.data.pagination?.total || 0) - activeCount,
      });
    } catch (error) {
      message.error('Failed to fetch teachers');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async (values) => {
    try {
      setSubmitting(true);
      
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        gender: values.gender,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
        department: values.department,
        designation: values.designation,
        qualifications: [],
        specialization: values.specialization || [],
      };

      const response = await api.post('/admin/teacher/create', payload);

      message.success('Teacher account created successfully! Temporary password and credentials have been sent to ' + values.email);
      form.resetFields();
      setAddModalVisible(false);
      fetchTeachers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (teacherId) => {
    Modal.confirm({
      title: 'Delete Teacher',
      content: 'Are you sure you want to delete this teacher? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      async onOk() {
        try {
          await api.delete(`/admin/teacher/${teacherId}`);
          message.success('Teacher deleted successfully');
          fetchTeachers();
        } catch (error) {
          message.error('Failed to delete teacher');
        }
      },
    });
  };

  const filteredTeachers = teachers.filter(t =>
    t.personalDetails?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    t.personalDetails?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    t.employeeId?.includes(search) ||
    t.email?.toLowerCase().includes(search.toLowerCase()) ||
    t.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Teacher Management</h1>
        <p style={{ color: '#666' }}>Add, view, and manage faculty members</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
                {stats.total}
              </p>
              <p style={{ color: '#666' }}>Total Teachers</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a', marginBottom: '8px' }}>
                {stats.active}
              </p>
              <p style={{ color: '#666' }}>Active</p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f', marginBottom: '8px' }}>
                {stats.inactive}
              </p>
              <p style={{ color: '#666' }}>Inactive</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Teachers List</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
            Add Teacher
          </Button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder="Search by name, employee ID, email, or department..."
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
                  Employee ID
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                  Name
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                  Department
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                  Email
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 16px', color: '#333' }}>{teacher.employeeId}</td>
                    <td style={{ padding: '12px 16px', color: '#333' }}>
                      {teacher.personalDetails?.firstName} {teacher.personalDetails?.lastName}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#666' }}>{teacher.department || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', color: '#666' }}>{teacher.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Tag color={teacher.isActive ? 'green' : 'red'}>
                        {teacher.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Tag>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => {
                          setSelectedTeacher(teacher);
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
                        onClick={() => handleDelete(teacher._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
                    No teachers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#666' }}>
            Showing {filteredTeachers.length} of {stats.total}
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
        title="Teacher Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTeacher && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ color: '#666', fontSize: '12px' }}>Employee ID</p>
              <p style={{ fontWeight: 'bold', color: '#333' }}>{selectedTeacher.employeeId}</p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '12px' }}>Status</p>
              <Tag color={selectedTeacher.isActive ? 'green' : 'red'}>
                {selectedTeacher.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Tag>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '12px' }}>First Name</p>
              <p style={{ fontWeight: 'bold', color: '#333' }}>
                {selectedTeacher.personalDetails?.firstName || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '12px' }}>Last Name</p>
              <p style={{ fontWeight: 'bold', color: '#333' }}>
                {selectedTeacher.personalDetails?.lastName || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '12px' }}>Email</p>
              <p style={{ fontWeight: 'bold', color: '#333' }}>{selectedTeacher.email}</p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '12px' }}>Phone</p>
              <p style={{ fontWeight: 'bold', color: '#333' }}>
                {selectedTeacher.personalDetails?.phone || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '12px' }}>Department</p>
              <p style={{ fontWeight: 'bold', color: '#333' }}>{selectedTeacher.department || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '12px' }}>Designation</p>
              <p style={{ fontWeight: 'bold', color: '#333' }}>{selectedTeacher.designation || 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '12px' }}>Gender</p>
              <p style={{ fontWeight: 'bold', color: '#333' }}>
                {selectedTeacher.personalDetails?.gender || 'N/A'}
              </p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: '12px' }}>DOB</p>
              <p style={{ fontWeight: 'bold', color: '#333' }}>
                {selectedTeacher.personalDetails?.dob
                  ? new Date(selectedTeacher.personalDetails.dob).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Add New Teacher"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddTeacher}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="e.g., John" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="e.g., Doe" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input placeholder="e.g., john.doe@school.com" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Phone"
                name="phone"
              >
                <Input placeholder="e.g., 9876543210" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Gender"
                name="gender"
              >
                <Select placeholder="Select gender">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Date of Birth"
            name="dob"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
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
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Designation"
                name="designation"
                rules={[{ required: true, message: 'Please select designation' }]}
              >
                <Select placeholder="Select designation">
                  <Select.Option value="Assistant Professor">Assistant Professor</Select.Option>
                  <Select.Option value="Associate Professor">Associate Professor</Select.Option>
                  <Select.Option value="Professor">Professor</Select.Option>
                  <Select.Option value="Lecturer">Lecturer</Select.Option>
                  <Select.Option value="Instructor">Instructor</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={submitting}>
              Create Teacher Account & Send Credentials
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminTeachersPage;
