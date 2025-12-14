import { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, message, Space, Spin, Empty, Avatar, Tag, Input, Select, Layout, Modal } from 'antd';
import { UserOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../utils/api';
import TeacherTopNav from '../components/teacher/TeacherTopNav';

const TeacherStudentsPage = ({ user }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterCourse, setFilterCourse] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [user?.id]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teachers/assigned-students');
      if (response.data.success) {
        setStudents(response.data.students || []);
      }
    } catch (error) {
      message.error('Failed to load students');
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
      console.error('Failed to load courses');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.personalDetails?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
      student.personalDetails?.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
      student.admissionNumber?.includes(searchText);

    const matchesCourse = !filterCourse ||
      (typeof student.academicDetails?.course === 'object'
        ? student.academicDetails.course._id === filterCourse
        : student.academicDetails?.course === filterCourse);

    return matchesSearch && matchesCourse;
  });

  const [viewStudent, setViewStudent] = useState(null);

  const handleViewProfile = (student) => {
    setViewStudent(student);
  };

  const columns = [
    {
      title: 'Student',
      dataIndex: 'personalDetails',
      key: 'name',
      render: (personalDetails, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={personalDetails?.photo} />
          <div>
            <div style={{ fontWeight: '600' }}>
              {personalDetails?.firstName} {personalDetails?.lastName}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.admissionNumber}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Course',
      dataIndex: ['academicDetails', 'course'],
      key: 'course',
      render: (course) => course?.courseName || '-'
    },
    {
      title: 'Batch',
      dataIndex: ['academicDetails', 'batch'],
      key: 'batch',
      render: (batch) => batch || '-'
    },
    {
      title: 'Status',
      dataIndex: ['academicDetails', 'enrollmentStatus'],
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'CGPA',
      dataIndex: ['academicDetails', 'cgpa'],
      key: 'cgpa',
      render: (cgpa) => cgpa?.toFixed(2) || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" size="small" onClick={() => handleViewProfile(record)}>
            View Profile
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
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>Assigned Students</h2>
              <p style={{ color: '#666', marginTop: '4px' }}>View and manage your assigned students</p>
            </Col>
          </Row>
        </Card>

        <Card style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Input
                placeholder="Search by name or admission number"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Select
                placeholder="Filter by course"
                allowClear
                onChange={setFilterCourse}
                style={{ width: '100%' }}
              >
                {courses.map(course => (
                  <Select.Option key={course._id} value={course._id}>
                    {course.courseName}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        <Spin spinning={loading}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            {filteredStudents.length > 0 ? (
              <Table
                columns={columns}
                dataSource={filteredStudents.map((student, idx) => ({ ...student, key: idx }))}
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description={students.length === 0 ? "No students assigned yet" : "No students match your search"} />
            )}
          </Card>
        </Spin>

        <Modal
          title="Student Profile"
          open={!!viewStudent}
          onCancel={() => setViewStudent(null)}
          footer={[
            <Button key="close" onClick={() => setViewStudent(null)}>
              Close
            </Button>
          ]}
          width={700}
        >
          {viewStudent && (
            <div style={{ padding: '20px 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Avatar size={100} icon={<UserOutlined />} src={viewStudent.personalDetails?.photo} />
                <h2 style={{ marginTop: '16px', marginBottom: '4px' }}>
                  {viewStudent.personalDetails?.firstName} {viewStudent.personalDetails?.lastName}
                </h2>
                <Tag color="blue">{viewStudent.admissionNumber}</Tag>
              </div>

              <Row gutter={[24, 24]}>
                <Col span={24}>
                  <Card type="inner" title="Academic Details" size="small">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <strong>Course:</strong> <br />
                        {viewStudent.academicDetails?.course?.courseName || '-'}
                      </Col>
                      <Col span={12}>
                        <strong>Batch:</strong> <br />
                        {viewStudent.academicDetails?.batch || '-'}
                      </Col>
                      <Col span={12}>
                        <strong>Roll Number:</strong> <br />
                        {viewStudent.academicDetails?.rollNumber || '-'}
                      </Col>
                      <Col span={12}>
                        <strong>Current Semester:</strong> <br />
                        {viewStudent.academicDetails?.currentSemester || '-'}
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col span={24}>
                  <Card type="inner" title="Personal Details" size="small">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <strong>Email:</strong> <br />
                        {viewStudent.email || '-'}
                      </Col>
                      <Col span={12}>
                        <strong>Phone:</strong> <br />
                        {viewStudent.personalDetails?.phone || '-'}
                      </Col>
                      <Col span={12}>
                        <strong>Date of Birth:</strong> <br />
                        {viewStudent.personalDetails?.dob ? new Date(viewStudent.personalDetails.dob).toLocaleDateString() : '-'}
                      </Col>
                      <Col span={12}>
                        <strong>Gender:</strong> <br />
                        {viewStudent.personalDetails?.gender || '-'}
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col span={24}>
                  <Card type="inner" title="Guardian Details" size="small">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <strong>Father Name:</strong> <br />
                        {viewStudent.guardianDetails?.fatherName || '-'}
                      </Col>
                      <Col span={12}>
                        <strong>Contact:</strong> <br />
                        {viewStudent.guardianDetails?.fatherPhone || viewStudent.guardianDetails?.guardianPhone || '-'}
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal>
      </Layout.Content>
    </Layout>
  );
};

export default TeacherStudentsPage;
