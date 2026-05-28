import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);
  const pageSize = 6;

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (paymentFilter !== 'All') params.set('paymentStatus', paymentFilter);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);

      const query = params.toString();
      const url = query ? `/orders?${query}` : '/orders';
      const { data } = await api.get(url);
      setOrders(data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, fromDate, toDate]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to update status');
    }
  };

  const handleExportOrders = async () => {
    try {
      setExportLoading(true);
      const exportRows = filteredOrders.map((order) => ({
        'Order Number': order.orderNumber,
        Date: new Date(order.createdAt).toLocaleString(),
        Customer: order.customerName,
        'Phone Number': order.phoneNumber || '',
        'Shipping Address': `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}`,
        'Payment Method': order.paymentMethod || '',
        'Payment Status': order.paymentStatus || '',
        Status: order.status,
        'Total Price': formatCurrency(order.totalPrice),
        'Item Count': order.orderItems?.length ?? 0,
        'Order Items': order.orderItems?.map((item) => {
          const sizeLabel = item.size ? `Size: ${item.size}` : '';
          const colorLabel = item.color ? `Color: ${item.color}` : '';
          const detailParts = [item.name, sizeLabel, colorLabel].filter(Boolean).join(' | ');
          return `${detailParts} x${item.qty}`;
        }).join('; ')
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
      const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([workbookBinary], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `axiswear-orders-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Order list exported to Excel');
    } catch (error) {
      toast.error('Failed to export orders');
    } finally {
      setExportLoading(false);
    }
  };

  const statusColors = {
    Pending: 'badge-pending',
    Confirmed: 'badge-confirmed',
    Shipped: 'badge-shipped',
    Delivered: 'badge-delivered',
    Cancelled: 'badge-cancelled'
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSearch = normalizedSearch === '' ||
      order.orderNumber.toLowerCase().includes(normalizedSearch) ||
      order.customerName.toLowerCase().includes(normalizedSearch);
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem' }}>
      <Helmet>
        <title>Orders - Admin | Axis Wear</title>
      </Helmet>

      <div style={{ flex: selectedOrder ? '1' : '100%', transition: 'all 0.3s ease' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2>Order Management</h2>
          <p className="text-secondary">View and update customer orders.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ minWidth: 0 }}>
            <label className="text-secondary" style={{ fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Search orders</label>
            <input
              type="search"
              className="input-field"
              placeholder="Search by order number or customer"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              style={{ width: '100%', minWidth: '220px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => { setStatusFilter(status); setPage(1); }}
                className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.65rem 1rem' }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'end' }}>
          <div>
            <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>Payment status</label>
            <select
              className="input-field"
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            >
              {['All', 'Paid', 'Pending'].map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>From date</label>
            <input
              type="date"
              className="input-field"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            />
          </div>
          <div>
            <label className="text-secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>To date</label>
            <input
              type="date"
              className="input-field"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setStatusFilter('All');
                setPaymentFilter('All');
                setFromDate('');
                setToDate('');
                setPage(1);
              }}
              style={{ width: '100%' }}
            >
              Clear filters
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportOrders}
            disabled={exportLoading}
            style={{ padding: '0.65rem 1.25rem' }}
          >
            {exportLoading ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>

        <div className="glass-panel" style={{ overflow: 'x-auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order._id} style={{ background: selectedOrder?._id === order._id ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                  <td style={{ fontWeight: 500, fontFamily: 'monospace' }}>{order.orderNumber}</td>
                  <td className="text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.customerName}</td>
                  <td>{formatCurrency(order.totalPrice)}</td>
                  <td>
                    <select
                      className={`badge ${statusColors[order.status]}`}
                      style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem' }}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                    No orders match the selected status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <p className="text-secondary" style={{ margin: 0 }}>
            Showing {filteredOrders.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredOrders.length)} of {filteredOrders.length} orders
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Sidebar */}
      {selectedOrder && (
        <div className="glass-panel animate-fade-in" style={{ width: '350px', padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Order Details</h3>
            <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary" style={{ padding: '0.4rem' }}>✕</button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Order Number</p>
            <p style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedOrder.orderNumber}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Shipping Address</p>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ fontWeight: 500 }}>{selectedOrder.shippingAddress.name}</p>
              <p className="text-secondary">{selectedOrder.shippingAddress.phone}</p>
              <p className="text-secondary" style={{ marginTop: '0.5rem' }}>{selectedOrder.shippingAddress.address}</p>
              <p className="text-secondary">{selectedOrder.shippingAddress.city}</p>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Items</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedOrder.orderItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</p>
                    <p className="text-secondary" style={{ fontSize: '0.75rem' }}>{item.color} | Size: {item.size}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</p>
                    <p className="text-secondary" style={{ fontSize: '0.75rem' }}>x{item.qty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '8px' }}>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Payment Details</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 500 }}>Method</span>
              <span>{selectedOrder.paymentMethod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500 }}>Status</span>
              <span className={`badge ${selectedOrder.paymentStatus === 'Paid' ? 'badge-delivered' : 'badge-pending'}`}>
                {selectedOrder.paymentStatus || 'Pending'}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 500 }}>Total Amount</p>
            <h3 className="text-gradient">{formatCurrency(selectedOrder.totalPrice)}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
