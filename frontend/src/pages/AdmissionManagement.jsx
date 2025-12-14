import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Table, Button, Modal, message, Tabs, Statistic, Row, Col, Card, Tag, Input, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';

const AdmissionManagement = ({ user }) => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [searchText, setSearchText] = useState('');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchStats = async () => {
    try {
      const response = await api.get('/admissions/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchAdmissions = async (status = null) => {
    try {
      setLoading(true);
      const url = status
        ? `/admissions/all?status=${status}`
        : '/admissions/all';

      const response = await api.get(url);
      if (response.data.success) {
        setAdmissions(response.data.data);
      }
    } catch (error) {
      message.error('Failed to fetch admissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAdmissions();
  }, []);

  const handleApprove = async (admissionId) => {
    try {
      const response = await api.put(
        `/admissions/approve/${admissionId}`,
        {}
      );

      if (response.data.success) {
        message.success('Admission approved successfully!');
        setSelectedAdmission(null);
        fetchAdmissions();
        fetchStats();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to approve admission');
    }
  };

  const handleReject = async (admissionId) => {
    if (!rejectionReason.trim()) {
      message.error('Please provide a rejection reason');
      return;
    }

    try {
      const response = await api.put(
        `/admissions/reject/${admissionId}`,
        { rejectionReason }
      );

      if (response.data.success) {
        message.success('Admission rejected successfully');
        setRejectModalVisible(false);
        setRejectionReason('');
        setSelectedAdmission(null);
        fetchAdmissions();
        fetchStats();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to reject admission');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'personalDetails',
      render: (details) => `${details.firstName} ${details.lastName}`,
      sorter: (a, b) => `${a.personalDetails.firstName}`.localeCompare(`${b.personalDetails.firstName}`),
    },
    {
      title: 'Email',
      dataIndex: ['personalDetails', 'email'],
      render: (email) => email,
    },
    {
      title: 'Phone',
      dataIndex: ['personalDetails', 'phone'],
    },
    {
      title: 'Batch',
      dataIndex: ['academicDetails', 'batch'],
    },
    {
      title: 'Status',
      dataIndex: 'admissionStatus',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'orange', icon: <ClockCircleOutlined /> },
          approved: { color: 'green', icon: <CheckCircleOutlined /> },
          rejected: { color: 'red', icon: <CloseCircleOutlined /> },
        };
        const config = statusConfig[status] || { color: 'gray' };
        return <Tag color={config.color} icon={config.icon}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.admissionStatus === value,
    },
    {
      title: 'Applied Date',
      dataIndex: 'appliedDate',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.appliedDate) - new Date(b.appliedDate),
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => setSelectedAdmission(record)}>
            View
          </Button>
          {record.admissionStatus === 'pending' && (
            <>
              <Button type="primary" size="small" onClick={() => handleApprove(record._id)}>
                Approve
              </Button>
              <Button danger size="small" onClick={() => {
                setSelectedAdmission(record);
                setRejectModalVisible(true);
              }}>
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const filteredAdmissions = admissions.filter(admission =>
    `${admission.personalDetails.firstName} ${admission.personalDetails.lastName}`.toLowerCase().includes(searchText.toLowerCase()) ||
    admission.personalDetails.email.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="dashboard-card">
      <h2>Admission Management</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={stats.total}
              prefix="📋"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix="⏳"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              valueStyle={{ color: '#52c41a' }}
              prefix="✅"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={stats.rejected}
              valueStyle={{ color: '#ff4d4f' }}
              prefix="❌"
            />
          </Card>
        </Col>
      </Row>

      <Input
        placeholder="Search by name or email"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <Table
        columns={columns}
        dataSource={filteredAdmissions}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Admission Details"
        open={selectedAdmission !== null}
        onCancel={() => {
          setSelectedAdmission(null);
          setRejectModalVisible(false);
        }}
        footer={null}
        width={700}
      >
        {selectedAdmission && (
          <div>
            <h3>Personal Details</h3>
            <p><strong>Name:</strong> {selectedAdmission.personalDetails.firstName} {selectedAdmission.personalDetails.lastName}</p>
            <p><strong>Email:</strong> {selectedAdmission.personalDetails.email}</p>
            <p><strong>Phone:</strong> {selectedAdmission.personalDetails.phone}</p>
            <p><strong>DOB:</strong> {new Date(selectedAdmission.personalDetails.dob).toLocaleDateString()}</p>
            <p><strong>Gender:</strong> {selectedAdmission.personalDetails.gender}</p>
            <p><strong>Blood Group:</strong> {selectedAdmission.personalDetails.bloodGroup}</p>

            <h3>Guardian Details</h3>
            <p><strong>Father Name:</strong> {selectedAdmission.guardianDetails.fatherName}</p>
            <p><strong>Mother Name:</strong> {selectedAdmission.guardianDetails.motherName}</p>
            <p><strong>Guardian Name:</strong> {selectedAdmission.guardianDetails.primaryGuardian}</p>
            <p><strong>Address:</strong> {selectedAdmission.guardianDetails.address}</p>

            <h3>Academic Details</h3>
            <p><strong>Batch:</strong> {selectedAdmission.academicDetails.batch}</p>
            <p><strong>Previous School:</strong> {selectedAdmission.academicDetails.previousSchool}</p>
            <p><strong>Board:</strong> {selectedAdmission.academicDetails.previousBoard}</p>
            <p><strong>Percentage:</strong> {selectedAdmission.academicDetails.percentage}%</p>

            <h3>Status: <Tag color={selectedAdmission.admissionStatus === 'approved' ? 'green' : selectedAdmission.admissionStatus === 'rejected' ? 'red' : 'orange'}>
              {selectedAdmission.admissionStatus.toUpperCase()}
            </Tag></h3>

            {selectedAdmission.admissionStatus === 'rejected' && (
              <p><strong>Rejection Reason:</strong> {selectedAdmission.rejectionReason}</p>
            )}

            {selectedAdmission.admissionStatus === 'pending' && (
              <Space style={{ marginTop: 16 }}>
                <Button type="primary" onClick={() => handleApprove(selectedAdmission._id)}>
                  Approve
                </Button>
                <Button danger onClick={() => setRejectModalVisible(true)}>
                  Reject
                </Button>
              </Space>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="Reject Admission"
        open={rejectModalVisible && selectedAdmission !== null}
        onOk={() => handleReject(selectedAdmission._id)}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectionReason('');
        }}
      >
        <p>Please provide a reason for rejection:</p>
        <Input.TextArea
          rows={4}
          placeholder="Rejection reason..."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default AdmissionManagement;
