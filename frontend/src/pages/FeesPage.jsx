import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Statistic,
  Tag,
  Space
} from 'antd';
import { CreditCardOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../utils/api';

/* ---------------- Razorpay Script Loader ---------------- */
const loadScript = (src) =>
  new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/* ---------------- Fees Page ---------------- */
const FeesPage = ({ user }) => {
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [paymentForm] = Form.useForm();
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    if (user?.id) fetchFeeData();
  }, [user?.id]);

  const fetchFeeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const res = await api.get(`/fees/student/${user?.id}`);

      const feesData = res.data.fees;
      // API returns an array of fee records for the student. Use the most recent (first) one.
      const fee = Array.isArray(feesData) ? feesData[0] : feesData;
      setFees(fee || null);
      setPaymentHistory(fee?.feePayments || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        // No fees found for this student — show friendly info and clear state
        setFees(null);
        setPaymentHistory([]);
        message.info('No fee records found for this student');
      } else {
        message.error('Failed to load fee details');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Razorpay Payment ---------------- */
  const handlePayment = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // 1️⃣ Create order
      const orderRes = await api.post('/razorpay/create-order', { feeId: fees._id, amount: values.amount });

      const { order } = orderRes.data;
      if (!order) {
        message.error('Order creation failed');
        return;
      }

      // 2️⃣ Load Razorpay
      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded) {
        message.error('Razorpay SDK failed to load');
        return;
      }

      // 3️⃣ Open checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // ✅ CORRECT
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'Institute Fee Payment',
        description: 'Student Fee Payment',

        handler: async (response) => {
          try {
            await api.post('/razorpay/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              feeId: fees._1d || fees._id,
              amount: values.amount,
              method: values.method,
              transactionId: response.razorpay_payment_id
            });

            message.success('Payment successful');
            paymentForm.resetFields();
            setPaymentModal(false);
            fetchFeeData();
          } catch {
            message.error('Payment verification failed');
          }
        },

        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: { color: '#1a73e8' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => message.error('Payment failed'));
      rzp.open();

    } catch {
      message.error('Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Table Columns ---------------- */
  const paymentColumns = [
    {
      title: 'Date',
      dataIndex: 'paymentDate',
      render: (d) => new Date(d).toLocaleDateString()
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (a) => `₹${a}`
    },
    {
      title: 'Method',
      dataIndex: 'paymentMethod',
      render: (m) => <Tag color="blue">{m}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => (
        <Tag color={s === 'completed' ? 'green' : 'orange'}>
          {s.toUpperCase()}
        </Tag>
      )
    }
  ];

  /* ---------------- UI ---------------- */
  return (
    <div style={{ padding: 20 }}>
      <Row gutter={[16, 16]}>
        <Col md={6}><Card><Statistic title="Total Fees" value={fees?.totalFee || 0} prefix="₹" /></Card></Col>
        <Col md={6}><Card><Statistic title="Paid" value={fees?.paidAmount || 0} prefix="₹" /></Card></Col>
        <Col md={6}><Card><Statistic title="Pending" value={fees?.pendingAmount || 0} prefix="₹" /></Card></Col>
        <Col md={6}><Card><Statistic title="Progress" value={fees?.totalFee ? Math.round((fees.paidAmount / fees.totalFee) * 100) : 0} suffix="%" /></Card></Col>
      </Row>

      <Card title="Payment History" style={{ marginTop: 20 }} loading={loading}>
        <Space style={{ marginBottom: 15 }}>
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            disabled={!fees?.pendingAmount}
            onClick={() => setPaymentModal(true)}
          >
            Make Payment
          </Button>
          <Button icon={<DownloadOutlined />}>Download Receipt</Button>
        </Space>

        <Table
          columns={paymentColumns}
          dataSource={paymentHistory.map((p, i) => ({ ...p, key: i }))}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Pay Fees"
        open={paymentModal}
        onCancel={() => setPaymentModal(false)}
        footer={null}
      >
        <Form layout="vertical" form={paymentForm} onFinish={handlePayment}>
          <Form.Item
            name="amount"
            label="Amount (₹)"
            rules={[{ required: true }]}
          >
            <Input type="number" max={fees?.pendingAmount} />
          </Form.Item>

          <Form.Item name="method" label="Payment Method" rules={[{ required: true }]}>
            <select style={{ padding: 8, width: '100%' }}>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="upi">UPI</option>
            </select>
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Pay Now
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default FeesPage;
