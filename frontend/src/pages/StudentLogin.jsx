import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Alert } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import api from '../utils/api';
import useAuth from '../hooks/useAuth';
import '../styles/AuthPages.css';

const StudentLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const { login, user } = useAuth();

  // 🚀 Redirect if already logged in
  useEffect(() => {
    if (!user) return;

    const role = user.role?.toLowerCase();

    if (role === 'student') {
      if (user.applicationSubmitted === false) {
        navigate('/application-form');
      } else {
        navigate('/dashboard');      // ✅ student dashboard
      }
    } else {
      navigate('/dashboard');        // teacher/admin dashboard (their own layout)
    }
  }, [user, navigate]);

  // 🚀 Handle login submit
  const handleLogin = async (values) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login-student', {
        admissionNumber: values.admissionNumber.trim(),
        password: values.password,
      });

      if (response.data.success) {
        const loggedInUser = response.data.user;

        // save to auth context
        login(loggedInUser, response.data.token);
        message.success('Login successful');

        // redirect based on application status
        if (loggedInUser.applicationSubmitted === false) {
          navigate('/application-form');
        } else {
          navigate('/dashboard');    // ✅ go to student dashboard
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Login failed. Please check your credentials.';
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
            <div className="auth-icon-header">👨‍🎓</div>

            <div className="auth-header-section">
              <h1 className="auth-title">Student Login</h1>
              <p className="auth-subtitle">Welcome back! Access your dashboard</p>
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
              onFinish={handleLogin}
              className="auth-form"
            >
              <Form.Item
                name="admissionNumber"
                rules={[{ required: true, message: 'Please enter your admission number' }]}
              >
                <Input
                  placeholder="Admission Number"
                  prefix={<UserOutlined />}
                  className="auth-input"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Please enter your password' }]}
              >
                <Input.Password
                  placeholder="Password"
                  prefix={<LockOutlined />}
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                  className="auth-input"
                  size="large"
                />
              </Form.Item>

              <div className="auth-options">
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="auth-button"
                size="large"
                block
              >
                Sign In
              </Button>
            </Form>

            <div className="auth-footer-section">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Register here
                </Link>
              </p>
            </div>

            <div className="auth-divider"></div>

            <div className="auth-other-roles">
              <p className="roles-text">Other login options:</p>
              <div className="roles-button-group">
                <Link to="/teacher/login" className="role-button-link">
                  Teacher
                </Link>
                <Link to="/admin/login" className="role-button-link">
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right-section">
          <div className="auth-feature-box">
            <div className="feature-icon">📚</div>
            <h3>Access Your Courses</h3>
            <p>View all your enrolled courses and materials</p>
          </div>
          <div className="auth-feature-box">
            <div className="feature-icon">📊</div>
            <h3>Track Your Progress</h3>
            <p>Monitor your grades and attendance</p>
          </div>
          <div className="auth-feature-box">
            <div className="feature-icon">💬</div>
            <h3>Communicate</h3>
            <p>Connect with teachers and peers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;