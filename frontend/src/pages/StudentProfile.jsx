import { useState, useEffect } from 'react';
import { Row, Col, Card, Descriptions, Tag, Button, Spin, message, Divider, Avatar, Space, Modal, Form, Input, Upload } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, FileTextOutlined, EditOutlined, SaveOutlined, CameraOutlined } from '@ant-design/icons';
import api from '../utils/api';

const StudentProfile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm] = Form.useForm();
  const [editModal, setEditModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchStudentProfile();
  }, [user?.id]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students/profile');
      setProfile(response.data.student);
      setPhotoPreview(response.data.student?.personalDetails?.photo || null);
      editForm.setFieldsValue({
        phone: response.data.student?.personalDetails?.phone,
        dob: response.data.student?.personalDetails?.dob,
        gender: response.data.student?.personalDetails?.gender,
        bloodGroup: response.data.student?.personalDetails?.bloodGroup,
        nationality: response.data.student?.personalDetails?.nationality,
        fatherName: response.data.student?.guardianDetails?.fatherName,
        fatherPhone: response.data.student?.guardianDetails?.fatherPhone,
        motherName: response.data.student?.guardianDetails?.motherName,
        motherPhone: response.data.student?.guardianDetails?.motherPhone,
        primaryGuardian: response.data.student?.guardianDetails?.primaryGuardian,
        guardianPhone: response.data.student?.guardianDetails?.guardianPhone,
        guardianEmail: response.data.student?.guardianDetails?.guardianEmail,
        address: response.data.student?.guardianDetails?.address,
      });
    } catch (error) {
      message.error('Failed to load profile');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setPhotoFile(file);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleUpdateProfile = async (values) => {
    try {
      const updateData = {
        personalDetails: {
          ...profile.personalDetails,
          phone: values.phone,
          dob: values.dob,
          gender: values.gender,
          bloodGroup: values.bloodGroup,
          nationality: values.nationality,
        },
        guardianDetails: {
          ...profile.guardianDetails,
          fatherName: values.fatherName,
          fatherPhone: values.fatherPhone,
          motherName: values.motherName,
          motherPhone: values.motherPhone,
          primaryGuardian: values.primaryGuardian,
          guardianPhone: values.guardianPhone,
          guardianEmail: values.guardianEmail,
          address: values.address,
        },
      };

      if (photoFile || photoPreview) {
        updateData.personalDetails.photo = photoPreview;
      }

      await api.put(
        '/students/profile',
        updateData
      );

      message.success('Profile updated successfully');
      setEditModal(false);
      setPhotoFile(null);
      fetchStudentProfile();
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  if (loading) {
    return <Spin />;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  const getEnrollmentColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'orange';
      case 'graduated':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={6} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                size={120}
                src={photoPreview}
                icon={!photoPreview && <UserOutlined />}
                style={{ 
                  backgroundColor: !photoPreview ? '#1890ff' : undefined,
                  marginBottom: 16 
                }}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<CameraOutlined />}
                size="large"
                style={{ 
                  position: 'absolute', 
                  bottom: 16, 
                  right: 0 
                }}
                onClick={() => {
                  setPhotoPreview(profile?.personalDetails?.photo || null);
                  setPhotoFile(null);
                  setEditModal(true);
                }}
              />
            </div>
            <div>
              <h2>{profile?.personalDetails?.firstName} {profile?.personalDetails?.lastName}</h2>
              <Tag color={getEnrollmentColor(profile?.academicDetails?.enrollmentStatus)}>
                {profile?.academicDetails?.enrollmentStatus?.toUpperCase()}
              </Tag>
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Descriptions
              bordered
              column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              size="small"
            >
              <Descriptions.Item label="Admission Number" span={1}>
                <strong>{profile?.admissionNumber || 'N/A'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={1}>
                <Space>
                  <MailOutlined />
                  {profile?.email}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Mobile Number" span={1}>
                <Space>
                  <PhoneOutlined />
                  {profile?.mobileNumber || profile?.personalDetails?.phone || 'N/A'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Course" span={1}>
                {(typeof profile?.courseApplyingFor === 'string' ? profile?.courseApplyingFor : profile?.courseApplyingFor?.courseName) || 
                 (typeof profile?.academicDetails?.course === 'string' ? profile?.academicDetails?.course : profile?.academicDetails?.course?.courseName) || 
                 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Batch" span={1}>
                {profile?.academicDetails?.batch || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Roll Number" span={1}>
                {profile?.academicDetails?.rollNumber || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
          <Card title="Personal Details" variant="outlined">
            <Descriptions
              column={1}
              size="small"
              layout="vertical"
            >
              <Descriptions.Item label="Date of Birth">
                {profile?.personalDetails?.dob
                  ? new Date(profile.personalDetails.dob).toLocaleDateString()
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {profile?.personalDetails?.gender || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Blood Group">
                {profile?.personalDetails?.bloodGroup || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Nationality">
                {profile?.personalDetails?.nationality || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Academic Details" variant="outlined">
            <Descriptions
              column={1}
              size="small"
              layout="vertical"
            >
              <Descriptions.Item label="Current Semester">
                {profile?.academicDetails?.currentSemester || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="CGPA">
                <strong>{profile?.academicDetails?.cgpa || '0.00'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Enrollment Status">
                <Tag color={getEnrollmentColor(profile?.academicDetails?.enrollmentStatus)}>
                  {profile?.academicDetails?.enrollmentStatus?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Is Active">
                <Tag color={profile?.isActive ? 'green' : 'red'}>
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="Guardian Details" style={{ marginTop: 24 }} bordered>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Descriptions
              column={1}
              size="small"
              layout="vertical"
              title="Father"
            >
              <Descriptions.Item label="Name">
                {profile?.guardianDetails?.fatherName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {profile?.guardianDetails?.fatherPhone || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={12}>
            <Descriptions
              column={1}
              size="small"
              layout="vertical"
              title="Mother"
            >
              <Descriptions.Item label="Name">
                {profile?.guardianDetails?.motherName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {profile?.guardianDetails?.motherPhone || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <Divider />

        <Descriptions
          column={1}
          size="small"
          layout="vertical"
          title="Primary Guardian"
        >
          <Descriptions.Item label="Name">
            {profile?.guardianDetails?.primaryGuardian || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {profile?.guardianDetails?.guardianPhone || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {profile?.guardianDetails?.guardianEmail || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {profile?.guardianDetails?.address || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {profile?.documents && profile.documents.length > 0 && (
        <Card title="Uploaded Documents" style={{ marginTop: 24 }} bordered>
          <Row gutter={[16, 16]}>
            {profile.documents.map((doc, idx) => (
              <Col xs={24} sm={12} md={8} key={idx}>
                <Card size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    <div>
                      <strong>{doc.documentType}</strong>
                    </div>
                    <small>{doc.fileName}</small>
                    <small>{new Date(doc.uploadDate).toLocaleDateString()}</small>
                    {doc.fileUrl && (
                      <Button
                        type="link"
                        size="small"
                        href={doc.fileUrl}
                        target="_blank"
                      >
                        Download
                      </Button>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      <Modal
        title="Edit Profile"
        open={editModal}
        onCancel={() => setEditModal(false)}
        footer={null}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateProfile}
          autoComplete="off"
        >
          <Divider orientation="left">Personal Information</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="First Name"
                name="firstName"
              >
                <Input value={profile?.personalDetails?.firstName} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
              >
                <Input value={profile?.personalDetails?.lastName} disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
              >
                <Input value={profile?.email} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Phone"
                name="phone"
              >
                <Input placeholder="Enter your phone number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Date of Birth"
                name="dob"
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Gender"
                name="gender"
              >
                <Input placeholder="e.g., Male, Female" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Blood Group"
                name="bloodGroup"
              >
                <Input placeholder="e.g., O+" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Nationality"
            name="nationality"
          >
            <Input placeholder="e.g., Indian" />
          </Form.Item>

          <Divider orientation="left">Profile Photo</Divider>
          <Form.Item
            label="Profile Photo"
          >
            <div style={{ marginBottom: 16 }}>
              {photoPreview && (
                <Avatar
                  size={100}
                  src={photoPreview}
                  style={{ marginBottom: 16, display: 'block' }}
                />
              )}
              <Upload
                maxCount={1}
                beforeUpload={handlePhotoChange}
                listType="picture"
                accept="image/*"
              >
                <Button icon={<CameraOutlined />}>
                  Upload Photo
                </Button>
              </Upload>
            </div>
          </Form.Item>

          <Divider orientation="left">Guardian Information</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Father's Name"
                name="fatherName"
              >
                <Input placeholder="Father's full name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Father's Phone"
                name="fatherPhone"
              >
                <Input placeholder="Father's phone number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mother's Name"
                name="motherName"
              >
                <Input placeholder="Mother's full name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Mother's Phone"
                name="motherPhone"
              >
                <Input placeholder="Mother's phone number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Primary Guardian Name"
                name="primaryGuardian"
              >
                <Input placeholder="Primary guardian's name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Primary Guardian Phone"
                name="guardianPhone"
              >
                <Input placeholder="Primary guardian's phone" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Primary Guardian Email"
                name="guardianEmail"
              >
                <Input type="email" placeholder="Primary guardian's email" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Address"
            name="address"
          >
            <Input.TextArea placeholder="Complete address" rows={3} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentProfile;
