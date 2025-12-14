import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Alert } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, PhoneOutlined, ArrowLeftOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import api from '../utils/api';
import useAuth from '../hooks/useAuth';
import '../styles/AuthPages.css';

const StudentRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { login, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        if (user.applicationSubmitted === false) {
          navigate('/application-form');
        } else {
          navigate('/');
        }
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const validateMobile = (_, value) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!value) {
      return Promise.reject('Please input your mobile number');
    }
    if (!phoneRegex.test(value)) {
      return Promise.reject('Please enter a valid 10-digit mobile number');
    }
    return Promise.resolve();
  };

  const handleRegister = async (values) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register-student', {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        mobile: values.mobile.trim(),
        password: values.password,
      });

      if (response.data.success) {
        login(response.data.user, response.data.token);
        message.success('Registration successful! Please complete your application.');
        navigate('/application-form');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <button className="back-button-minimal" onClick={() => navigate('/')}>
        <ArrowLeftOutlined /> Back
      </button>

      <div className="auth-layout">
        <div className="auth-left-section">
          <div className="auth-content-card">
            <div className="auth-icon-header">✨</div>

            <div className="auth-header-section">
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join our educational platform</p>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                className="auth-alert"
                onClose={() => setError('')}
                style={{ marginBottom: '20px' }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleRegister}
              className="auth-form"
            >
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Please enter your full name' },
                  { min: 3, message: 'Name must be at least 3 characters' },
                ]}
              >
                <Input
                  placeholder="Full Name"
                  prefix={<UserOutlined />}
                  className="auth-input"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input
                  placeholder="Email Address"
                  prefix={<MailOutlined />}
                  className="auth-input"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="mobile"
                rules={[{ validator: validateMobile }]}
              >
                <Input
                  placeholder="Mobile Number (10 digits)"
                  prefix={<PhoneOutlined />}
                  className="auth-input"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password
                  placeholder="Password"
                  prefix={<LockOutlined />}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  className="auth-input"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  placeholder="Confirm Password"
                  prefix={<LockOutlined />}
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  className="auth-input"
                  size="large"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="auth-button"
                size="large"
                block
              >
                Create Account
              </Button>
            </Form>

            <div className="auth-footer-section">
              <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
            </div>

            <div className="auth-divider"></div>

            <div className="auth-other-roles">
              <p className="roles-text">Other options:</p>
              <div className="roles-button-group">
                <Link to="/teacher/login" className="role-button-link">Teacher</Link>
                <Link to="/admin/login" className="role-button-link">Admin</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right-section">
          <div className="auth-feature-box">
            <div className="feature-icon">🎓</div>
            <h3>Learn Anything</h3>
            <p>Access comprehensive course materials</p>
          </div>
          <div className="auth-feature-box">
            <div className="feature-icon">🏆</div>
            <h3>Excel & Succeed</h3>
            <p>Achieve your academic goals</p>
          </div>
          <div className="auth-feature-box">
            <div className="feature-icon">🤝</div>
            <h3>Connect & Grow</h3>
            <p>Build meaningful relationships</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
