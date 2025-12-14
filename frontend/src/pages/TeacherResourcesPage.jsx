import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  Empty,
  Tag,
  Space,
  message,
  Upload,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  YoutubeOutlined,
  UploadOutlined
} from '@ant-design/icons';
import api from '../utils/api';

const TeacherResourcesPage = ({ user }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [resourceType, setResourceType] = useState('pdf');
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await api.get('/lms');
      if (response.data.success) {
        setResources(response.data.materials || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      message.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };



  const handleCreateResource = () => {
    setResourceType('pdf');
    setFileList([]);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleDeleteResource = (resourceId) => {
    Modal.confirm({
      title: 'Delete Resource',
      content: 'Are you sure you want to delete this resource?',
      okText: 'Delete',
      okType: 'danger',
      async onOk() {
        try {
          await api.delete(`/lms/${resourceId}`);
          message.success('Resource deleted successfully');
          fetchResources();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete resource');
        }
      },
    });
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleSubmit = async (values) => {
    if (!values.title || !values.title.trim()) {
      message.error('Please enter a title');
      setSubmitting(false);
      return;
    }

    if (!resourceType) {
      message.error('Please select a resource type');
      setSubmitting(false);
      return;
    }

    if (resourceType === 'youtube_link' && (!values.youtubeUrl || !values.youtubeUrl.trim())) {
      message.error('Please enter YouTube URL');
      setSubmitting(false);
      return;
    }

    if (resourceType !== 'youtube_link' && fileList.length === 0) {
      message.error('Please upload a file');
      setSubmitting(false);
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('type', resourceType);

      if (resourceType === 'youtube_link') {
        formData.append('youtubeUrl', values.youtubeUrl);
      } else if (fileList.length > 0) {
        formData.append('file', fileList[0].originFileObj);
      }

      const response = await api.post('/lms/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        message.success('Resource uploaded successfully');
        setIsModalOpen(false);
        form.resetFields();
        setFileList([]);
        fetchResources();
      }
    } catch (error) {
      console.error('Error uploading resource:', error);
      message.error(error.response?.data?.message || 'Failed to upload resource');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Course',
      dataIndex: ['course', 'courseName'],
      key: 'course',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => {
        const colorMap = {
          pdf: 'red',
          document: 'orange',
          youtube_link: 'red',
          video: 'blue',
          study_material: 'green',
          assignment: 'purple',
          quiz: 'cyan',
        };
        return <Tag color={colorMap[text] || 'blue'}>{text.replace(/_/g, ' ').toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteResource(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const pdfResources = resources.filter(r => r.type === 'pdf');
  const youtubeResources = resources.filter(r => r.type === 'youtube_link');
  const videoResources = resources.filter(r => r.type === 'video');
  const otherResources = resources.filter(r => !['pdf', 'youtube_link', 'video'].includes(r.type));

  return (
    <div style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card
            title={<span style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}><FileTextOutlined /> Study Materials</span>}
            extra={
              <Button type="primary" icon={<UploadOutlined />} onClick={handleCreateResource} style={{ background: '#3b82f6', borderColor: '#3b82f6' }}>
                Upload Resource
              </Button>
            }
            style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb' }}
          >
            <Tabs
              items={[
                {
                  key: 'all',
                  label: `All Resources (${resources.length})`,
                  children: (
                    <Table
                      columns={columns}
                      dataSource={resources}
                      loading={loading}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1200 }}
                    />
                  ),
                },
                {
                  key: 'pdf',
                  label: `PDFs (${pdfResources.length})`,
                  children: (
                    <Table
                      columns={columns}
                      dataSource={pdfResources}
                      loading={loading}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1200 }}
                    />
                  ),
                },
                {
                  key: 'youtube',
                  label: `YouTube Links (${youtubeResources.length})`,
                  children: (
                    <Table
                      columns={columns}
                      dataSource={youtubeResources}
                      loading={loading}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1200 }}
                    />
                  ),
                },
                {
                  key: 'videos',
                  label: `Videos (${videoResources.length})`,
                  children: (
                    <Table
                      columns={columns}
                      dataSource={videoResources}
                      loading={loading}
                      rowKey="_id"
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 1200 }}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={<span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>Upload Study Material</span>}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setFileList([]);
        }}
        width={700}
        okText="Upload"
        okButtonProps={{ loading: submitting, style: { background: '#3b82f6', borderColor: '#3b82f6' } }}
        cancelButtonProps={{ style: { borderColor: '#d1d5db' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ background: '#fff' }}
        >
          <Form.Item
            name="title"
            label={<span style={{ fontWeight: '500', color: '#374151' }}>Title</span>}
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="e.g., Chapter 5 - Advanced Concepts" style={{ borderColor: '#d1d5db' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span style={{ fontWeight: '500', color: '#374151' }}>Description</span>}
          >
            <Input.TextArea placeholder="Brief description of the material" rows={3} style={{ borderColor: '#d1d5db' }} />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: '500', color: '#374151' }}>Resource Type</span>}
          >
            <Select
              placeholder="Select resource type"
              value={resourceType}
              onChange={setResourceType}
              style={{ width: '100%' }}
            >
              <Select.Option value="pdf">PDF Document</Select.Option>
              <Select.Option value="document">Document</Select.Option>
              <Select.Option value="video">Video</Select.Option>
              <Select.Option value="youtube_link">YouTube Link</Select.Option>
              <Select.Option value="study_material">Study Material</Select.Option>
            </Select>
          </Form.Item>

          {resourceType === 'youtube_link' ? (
            <Form.Item
              name="youtubeUrl"
              label={<span style={{ fontWeight: '500', color: '#374151' }}>YouTube URL <span style={{ color: '#ef4444' }}>*</span></span>}
              rules={[{ required: true, message: 'Please enter YouTube URL' }]}
            >
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                prefix={<YoutubeOutlined style={{ color: '#ef4444' }} />}
                style={{ borderColor: '#d1d5db' }}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label={<span style={{ fontWeight: '500', color: '#374151' }}>Upload File <span style={{ color: '#ef4444' }}>*</span></span>}
              required
            >
              <Upload
                maxCount={1}
                fileList={fileList}
                onChange={handleUploadChange}
                accept={resourceType === 'pdf' ? '.pdf' : '*'}
              >
                <Button icon={<UploadOutlined />} style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>Click to upload</Button>
              </Upload>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherResourcesPage;
