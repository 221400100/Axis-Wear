import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/currency';

const OrderStatus = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [order, setOrder] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCheckStatus = async (event) => {
        event.preventDefault();
        setFeedback('');
        setOrder(null);

        if (!orderNumber.trim()) {
            setFeedback('Please enter your order number to get the latest status.');
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                orderNumber: orderNumber.trim()
            });
            const { data } = await api.get(`/orders?${params.toString()}`);
            const found = data.find((o) => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase());

            if (!found) {
                setFeedback('No order found with that order number. Please check and try again.');
                return;
            }

            setOrder(found);
            setFeedback('Order found. Here is the latest status.');
        } catch (error) {
            setFeedback('Unable to retrieve order status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '3rem 0', minHeight: '80vh' }}>
            <Helmet>
                <title>Track Order - Axis Wear</title>
            </Helmet>

            <div style={{ maxWidth: '820px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1>Track Your Order</h1>
                    <p className="text-secondary" style={{ marginTop: '0.75rem', fontSize: '1rem' }}>
                        Enter your order number to check the latest status.
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <form onSubmit={handleCheckStatus}>
                        <div className="input-group">
                            <label>Order Number</label>
                            <input
                                type="text"
                                className="input-field"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="AX-10030"
                                required
                            />
                        </div>
                        {feedback && (
                            <p className="text-secondary" style={{ marginTop: '1rem', color: order ? 'var(--success)' : 'var(--danger)' }}>
                                {feedback}
                            </p>
                        )}
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} disabled={loading}>
                            {loading ? 'Checking...' : 'Check Order Status'}
                        </button>
                    </form>
                </div>

                {order && (
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <p className="text-secondary" style={{ margin: 0 }}>Order Number</p>
                                <h2 style={{ margin: '0.3rem 0 0' }}>{order.orderNumber}</h2>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p className="text-secondary" style={{ margin: 0 }}>Status</p>
                                <span className={`badge ${order.status === 'Delivered' ? 'badge-delivered' : order.status === 'Pending' ? 'badge-pending' : order.status === 'Shipped' ? 'badge-shipped' : 'badge-confirmed'}`}>{order.status}</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <p className="text-secondary" style={{ margin: 0 }}>Customer</p>
                                <p style={{ margin: '0.5rem 0 0' }}>{order.customerName}</p>
                            </div>
                            <div>
                                <p className="text-secondary" style={{ margin: 0 }}>Phone / WhatsApp</p>
                                <p style={{ margin: '0.5rem 0 0' }}>{order.whatsappNumber || order.phoneNumber}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <p className="text-secondary" style={{ margin: 0 }}>Payment</p>
                                <p style={{ margin: '0.5rem 0 0' }}>{order.paymentMethod} - {order.paymentStatus}</p>
                            </div>
                            <div>
                                <p className="text-secondary" style={{ margin: 0 }}>Total Paid</p>
                                <p style={{ margin: '0.5rem 0 0' }}>{formatCurrency(order.totalPrice)}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p className="text-secondary" style={{ marginBottom: '0.75rem' }}>Shipping Address</p>
                            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                                <p style={{ margin: 0, fontWeight: 600 }}>{order.shippingAddress.name}</p>
                                <p className="text-secondary" style={{ margin: '0.35rem 0 0' }}>{order.shippingAddress.address}</p>
                                <p className="text-secondary" style={{ margin: '0.35rem 0 0' }}>{order.shippingAddress.city}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-secondary" style={{ marginBottom: '1rem' }}>Items</p>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {order.orderItems.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1rem' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{item.name}</p>
                                            <p className="text-secondary" style={{ margin: '0.35rem 0 0' }}>{item.color} | Size: {item.size}</p>
                                            <p className="text-secondary" style={{ margin: '0.35rem 0 0' }}>Qty: {item.qty}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontWeight: 600 }}>{formatCurrency(item.price)}</p>
                                            <p className="text-secondary" style={{ margin: '0.35rem 0 0' }}>x{item.qty}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                            <span style={{ fontWeight: 600 }}>Total Amount</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>{formatCurrency(order.totalPrice)}</span>
                        </div>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <Link to="/shop" className="btn btn-secondary">Continue Shopping</Link>
                </div>
            </div>
        </div>
    );
};

export default OrderStatus;
