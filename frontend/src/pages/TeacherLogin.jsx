import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import api from '../utils/api';
import useAuth from '../hooks/useAuth';
import '../styles/AuthPages.css';

const TeacherLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (values) => {
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login-teacher', {
        employeeId: values.employeeId.trim(),
        password: values.password,
      });

      if (response.data.success) {
        // Use AuthContext login function
        login(response.data.user, response.data.token);
        message.success('Login successful');
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
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
            <div className="auth-icon-header">👨‍🏫</div>

            <div className="auth-header-section">
              <h1 className="auth-title">Teacher Login</h1>
              <p className="auth-subtitle">Access your teaching dashboard</p>
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
                name="employeeId"
                rules={[{ required: true, message: 'Please enter your employee ID' }]}
              >
                <Input
                  placeholder="Employee ID"
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
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
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
              <p>Need help? <Link to="/support" className="auth-link">Contact Support</Link></p>
            </div>

            <div className="auth-divider"></div>

            <div className="auth-other-roles">
              <p className="roles-text">Other login options:</p>
              <div className="roles-button-group">
                <Link to="/login" className="role-button-link">Student</Link>
                <Link to="/admin/login" className="role-button-link">Admin</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right-section">
          <div className="auth-feature-box">
            <div className="feature-icon">📋</div>
            <h3>Manage Classes</h3>
            <p>Organize and manage your courses</p>
          </div>
          <div className="auth-feature-box">
            <div className="feature-icon">📈</div>
            <h3>Track Grades</h3>
            <p>Grade and evaluate student performance</p>
          </div>
          <div className="auth-feature-box">
            <div className="feature-icon">✅</div>
            <h3>Mark Attendance</h3>
            <p>Keep accurate attendance records</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
