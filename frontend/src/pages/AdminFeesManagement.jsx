import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Input,
  message,
  Pagination,
  Tag,
  Select
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';
import { io } from 'socket.io-client';

const AdminFeesManagement = ({ user }) => {
  const [feeRecords, setFeeRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0,
    collectedAmount: 0,
  });

  /* ---------- Initial Fetch ---------- */
  useEffect(() => {
    fetchFees();
  }, []);

  /* ---------- Socket: Real-time Payment ---------- */
  useEffect(() => {
    const socket = io(
      process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
      { transports: ['websocket'] }
    );

    socket.on('connect', () => {
      console.log('Admin socket connected:', socket.id);
    });

    socket.on('fee-paid', (data) => {
      message.success(`Payment received: ₹${data.amount}`);
      fetchFees();
    });

    return () => socket.disconnect();
  }, []);

  /* ---------- Fetch Fees ---------- */
  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fees');

      const fees = res.data.fees || [];
      setFeeRecords(fees);

      const totalAmount = fees.reduce((a, f) => a + (parseFloat(f.amount) || 0), 0);
      const collectedAmount = fees
        .filter(f => f.status === 'paid')
        .reduce((a, f) => a + (parseFloat(f.amount) || 0), 0);

      setStats({
        total: fees.length,
        paid: fees.filter(f => f.status === 'paid').length,
        pending: fees.filter(f => f.status === 'pending').length,
        overdue: fees.filter(f => f.status === 'overdue').length,
        totalAmount,
        collectedAmount,
      });
    } catch (err) {
      console.error(err);
      message.error('Failed to load fee records');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Fee Record?',
      okText: 'Delete',
      okType: 'danger',
      async onOk() {
        try {
          const token = localStorage.getItem('token');
          await api.delete(`/fees/${id}`);
          message.success('Record deleted');
          fetchFees();
        } catch {
          message.error('Delete failed');
        }
      },
    });
  };

  /* ---------- Filtering ---------- */
  const filteredRecords = feeRecords.filter(r => {
    const matchesSearch =
      r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      r.admissionNumber?.includes(search);

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusColor = s =>
    s === 'paid' ? 'green' : s === 'pending' ? 'orange' : s === 'overdue' ? 'red' : 'default';

  /* ---------- UI ---------- */
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Fees Management</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <p>Total Due</p>
          <p className="text-3xl font-bold text-red-600">₹{stats.totalAmount.toFixed(2)}</p>
        </Card>
        <Card>
          <p>Collected</p>
          <p className="text-3xl font-bold text-green-600">₹{stats.collectedAmount.toFixed(2)}</p>
        </Card>
        <Card>
          <p>Outstanding</p>
          <p className="text-3xl font-bold text-amber-600">
            ₹{(stats.totalAmount - stats.collectedAmount).toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search student/admission"
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Paid', value: 'paid' },
            { label: 'Pending', value: 'pending' },
            { label: 'Overdue', value: 'overdue' },
          ]}
        />

        <Button icon={<PlusOutlined />} type="primary" className="bg-green-600">
          Add Fee Record
        </Button>

        <Button icon={<DownloadOutlined />}>Export</Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th>Admission</th>
              <th>Student</th>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length ? paginatedRecords.map((r, i) => (
              <tr key={i}>
                <td>{r.admissionNumber}</td>
                <td>{r.studentName}</td>
                <td>{r.feeType}</td>
                <td>₹{r.amount}</td>
                <td>{dayjs(r.dueDate).format('DD/MM/YYYY')}</td>
                <td><Tag color={statusColor(r.status)}>{r.status}</Tag></td>
                <td>
                  <button onClick={() => { setSelectedRecord(r); setModalVisible(true); }}>
                    <EyeOutlined />
                  </button>
                  <button onClick={() => handleDelete(r._id)}>
                    <DeleteOutlined />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="text-center py-6">No records</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        className="mt-4"
        current={currentPage}
        total={filteredRecords.length}
        pageSize={pageSize}
        onChange={setCurrentPage}
      />

      <Modal
        title="Fee Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {selectedRecord && (
          <>
            <p><b>Admission:</b> {selectedRecord.admissionNumber}</p>
            <p><b>Student:</b> {selectedRecord.studentName}</p>
            <p><b>Amount:</b> ₹{selectedRecord.amount}</p>
            <p><b>Status:</b> {selectedRecord.status}</p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminFeesManagement;
