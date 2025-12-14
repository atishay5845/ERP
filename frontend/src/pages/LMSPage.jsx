import { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Typography, Tag, Spin, Empty, Modal, Divider } from 'antd';
import {
  YoutubeOutlined,
  FileOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import '../styles/LMSPage.css';

const { Title, Text, Paragraph } = Typography;

const LMSPage = ({ user }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [user?.id]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lms/student/resources');
      if (response.data.success) {
        setResources(response.data.resources || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED REGEXP (No ESLint warnings)
  const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'youtube_link':
        return <YoutubeOutlined style={{ color: '#ef4444', fontSize: '24px' }} />;
      case 'pdf':
      case 'document':
        return <FileOutlined style={{ color: '#3b82f6', fontSize: '24px' }} />;
      case 'video':
        return <PlayCircleOutlined style={{ color: '#8b5cf6', fontSize: '24px' }} />;
      default:
        return <FileOutlined style={{ color: '#6b7280', fontSize: '24px' }} />;
    }
  };

  // No search functionality → show all resources
  const filteredResources = resources;

  // Hero Section
  const HeroSection = () => (
    <div className="lms-hero">
      <div className="container">
        <Title level={1} style={{ color: 'white', marginBottom: 20 }}>
          Learning Resources
        </Title>
        <Paragraph style={{ fontSize: '1.2rem', marginBottom: 30, maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
          Access study materials, videos, and learning resources shared by your instructors.
        </Paragraph>
      </div>
    </div>
  );

  // Resources List
  const ResourcesSection = () => (
    <div style={{ margin: '40px 0' }}>
      <Title level={2} style={{ marginBottom: 30 }}>Available Resources ({filteredResources.length})</Title>

      <Spin spinning={loading}>
        {filteredResources.length === 0 ? (
          <Empty description={loading ? 'Loading resources...' : 'No resources available'} />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredResources.map(resource => (
              <Col xs={24} sm={12} lg={8} key={resource._id}>
                <Card
                  hoverable
                  className="course-card"
                  onClick={() => {
                    setSelectedResource(resource);
                    setModalVisible(true);
                  }}
                  style={{ borderRadius: '12px', overflow: 'hidden' }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    {getResourceIcon(resource.type)}
                  </div>

                  <div className="course-content">
                    <div>
                      <Tag color={resource.type === 'youtube_link' ? 'red' : 'blue'} style={{ marginBottom: 10 }}>
                        {resource.type.replace(/_/g, ' ').toUpperCase()}
                      </Tag>

                      <Title level={4} className="course-title" style={{ marginBottom: '8px' }}>
                        {resource.title}
                      </Title>

                      {resource.description && (
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
                          {resource.description.substring(0, 60)}...
                        </p>
                      )}

                      {resource.course && (
                        <p style={{ fontSize: '12px', color: '#667eea', fontWeight: '500' }}>
                          Course: {resource.course.courseName}
                        </p>
                      )}
                    </div>

                    <div className="course-meta" style={{ marginTop: '12px', fontSize: '12px' }}>
                      {resource.uploadedBy?.personalDetails && (
                        <span>By {resource.uploadedBy.personalDetails.firstName}</span>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );

  // Resource Detail Modal
  const ResourceModal = () => {
    if (!selectedResource) return null;

    return (
      <Modal
        title={selectedResource.title}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <div>
          <div style={{ marginBottom: '16px' }}>
            <Tag color={selectedResource.type === 'youtube_link' ? 'red' : 'blue'}>
              {selectedResource.type.replace(/_/g, ' ').toUpperCase()}
            </Tag>

            {selectedResource.course && (
              <>
                <Divider type="vertical" />
                <span style={{ color: '#667eea', fontWeight: '500' }}>
                  {selectedResource.course.courseName}
                </span>
              </>
            )}
          </div>

          {selectedResource.type === 'youtube_link' && selectedResource.youtubeUrl && (
            <div style={{ marginBottom: '16px' }}>
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(selectedResource.youtubeUrl)}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={selectedResource.title}
              />
            </div>
          )}

          {selectedResource.description && (
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Description:</Text>
              <p style={{ marginTop: '8px', color: '#6b7280' }}>{selectedResource.description}</p>
            </div>
          )}

          {selectedResource.fileUrl && selectedResource.type !== 'youtube_link' && (
            <div style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                href={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}${selectedResource.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download Resource
              </Button>
            </div>
          )}

          {selectedResource.uploadedBy?.personalDetails && (
            <div style={{ marginTop: '24px', padding: '12px', background: '#f5f7fa', borderRadius: '8px' }}>
              <Text strong>Uploaded by: </Text>
              <span>
                {selectedResource.uploadedBy.personalDetails.firstName}{' '}
                {selectedResource.uploadedBy.personalDetails.lastName}
              </span>
            </div>
          )}

          {selectedResource.createdAt && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#9ca3af' }}>
              {new Date(selectedResource.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className="lms-container">
      <HeroSection />
      <div className="container" style={{ padding: '0 24px' }}>
        <ResourcesSection />
        <ResourceModal />
      </div>
    </div>
  );
};

export default LMSPage;