import { useState, useEffect } from 'react';
import { Card, List, Tag, Empty, Spin, Button, Modal, Form, Input, message, Space, Divider, Badge } from 'antd';
import { BellOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../utils/api';

const NoticesPage = ({ user }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [viewModal, setViewModal] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/messages/notice');
      setNotices(response.data.data || response.data.notices || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNotice = (notice) => {
    setSelectedNotice(notice);
    setViewModal(true);
  };

  const handleDelete = async (noticeId) => {
    try {
      await api.delete(`/messages/notice/${noticeId}`);
      message.success('Notice deleted');
      fetchNotices();
    } catch (error) {
      message.error('Failed to delete notice');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'blue';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'notice':
        return '📢';
      case 'announcement':
        return '📣';
      case 'urgent':
        return '⚠️';
      case 'event':
        return '📅';
      default:
        return '📝';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <BellOutlined style={{ fontSize: 24 }} />
            <span>Important Announcements & Notices</span>
          </Space>
        }
        extra={<Badge count={notices.length} color="#f5222d" />}
      >
        {loading ? (
          <Spin />
        ) : notices.length === 0 ? (
          <Empty description="No notices yet" />
        ) : (
          <List
            dataSource={notices}
            renderItem={(notice, idx) => (
              <List.Item
                key={idx}
                style={{
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  backgroundColor: notice.isRead ? '#ffffff' : '#fafafa',
                }}
                actions={[
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewNotice(notice)}
                  >
                    View
                  </Button>,
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: 'Delete Notice',
                        content: 'Are you sure you want to delete this notice?',
                        okText: 'Yes',
                        cancelText: 'No',
                        onOk: () => handleDelete(notice._id),
                      });
                    }}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<span style={{ fontSize: 24 }}>{getTypeIcon(notice.type)}</span>}
                  title={
                    <Space>
                      <strong>{notice.subject || notice.title || 'Notice'}</strong>
                      {notice.priority && (
                        <Tag color={getPriorityColor(notice.priority)}>
                          {notice.priority.toUpperCase()}
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <p style={{ margin: '8px 0', color: '#666' }}>
                        {notice.message || notice.description}
                      </p>
                      <small style={{ color: '#999' }}>
                        {new Date(notice.createdAt || notice.date).toLocaleString()}
                      </small>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title={selectedNotice?.subject || selectedNotice?.title || 'Notice'}
        open={viewModal}
        onCancel={() => {
          setViewModal(false);
          setSelectedNotice(null);
        }}
        footer={null}
        width={700}
      >
        {selectedNotice && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              {selectedNotice.priority && (
                <div>
                  <strong>Priority:</strong>{' '}
                  <Tag color={getPriorityColor(selectedNotice.priority)}>
                    {selectedNotice.priority.toUpperCase()}
                  </Tag>
                </div>
              )}
              <div>
                <strong>Date:</strong> {new Date(selectedNotice.createdAt || selectedNotice.date).toLocaleString()}
              </div>
              <Divider />
              <div>
                <strong>Message:</strong>
                <p style={{ marginTop: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {selectedNotice.message || selectedNotice.description}
                </p>
              </div>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NoticesPage;
