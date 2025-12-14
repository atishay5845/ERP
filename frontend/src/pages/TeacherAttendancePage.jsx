import { useState, useEffect } from 'react';
import { Card, Button, Form, Select, Table, Checkbox, DatePicker, message, Row, Col, Spin, Tag, Layout } from 'antd';
import { SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const TeacherAttendancePage = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [form] = Form.useForm();
  const [pastRecords, setPastRecords] = useState([]);

  useEffect(() => {
    fetchTeacherCourses();
  }, [user?.id]);

  const fetchTeacherCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teachers/profile');
      if (response.data.success) {
        const coursesAssigned = response.data.teacher?.coursesAssigned || [];
        setCourses(coursesAssigned);
      }
    } catch (error) {
      message.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setAttendance({});
    
    try {
      setLoading(true);
      const response = await api.get('/teachers/attendance-by-course', {
        params: { course: courseId, batch: selectedDate.format('YYYY-MM') }
      });
      
      if (response.data.success) {
        setPastRecords(response.data.attendance || []);
      }
    } catch (error) {
      message.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedCourse) {
      message.warning('Please select a course');
      return;
    }

    const attendanceRecords = students.map(student => ({
      studentId: student._id,
      status: attendance[student._id] || 'absent',
      courseName: student.courseName
    }));

    if (attendanceRecords.length === 0) {
      message.warning('No students to mark attendance');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/teachers/mark-assigned-attendance', {
        attendanceData: attendanceRecords,
        date: selectedDate.format('YYYY-MM-DD'),
        course: selectedCourse,
        batch: selectedDate.format('YYYY-MM')
      });

      message.success('Attendance marked successfully!');
      setAttendance({});
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const pastRecordsColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Student',
      key: 'student',
      render: (_, record) => `${record.student?.personalDetails?.firstName} ${record.student?.personalDetails?.lastName}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'present' ? 'green' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f8f9fc' }}>
      <Layout.Content style={{ padding: '32px', background: '#f8f9fc', minHeight: 'calc(100vh - 100px)' }}>
    <Spin spinning={loading} tip="Loading...">
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Mark Attendance</h1>
          <p style={{ color: '#666' }}>Record student attendance for your courses</p>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card variant="plain" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Mark Attendance</h2>
              
              <Form layout="vertical" form={form} style={{ marginBottom: '20px' }}>
                <Form.Item
                  label="Select Course"
                  name="course"
                  rules={[{ required: true, message: 'Please select a course' }]}
                >
                  <Select 
                    placeholder="Select course you teach"
                    onChange={handleCourseChange}
                  >
                    {courses.map(course => (
                      <Select.Option key={course._id} value={course._id}>
                        {course.courseName} ({course.courseCode})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Select Date"
                  name="date"
                  initialValue={selectedDate}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date || dayjs())}
                  />
                </Form.Item>
              </Form>

              {selectedCourse && students.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    Students in {selectedCourse} - {students.length} total
                  </h3>
                  
                  <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', padding: '12px' }}>
                    {students.map(student => (
                      <div 
                        key={student._id}
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '12px',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                      >
                        <span style={{ flex: 1 }}>
                          {student.personalDetails?.firstName} {student.personalDetails?.lastName}
                          <br />
                          <small style={{ color: '#999' }}>{student.admissionNumber}</small>
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            size="small"
                            type={attendance[student._id] === 'present' ? 'primary' : 'default'}
                            onClick={() => handleAttendanceChange(student._id, 'present')}
                          >
                            Present
                          </Button>
                          <Button
                            size="small"
                            type={attendance[student._id] === 'absent' ? 'primary' : 'default'}
                            danger={attendance[student._id] === 'absent'}
                            onClick={() => handleAttendanceChange(student._id, 'absent')}
                          >
                            Absent
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    type="primary" 
                    size="large" 
                    block 
                    loading={submitting}
                    icon={<SaveOutlined />}
                    style={{ marginTop: '16px' }}
                    onClick={handleSubmitAttendance}
                  >
                    Submit Attendance
                  </Button>
                </div>
              )}

              {selectedCourse && students.length === 0 && (
                <div style={{ 
                  padding: '32px', 
                  textAlign: 'center', 
                  color: '#999',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  marginTop: '20px'
                }}>
                  No students found for this course
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card variant="plain" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Past Attendance Records</h2>
              
              {selectedCourse ? (
                <Table
                  columns={pastRecordsColumns}
                  dataSource={pastRecords}
                  pagination={{ pageSize: 10 }}
                  loading={loading}
                  rowKey="_id"
                  size="small"
                />
              ) : (
                <div style={{ 
                  padding: '32px', 
                  textAlign: 'center', 
                  color: '#999'
                }}>
                  Select a course to view attendance records
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
      </Layout.Content>
    </Layout>
  );
};

export default TeacherAttendancePage;
