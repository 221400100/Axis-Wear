import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, ShoppingBag, DollarSign, Clock, ArrowRight, Activity } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/currency';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalSales: 0,
    pendingOrdersCount: 0,
    todayRevenue: 0,
    monthRevenue: 0,
    topProducts: [],
    paymentCounts: {}
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ data: dashboardStats }, { data: orders }] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/orders')
        ]);
        setStats(dashboardStats);
        const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentOrders(sortedOrders.slice(0, 5));
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Today Sales', value: formatCurrency(stats.todayRevenue), icon: Activity, color: 'var(--success)' },
    { title: 'Month Revenue', value: formatCurrency(stats.monthRevenue), icon: Activity, color: 'var(--accent-primary)' },
    { title: 'Total Sales', value: formatCurrency(stats.totalSales), icon: DollarSign, color: 'var(--success)' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'var(--accent-primary)' },
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: '#3b82f6' },
    { title: 'Pending Orders', value: stats.pendingOrdersCount, icon: Clock, color: 'var(--warning)' }
  ];

  if (loading) return <div className="animate-pulse-glow" style={{ height: '100px', width: '100px', margin: 'auto', borderRadius: '50%' }}></div>;

  return (
    <div className="animate-fade-in">
      <Helmet>
        <title>Dashboard - Admin | Axis Wear</title>
      </Helmet>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Dashboard Overview</h2>
        <p className="text-secondary">Welcome back to the admin portal.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: `rgba(255,255,255,0.05)`, borderRadius: '12px', color: card.color }}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500 }}>{card.title}</p>
                <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Top Selling Products</h3>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>Best sellers this month across Pakistan orders.</p>
            {stats.topProducts.length > 0 ? (
              <ol style={{ paddingLeft: '1.1rem', margin: 0, color: 'var(--text-primary)' }}>
                {stats.topProducts.map((product, index) => (
                  <li key={index} style={{ marginBottom: '0.9rem' }}>
                    <strong>{product.name}</strong> — {product.qty} sold
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-secondary">No sales data available yet.</p>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Payment Summary</h3>
            <p className="text-secondary" style={{ marginBottom: '1rem' }}>Overview of COD and online payment orders.</p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {Object.entries(stats.paymentCounts).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                  <span className="text-secondary">{key}</span>
                  <strong>{value}</strong>
                </div>
              ))}
              {Object.keys(stats.paymentCounts).length === 0 && (
                <p className="text-secondary">No payment activity yet.</p>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Recent Orders</h3>
            <p className="text-secondary" style={{ margin: '0.35rem 0 0' }}>Latest customer activity and order flow.</p>
          </div>
          <Link to="/admin/orders" className="btn btn-secondary" style={{ padding: '0.8rem 1.2rem' }}>
            View All Orders <ArrowRight size={16} />
          </Link>
        </div>

        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ minWidth: '720px' }}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{order.orderNumber}</td>
                  <td className="text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.customerName}</td>
                  <td>{formatCurrency(order.totalPrice)}</td>
                  <td>
                    <span className={`badge ${order.status === 'Cancelled' ? 'badge-cancelled' : order.status === 'Delivered' ? 'badge-delivered' : order.status === 'Pending' ? 'badge-pending' : 'badge-shipped'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                    No recent order activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
