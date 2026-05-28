import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get('/notifications');
                setNotifications(data);
            } catch (error) {
                toast.error('Failed to load notifications.');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const { data } = await api.put(`/notifications/${id}`, { status: 'read' });
            setNotifications((prev) => prev.map((item) => (item._id === id ? data : item)));
            toast.success('Notification marked as read.');
        } catch (error) {
            toast.error('Unable to update notification status.');
        }
    };

    return (
        <div className="animate-fade-in">
            <Helmet>
                <title>Admin Notifications - Axis Wear</title>
            </Helmet>

            <div style={{ marginBottom: '1.5rem' }}>
                <h2>Admin Notifications</h2>
                <p className="text-secondary">Notifications generated when customers place orders.</p>
            </div>

            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                {loading ? (
                    <p>Loading notifications...</p>
                ) : (
                    <table className="admin-table" style={{ minWidth: '760px' }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Order</th>
                                <th>Message</th>
                                <th>Channels</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.map((note) => (
                                <tr key={note._id}>
                                    <td className="text-secondary">{new Date(note.createdAt).toLocaleString()}</td>
                                    <td style={{ fontWeight: 600 }}>{note.orderNumber}</td>
                                    <td>{note.message}</td>
                                    <td>{note.channels.join(', ')}</td>
                                    <td>
                                        <span className={`badge ${note.status === 'sent' ? 'badge-confirmed' : 'badge-pending'}`}>
                                            {note.status}
                                        </span>
                                    </td>
                                    <td>
                                        {note.status !== 'read' ? (
                                            <button type="button" className="btn btn-secondary" onClick={() => markAsRead(note._id)}>
                                                Mark Read
                                            </button>
                                        ) : (
                                            <span className="text-secondary">Read</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {notifications.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }} className="text-muted">
                                        No admin notifications have been generated yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;
