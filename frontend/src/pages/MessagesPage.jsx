// FRONTEND/pages/MessagesPage.jsx
import { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, List, Button, Modal, Form, Input, message, Badge, Tag, Space, Empty, Select } from 'antd';
import { MailOutlined, SendOutlined, DeleteOutlined, CheckOutlined, NotificationOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Option } = Select;

const MessagesPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [composeModal, setComposeModal] = useState(false);
  const [composeForm] = Form.useForm();
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchTimeout = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
    const intv = setInterval(fetchUnreadCount, 30000); // every 30s
    return () => clearInterval(intv);
    // eslint-disable-next-line
  }, [page]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/received?page=${page}&limit=${limit}`);
      setMessages(response.data.messages || []);
      setUnreadCount(response.data.unreadCount ?? 0);
    } catch (error) {
      console.error('fetchMessages error', error);
      message.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/messages/unread-count');
      if (res.data && typeof res.data.unreadCount === 'number') setUnreadCount(res.data.unreadCount);
    } catch (e) {
      // ignore
    }
  };

  // Remote search for recipients (role: Admin/Teacher/Student)
  const searchRecipients = (role, q) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        setRecipientLoading(true);
        const res = await api.get(`/messages/users?role=${encodeURIComponent(role)}&search=${encodeURIComponent(q)}&limit=20`);
        setRecipientOptions(res.data.users || []);
      } catch (err) {
        console.error('searchRecipients error', err);
      } finally {
        setRecipientLoading(false);
      }
    }, 300);
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`, {});
      fetchMessages();
      fetchUnreadCount();
    } catch (error) {
      console.error('mark read error', error);
      message.error('Failed to update message');
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      message.success('Message deleted');
      fetchMessages();
      fetchUnreadCount();
    } catch (error) {
      console.error('delete message error', error);
      message.error('Failed to delete message');
    }
  };

  const handleCompose = async (values) => {
    try {
      if (!values.recipient || !values.recipientModel) {
        return message.error('Please select a recipient and type.');
      }
      const payload = {
        recipient: values.recipient,
        recipientModel: values.recipientModel,
        subject: values.subject,
        message: values.message,
        messageType: "text",
        priority: values.priority || "medium"
      };
      await api.post('/messages/send', payload);
      message.success('Message sent successfully');
      composeForm.resetFields();
      setComposeModal(false);
      fetchMessages();
      fetchUnreadCount();
    } catch (error) {
      console.error('compose error', error);
      const errMsg = error?.response?.data?.message || 'Failed to send message';
      message.error(errMsg);
    }
  };

  // Admin-only broadcast
  const handleBroadcast = async (values) => {
    try {
      if (!values.message) return message.error('Enter message content');
      await api.post('/messages/send-broadcast', { subject: values.subject, message: values.message });
      message.success('Broadcast sent to all students');
      setBroadcastModal(false);
    } catch (err) {
      console.error('broadcast error', err);
      const errMsg = err?.response?.data?.message || 'Failed to send broadcast';
      message.error(errMsg);
    }
  };

  const isAdmin = () => {
    const role = (user?.role || '').toLowerCase();
    return role === 'admin' || role === 'superadmin';
  };

  const renderSenderName = (msg) => {
    if (msg.senderName) return msg.senderName;
    if (msg.sender && msg.sender.personalDetails) {
      const pd = msg.sender.personalDetails;
      if (pd.firstName || pd.lastName) return `${pd.firstName || ""} ${pd.lastName || ""}`.trim();
    }
    if (msg.sender && (msg.sender.firstName || msg.sender.lastName)) {
      return `${msg.sender.firstName || ""} ${msg.sender.lastName || ""}`.trim();
    }
    return msg.sender?.email || msg.senderModel || 'Unknown';
  };

  return (
    <div style={{ padding: '20px' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <h2>
                  <MailOutlined /> Messages
                  {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: '10px' }} />}
                </h2>
              </Col>
              <Col>
                <Space>
                  {isAdmin() && (
                    <Button danger icon={<NotificationOutlined />} onClick={() => setBroadcastModal(true)}>
                      Broadcast to All Students
                    </Button>
                  )}
                  <Button type="primary" icon={<SendOutlined />} onClick={() => setComposeModal(true)}>
                    Compose Message
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Card title="Inbox" loading={loading}>
            {messages.length === 0 ? (
              <Empty description="No messages" />
            ) : (
              <List
                dataSource={messages}
                renderItem={(msg) => (
                  <List.Item
                    key={msg._id}
                    style={{
                      backgroundColor: msg.isRead ? 'transparent' : '#f0f5ff',
                      padding: '12px',
                      borderRadius: '4px',
                      marginBottom: '8px',
                    }}
                    extra={
                      <Space>
                        {!msg.isRead && (
                          <Button type="text" icon={<CheckOutlined />} size="small" onClick={() => handleMarkAsRead(msg._id)} />
                        )}
                        <Button type="text" icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(msg._id)} danger />
                      </Space>
                    }
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <span>{msg.subject || '(No subject)'}</span>
                          {!msg.isRead && <Tag color="blue">New</Tag>}
                        </Space>
                      }
                      description={
                        <div>
                          <p style={{ marginBottom: '4px' }}>From: {renderSenderName(msg)}</p>
                          <p style={{ marginBottom: '4px' }}>{msg.message?.substring(0, 150)}{msg.message?.length > 150 ? '...' : ''}</p>
                          <p style={{ color: '#999', fontSize: '12px' }}>{new Date(msg.createdAt).toLocaleString()}</p>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Quick Stats">
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Total Messages:</strong> {messages.length}</p>
              <p><strong>Unread:</strong> <Badge count={unreadCount} /></p>
              <p><strong>Read:</strong> {messages.length - unreadCount}</p>
            </div>
            <hr />
            <h4>Message Categories</h4>
            <ul>
              <li>Academic Updates</li>
              <li>Administrative Notices</li>
              <li>Fee Notifications</li>
              <li>Event Announcements</li>
            </ul>
          </Card>
        </Col>
      </Row>

      {/* Compose Modal */}
      <Modal title="Compose Message" open={composeModal} onCancel={() => { setComposeModal(false); composeForm.resetFields(); }} footer={null}>
        <Form form={composeForm} layout="vertical" onFinish={handleCompose} initialValues={{ recipientModel: 'Admin', priority: 'medium' }}>
          <Form.Item name="recipientModel" label="Recipient Type" rules={[{ required: true }]}>
            <Select onChange={() => setRecipientOptions([])} >
              <Option value="Admin">Admin</Option>
              <Option value="Teacher">Teacher</Option>
              <Option value="Student">Student</Option>
            </Select>
          </Form.Item>

          <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.recipientModel !== curValues.recipientModel}>
            {({ getFieldValue }) => (
              <Form.Item name="recipient" label="Recipient" rules={[{ required: true, message: 'Select recipient' }]}>
                <Select
                  showSearch
                  placeholder="Search recipients..."
                  notFoundContent={recipientLoading ? "Searching..." : null}
                  filterOption={false}
                  onSearch={(val) => {
                    const role = getFieldValue('recipientModel') || 'Admin';
                    if (!val) {
                      setRecipientOptions([]);
                      return;
                    }
                    searchRecipients(role, val);
                  }}
                  loading={recipientLoading}
                >
                  {recipientOptions.map(opt => (
                    <Option key={opt._id} value={opt._id}>
                      {opt.name} {opt.email ? `(${opt.email})` : ''} {opt.employeeId ? `- ${opt.employeeId}` : ''}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item name="subject" label="Subject"><Input placeholder="Subject (optional)" /></Form.Item>

          <Form.Item name="message" label="Message" rules={[{ required: true, message: 'Please enter message' }]}>
            <Input.TextArea rows={5} placeholder="Write your message..." />
          </Form.Item>

          <Form.Item name="priority" label="Priority"><Select><Option value="low">Low</Option><Option value="medium">Medium</Option><Option value="high">High</Option></Select></Form.Item>

          <Button type="primary" htmlType="submit" block icon={<SendOutlined />}>Send Message</Button>
        </Form>
      </Modal>

      {/* Broadcast Modal (Admin only) */}
      <Modal title="Broadcast to All Students" open={broadcastModal} onCancel={() => setBroadcastModal(false)} footer={null}>
        <Form onFinish={handleBroadcast}>
          <Form.Item name="subject" label="Subject"><Input placeholder="Broadcast subject (optional)" /></Form.Item>
          <Form.Item name="message" label="Message" rules={[{ required: true, message: 'Enter message' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Send Broadcast</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default MessagesPage;