import { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, message, Table, Tag, Select, Space, Spin } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../utils/api';

const AdminStudentsPage = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/students');
      setStudents(response.data.students || []);
    } catch (error) {
      message.error('Failed to fetch students');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setTeacherLoading(true);
      const response = await api.get('/admin/teachers');
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) {
      message.warning('Please select a teacher');
      return;
    }

    try {
      setAssignLoading(true);
      const response = await api.post('/admin/student/assign-teacher', {
        studentId: selectedStudent._id,
        teacherId: selectedTeacher,
      });
      if (response.data.success) {
        message.success('Teacher assigned successfully');
        setAssignModalVisible(false);
        fetchStudents();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to assign teacher');
    } finally {
      setAssignLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.personalDetails?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    s.personalDetails?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNumber?.includes(search) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Admission Number',
      dataIndex: 'admissionNumber',
      key: 'admissionNumber',
      width: '15%',
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.personalDetails?.firstName || ''} ${record.personalDetails?.lastName || ''}`,
      width: '20%',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '20%',
    },
    {
      title: 'Course',
      key: 'course',
      render: (_, record) => record.academicDetails?.course?.courseName || 'N/A',
      width: '15%',
    },
    {
      title: 'Assigned Teacher',
      key: 'teacher',
      render: (_, record) => (
        record.preferredTeacher ? (
          <Tag color="blue">
            {record.preferredTeacher?.personalDetails?.firstName} {record.preferredTeacher?.personalDetails?.lastName}
          </Tag>
        ) : (
          <Tag>Not Assigned</Tag>
        )
      ),
      width: '20%',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<TeamOutlined />}
          onClick={() => {
            setSelectedStudent(record);
            setSelectedTeacher(null);
            setAssignModalVisible(true);
          }}
        >
          Assign Teacher
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
            <UserOutlined style={{ marginRight: '8px' }} />
            Student Management & Teacher Assignment
          </h1>
          <p style={{ color: '#666' }}>Manage students and assign teachers</p>
        </div>

        <Input.Search
          placeholder="Search by name, admission number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: '16px' }}
          size="large"
        />

        <Spin spinning={loading} tip="Loading students...">
          <Table
            columns={columns}
            dataSource={filteredStudents}
            loading={loading}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <Modal
        title={`Assign Teacher to ${selectedStudent?.personalDetails?.firstName || 'Student'}`}
        open={assignModalVisible}
        onOk={handleAssignTeacher}
        onCancel={() => setAssignModalVisible(false)}
        confirmLoading={assignLoading}
        width={500}
      >
        <div style={{ marginBottom: '16px' }}>
          <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Student Information:</p>
          <p>
            <strong>Name:</strong> {selectedStudent?.personalDetails?.firstName} {selectedStudent?.personalDetails?.lastName}
          </p>
          <p>
            <strong>Admission Number:</strong> {selectedStudent?.admissionNumber}
          </p>
          <p>
            <strong>Email:</strong> {selectedStudent?.email}
          </p>
        </div>

        <div>
          <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Select Teacher:</p>
          <Spin spinning={teacherLoading}>
            <Select
              placeholder="Choose a teacher..."
              style={{ width: '100%' }}
              value={selectedTeacher}
              onChange={setSelectedTeacher}
              optionLabelProp="label"
            >
              {teachers.map((teacher) => (
                <Select.Option key={teacher._id} value={teacher._id}>
                  {teacher.personalDetails?.firstName} {teacher.personalDetails?.lastName} (
                  {teacher.designation})
                </Select.Option>
              ))}
            </Select>
          </Spin>
        </div>
      </Modal>
    </div>
  );
};

export default AdminStudentsPage;
