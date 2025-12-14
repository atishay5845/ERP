import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Steps,
  Space,
  message,
  Typography,
  Avatar,
  Divider,
  Radio,
  Checkbox,
  DatePicker,
  Radio as RadioGroup
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  SolutionOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../utils/api';

const { Title, Text, Paragraph } = Typography;

const StudentRegistrationFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    personalDetails: {
      firstName: '',
      lastName: '',
      dob: null,
      gender: '',
      phone: '',
      photo: ''
    },
    academicDetails: {
      course: ''
    },
    guardianDetails: {
      fatherName: '',
      motherName: '',
      guardianPhone: '',
      guardianEmail: ''
    },
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourses();
  }, []);

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

  const handleFormChange = (changedFields) => {
    const newValues = form.getFieldsValue();
    setFormData(newValues);
  };

  const handleStepChange = async (stepNum) => {
    if (stepNum > currentStep) {
      try {
        await form.validateFields();
        setCurrentStep(stepNum);
      } catch (error) {
        message.error('Please fill all required fields');
      }
    } else {
      setCurrentStep(stepNum);
    }
  };

  const handleSubmitRegistration = async () => {
    try {
      await form.validateFields();

      if (formData.password !== formData.confirmPassword) {
        message.error('Passwords do not match');
        return;
      }

      setLoading(true);

      const registrationData = {
        firstName: formData.personalDetails.firstName,
        lastName: formData.personalDetails.lastName,
        email: formData.email,
        password: formData.password,
        personalDetails: {
          firstName: formData.personalDetails.firstName,
          lastName: formData.personalDetails.lastName,
          dob: formData.personalDetails.dob,
          gender: formData.personalDetails.gender,
          phone: formData.personalDetails.phone,
          photo: formData.personalDetails.photo
        },
        academicDetails: {
          course: formData.academicDetails.course
        },
        guardianDetails: {
          fatherName: formData.guardianDetails.fatherName,
          motherName: formData.guardianDetails.motherName,
          guardianPhone: formData.guardianDetails.guardianPhone,
          guardianEmail: formData.guardianDetails.guardianEmail
        },
        courseApplyingFor: formData.academicDetails.course,
        applicationSubmitted: true
      };

      const response = await api.post('/auth/student/register', registrationData);

      if (response.data.success) {
        message.success('Registration successful! Please login with your credentials.');
        setCurrentStep(3);
        setTimeout(() => {
          window.location.href = '/student/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const stepItems = [
    {
      title: 'Personal Info',
      description: 'Basic details'
    },
    {
      title: 'Academic Info',
      description: 'Course selection'
    },
    {
      title: 'Guardian Info',
      description: 'Parent details'
    },
    {
      title: 'Confirmation',
      description: 'Review & submit'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px 20px' }}>
      <Row justify="center">
        <Col xs={24} sm={22} md={20} lg={16} xl={14}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Avatar size={64} icon={<SolutionOutlined />} style={{ backgroundColor: '#667eea', fontSize: '32px' }} />
              <Title level={2} style={{ margin: '16px 0 8px' }}>Student Registration</Title>
              <Text type="secondary">Join our institution and start your learning journey</Text>
            </div>

            <Steps current={currentStep} items={stepItems} style={{ marginBottom: '32px' }} />

            <Form
              form={form}
              layout="vertical"
              onValuesChange={handleFormChange}
              initialValues={formData}
            >
              {/* Step 0: Personal Info */}
              {currentStep === 0 && (
                <>
                  <Title level={4}>Personal Information</Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="First Name"
                        name={['personalDetails', 'firstName']}
                        rules={[{ required: true, message: 'First name is required' }]}
                      >
                        <Input placeholder="Enter first name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Last Name"
                        name={['personalDetails', 'lastName']}
                        rules={[{ required: true, message: 'Last name is required' }]}
                      >
                        <Input placeholder="Enter last name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Date of Birth"
                        name={['personalDetails', 'dob']}
                      >
                        <DatePicker style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Gender"
                        name={['personalDetails', 'gender']}
                      >
                        <Select
                          placeholder="Select gender"
                          options={[
                            { label: 'Male', value: 'Male' },
                            { label: 'Female', value: 'Female' },
                            { label: 'Other', value: 'Other' }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Phone Number"
                        name={['personalDetails', 'phone']}
                        rules={[
                          { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
                        ]}
                      >
                        <Input placeholder="Enter 10-digit phone number" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: 'Email is required' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input placeholder="Enter email" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

              {/* Step 1: Academic Info */}
              {currentStep === 1 && (
                <>
                  <Title level={4}>Academic Information</Title>
                  <Paragraph>Select the course you want to pursue:</Paragraph>

                  <Form.Item
                    label="Select Course"
                    name={['academicDetails', 'course']}
                    rules={[{ required: true, message: 'Please select a course' }]}
                  >
                    <Select
                      placeholder="Choose a course"
                      options={courses.map(course => ({
                        label: `${course.courseName} (${course.courseCode})`,
                        value: course._id,
                        description: course.description
                      }))}
                      optionLabelProp="label"
                    />
                  </Form.Item>

                  {formData.academicDetails.course && (
                    <Card style={{ marginTop: '16px', background: '#f0f5ff' }}>
                      {courses.find(c => c._id === formData.academicDetails.course) && (
                        <>
                          <Paragraph>
                            <Text strong>Course Details:</Text>
                          </Paragraph>
                          <Paragraph>
                            <Text>
                              Duration: {courses.find(c => c._id === formData.academicDetails.course)?.duration} months
                            </Text>
                          </Paragraph>
                          <Paragraph>
                            <Text>
                              Total Semesters: {courses.find(c => c._id === formData.academicDetails.course)?.totalSemesters}
                            </Text>
                          </Paragraph>
                          <Paragraph>
                            <Text>
                              Fee: ₹{courses.find(c => c._id === formData.academicDetails.course)?.courseFee}
                            </Text>
                          </Paragraph>
                        </>
                      )}
                    </Card>
                  )}
                </>
              )}

              {/* Step 2: Guardian Info */}
              {currentStep === 2 && (
                <>
                  <Title level={4}>Guardian Information</Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Father's Name"
                        name={['guardianDetails', 'fatherName']}
                      >
                        <Input placeholder="Enter father's name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Mother's Name"
                        name={['guardianDetails', 'motherName']}
                      >
                        <Input placeholder="Enter mother's name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Guardian Phone"
                        name={['guardianDetails', 'guardianPhone']}
                      >
                        <Input placeholder="Enter guardian's phone number" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Guardian Email"
                        name={['guardianDetails', 'guardianEmail']}
                        rules={[
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input placeholder="Enter guardian's email" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <Title level={5}>Account Credentials</Title>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                          { required: true, message: 'Password is required' },
                          { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                      >
                        <Input.Password placeholder="Enter password" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        rules={[
                          { required: true, message: 'Please confirm your password' }
                        ]}
                      >
                        <Input.Password placeholder="Confirm password" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <>
                  <div style={{ textAlign: 'center' }}>
                    <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                    <Title level={4}>Registration Successful!</Title>
                    <Paragraph>
                      Your registration has been submitted successfully. You will receive a confirmation email shortly.
                    </Paragraph>
                    <Paragraph>
                      You can now log in with your email and password to select your preferred teacher.
                    </Paragraph>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <Row justify="space-between" style={{ marginTop: '32px' }}>
                <Col>
                  <Button
                    size="large"
                    onClick={() => handleStepChange(currentStep - 1)}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                </Col>
                <Col>
                  {currentStep === 2 ? (
                    <Button
                      type="primary"
                      size="large"
                      loading={loading}
                      onClick={handleSubmitRegistration}
                      icon={<CheckCircleOutlined />}
                    >
                      Submit Registration
                    </Button>
                  ) : currentStep === 3 ? (
                    <Button
                      type="primary"
                      size="large"
                      href="/student/login"
                    >
                      Go to Login
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => handleStepChange(currentStep + 1)}
                    >
                      Next
                    </Button>
                  )}
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentRegistrationFlow;
