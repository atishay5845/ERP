import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, DatePicker, Select, Row, Col, Modal, Tabs, Alert, Card } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import api from '../utils/api';
import '../styles/ApplicationForm.css';

const ApplicationFormPage = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    if (!user || user.applicationSubmitted === true) {
      message.error('Please register first');
      navigate('/register');
    }
  }, [user, navigate]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const payload = {
        personalDetails: {
          firstName: user?.name.split(' ')[0] || 'Student',
          lastName: user?.name.split(' ').slice(1).join(' ') || 'N/A',
          email: user?.email,
          phone: values.phone,
          dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
          gender: values.gender || 'Not Specified',
          bloodGroup: values.bloodGroup || 'Not Specified',
          category: values.category || 'General',
          nationality: values.nationality || 'Indian',
        },
        guardianDetails: {
          fatherName: values.fatherName || 'Not Provided',
          fatherPhone: values.fatherPhone || 'Not Provided',
          motherName: values.motherName || 'Not Provided',
          motherPhone: values.motherPhone || 'Not Provided',
          primaryGuardian: values.primaryGuardian || 'Father',
          guardianPhone: values.guardianPhone || values.fatherPhone || 'Not Provided',
          guardianEmail: values.guardianEmail || 'Not Provided',
          address: values.address || 'Not Provided',
        },
        academicDetails: {
          tenthMarks: values.tenthMarks || 0,
          twelthMarks: values.twelthMarks || 0,
          previousSchool: values.previousSchool || 'Not Provided',
          previousBoard: values.previousBoard || 'Not Specified',
          percentage: values.percentage || 0,
        },
      };

      const response = await api.post('/admissions/submit-application', payload);

      if (response.data.success) {
        message.success('Application submitted successfully!');
        form.resetFields();

        const updatedUser = { ...user, applicationSubmitted: true };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        Modal.success({
          title: '✓ Application Submitted Successfully',
          width: 500,
          content: (
            <div className="success-modal-content">
              <p style={{ fontSize: '16px', marginBottom: '16px' }}>
                <strong>Your application has been submitted for review.</strong>
              </p>
              <div className="success-details">
                <div className="detail-row">
                  <span>📧 Confirmation sent to:</span>
                  <strong>{user?.email}</strong>
                </div>
                <div className="detail-row">
                  <span>⏱️ Expected review time:</span>
                  <strong>1-3 business days</strong>
                </div>
              </div>
              <p style={{ marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
                You'll receive your Admission Number and login credentials via email once approved.
              </p>
            </div>
          ),
          okText: 'Continue to Home',
          okButtonProps: { size: 'large' },
          onOk() {
            // Logout and redirect to landing page
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
          },
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit application';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
  }

  return (
    <div className="application-page-container">
      <button className="app-back-button" onClick={() => navigate('/register')}>
        <ArrowLeftOutlined /> Back
      </button>

      <div className="application-wrapper">
        <div className="application-card">
          <div className="app-header">
            <div className="app-icon">📝</div>
            <h1>Complete Your Application</h1>
            <p>Phase 2: Detailed Information Form</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>

          <Alert
            message="Please fill in all required fields accurately. This information will be used for your admission process."
            type="info"
            showIcon
            style={{ marginBottom: '24px', borderRadius: '8px' }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="application-form"
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: '1',
                  label: 'Personal Details',
                  children: (
                    <div className="tab-content">
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <div className="readonly-field">
                            <label>Full Name</label>
                            <input type="text" value={user?.name} readOnly />
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <div className="readonly-field">
                            <label>Email Address</label>
                            <input type="email" value={user?.email} readOnly />
                          </div>
                        </Col>
                      </Row>

                      <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[
                          { required: true, message: 'Phone number is required' },
                          { pattern: /^[0-9]{10}$/, message: 'Enter a valid 10-digit number' }
                        ]}
                      >
                        <Input placeholder="Mobile Number (10 digits)" maxLength="10" />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="dob"
                            label="Date of Birth"
                            rules={[{ required: true, message: 'DOB is required' }]}
                          >
                            <DatePicker style={{ width: '100%' }} placeholder="Select DOB" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item name="gender" label="Gender">
                            <Select placeholder="Select gender">
                              <Select.Option value="Male">Male</Select.Option>
                              <Select.Option value="Female">Female</Select.Option>
                              <Select.Option value="Other">Other</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item name="category" label="Category">
                            <Select placeholder="Select category">
                              <Select.Option value="General">General</Select.Option>
                              <Select.Option value="SC">SC</Select.Option>
                              <Select.Option value="ST">ST</Select.Option>
                              <Select.Option value="OBC">OBC</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item name="bloodGroup" label="Blood Group">
                            <Select placeholder="Select blood group">
                              <Select.Option value="A+">A+</Select.Option>
                              <Select.Option value="A-">A-</Select.Option>
                              <Select.Option value="B+">B+</Select.Option>
                              <Select.Option value="B-">B-</Select.Option>
                              <Select.Option value="AB+">AB+</Select.Option>
                              <Select.Option value="AB-">AB-</Select.Option>
                              <Select.Option value="O+">O+</Select.Option>
                              <Select.Option value="O-">O-</Select.Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item name="nationality" label="Nationality">
                        <Input placeholder="Nationality" />
                      </Form.Item>
                    </div>
                  ),
                },
                {
                  key: '2',
                  label: 'Guardian Details',
                  children: (
                    <div className="tab-content">
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item name="fatherName" label="Father's Name">
                            <Input placeholder="Enter father's name" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item name="fatherPhone" label="Father's Phone">
                            <Input placeholder="10-digit phone number" maxLength="10" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item name="motherName" label="Mother's Name">
                            <Input placeholder="Enter mother's name" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item name="motherPhone" label="Mother's Phone">
                            <Input placeholder="10-digit phone number" maxLength="10" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item name="primaryGuardian" label="Primary Guardian">
                            <Input placeholder="Primary guardian name" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item name="guardianPhone" label="Guardian Phone">
                            <Input placeholder="10-digit phone number" maxLength="10" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item name="guardianEmail" label="Guardian Email">
                        <Input type="email" placeholder="Guardian email address" />
                      </Form.Item>

                      <Form.Item
                        name="address"
                        label="Complete Address"
                        rules={[{ required: true, message: 'Address is required' }]}
                      >
                        <Input.TextArea placeholder="Street address, city, state, pin code" rows={4} />
                      </Form.Item>
                    </div>
                  ),
                },
                {
                  key: '3',
                  label: 'Academic Details',
                  children: (
                    <div className="tab-content">
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="tenthMarks"
                            label="10th Marks/Percentage"
                            rules={[{ required: true, message: '10th marks are required' }]}
                          >
                            <Input type="number" placeholder="e.g., 95.5" step="0.01" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            name="twelthMarks"
                            label="12th Marks/Percentage"
                            rules={[{ required: true, message: '12th marks are required' }]}
                          >
                            <Input type="number" placeholder="e.g., 92.3" step="0.01" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item name="previousSchool" label="Previous School/College">
                        <Input placeholder="Name of previous institution" />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item name="previousBoard" label="Board/University">
                            <Input placeholder="CBSE, State Board, etc." />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item name="percentage" label="Previous Percentage/CGPA">
                            <Input type="number" placeholder="e.g., 88.5" step="0.01" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Alert
                        message="Tip: Ensure all academic details are accurate as they will be verified during the admission process."
                        type="warning"
                        showIcon
                        style={{ marginTop: '16px', borderRadius: '8px' }}
                      />
                    </div>
                  ),
                },
              ]}
            />

            <div className="form-actions">
              <Button
                type="default"
                size="large"
                onClick={() => form.resetFields()}
                className="reset-button"
              >
                Clear Form
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="submit-button"
              >
                Submit Application
              </Button>
            </div>
          </Form>
        </div>

        <div className="application-info-section">
          <Card className="info-card">
            <h3>📋 What Happens Next?</h3>
            <div className="process-step">
              <div className="step-number">1</div>
              <p>Submit your application</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <p>Admin reviews your application</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <p>Receive approval email</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <p>Access your dashboard</p>
            </div>
          </Card>

          <Card className="info-card">
            <h3>⚡ Important Notes</h3>
            <ul className="notes-list">
              <li>All information must be accurate</li>
              <li>Review before submitting</li>
              <li>Check your email regularly</li>
              <li>Processing takes 1-3 days</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationFormPage;
