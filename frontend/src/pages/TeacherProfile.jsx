import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Input,
  Upload,
  Avatar,
  Spin,
  message,
  Tabs,
  Descriptions,
  Empty,
  Space,
  Typography,
  Modal
} from 'antd';
import { UserOutlined, CameraOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../utils/api';
import '../styles/TeacherProfile.css';

const { Title, Text } = Typography;

const TeacherProfile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [form] = Form.useForm();
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchTeacherProfile();
  }, []);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/teacher/profile');
      if (response.data?.success && response.data?.teacher) {
        setProfile(response.data.teacher);
        form.setFieldsValue({
          firstName: response.data.teacher.personalDetails?.firstName || '',
          lastName: response.data.teacher.personalDetails?.lastName || '',
          email: response.data.teacher.email || '',
          phone: response.data.teacher.personalDetails?.phone || '',
          qualification: response.data.teacher.personalDetails?.qualification || '',
          specialization: response.data.teacher.personalDetails?.specialization || '',
          experience: response.data.teacher.personalDetails?.experience || '',
          department: response.data.teacher.department || '',
          address: response.data.teacher.personalDetails?.address || '',
          city: response.data.teacher.personalDetails?.city || '',
          state: response.data.teacher.personalDetails?.state || '',
          pinCode: response.data.teacher.personalDetails?.pinCode || '',
        });
      }
    } catch (error) {
      message.error('Failed to load profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (values) => {
    try {
      setUpdating(true);
      const formData = new FormData();
      
      Object.keys(values).forEach(key => {
        formData.append(key, values[key] || '');
      });

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await api.put('/teacher/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.success) {
        message.success('Profile updated successfully');
        setIsEditing(false);
        setPhotoFile(null);
        setPhotoPreview(null);
        fetchTeacherProfile();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="teacher-profile-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="teacher-profile-container">
        <Empty description="Profile not found" />
      </div>
    );
  }

  const profilePhoto = photoPreview || (profile?.personalDetails?.photo ? 
    `http://localhost:5000/uploads/${profile.personalDetails.photo.split('/').pop()}` : 
    null);

  return (
    <div className="teacher-profile-container">
      <div className="profile-header">
        <Card className="profile-card-header">
          <Row gutter={24}>
            <Col xs={24} sm={6} className="profile-avatar-col">
              <div className="avatar-wrapper">
                <Avatar
                  size={150}
                  src={profilePhoto}
                  icon={<UserOutlined />}
                  className="profile-avatar-large"
                />
                {isEditing && (
                  <label htmlFor="photo-upload" className="photo-upload-label">
                    <CameraOutlined />
                  </label>
                )}
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                  disabled={!isEditing}
                />
              </div>
            </Col>
            <Col xs={24} sm={18}>
              <div className="profile-header-info">
                <div className="header-title">
                  <Title level={2} style={{ margin: 0 }}>
                    {profile?.personalDetails?.firstName} {profile?.personalDetails?.lastName}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    {profile?.department || 'Faculty'}
                  </Text>
                </div>
                <div className="header-details">
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{profile?.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{profile?.personalDetails?.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Experience:</span>
                    <span className="detail-value">{profile?.personalDetails?.experience || 'N/A'} years</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      <Card className="profile-content-card">
        <div className="profile-header-buttons">
          <Space>
            {!isEditing && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                size="large"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
            {isEditing && (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  size="large"
                  loading={updating}
                  onClick={() => form.submit()}
                >
                  Save Changes
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    setIsEditing(false);
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    fetchTeacherProfile();
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
          </Space>
        </div>

        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: 'Personal Information',
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveProfile}
                  disabled={!isEditing}
                  className="profile-form"
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="firstName"
                        label="First Name"
                        rules={[{ required: true, message: 'Please enter first name' }]}
                      >
                        <Input placeholder="First Name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="lastName"
                        label="Last Name"
                        rules={[{ required: true, message: 'Please enter last name' }]}
                      >
                        <Input placeholder="Last Name" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[{ type: 'email', message: 'Invalid email' }]}
                      >
                        <Input placeholder="Email" disabled />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[{ pattern: /^[0-9-]{10,}$/, message: 'Invalid phone number' }]}
                      >
                        <Input placeholder="Phone Number" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="qualification"
                        label="Qualification"
                      >
                        <Input placeholder="e.g., M.Sc, B.Tech" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="specialization"
                        label="Specialization"
                      >
                        <Input placeholder="e.g., Computer Science" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="experience"
                        label="Experience (Years)"
                      >
                        <Input type="number" placeholder="Years of experience" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="department"
                        label="Department"
                      >
                        <Input placeholder="Department" disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              ),
            },
            {
              key: '2',
              label: 'Address Information',
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveProfile}
                  disabled={!isEditing}
                  className="profile-form"
                >
                  <Row gutter={16}>
                    <Col xs={24}>
                      <Form.Item
                        name="address"
                        label="Address"
                      >
                        <Input.TextArea rows={3} placeholder="Street Address" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="city"
                        label="City"
                      >
                        <Input placeholder="City" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="state"
                        label="State"
                      >
                        <Input placeholder="State" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="pinCode"
                        label="Pin Code"
                      >
                        <Input placeholder="Pin Code" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default TeacherProfile;
