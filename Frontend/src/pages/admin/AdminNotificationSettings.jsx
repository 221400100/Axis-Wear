import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AdminNotificationSettings = () => {
    const [settings, setSettings] = useState({ whatsappNumber: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/admin/settings');
                setSettings(data);
            } catch (error) {
                toast.error('Unable to load admin settings.');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);

        if (!settings.whatsappNumber.trim() || !settings.email.trim()) {
            toast.error('Both WhatsApp number and email are required.');
            setSaving(false);
            return;
        }

        try {
            const { data } = await api.put('/admin/settings', settings);
            setSettings(data);
            toast.success('Admin notification settings updated.');
        } catch (error) {
            toast.error('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <Helmet>
                <title>Admin Settings - Axis Wear</title>
            </Helmet>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h2>Admin Notification Settings</h2>
                    <p className="text-secondary">Update the WhatsApp number and email where order alerts are sent.</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginTop: '1.5rem', maxWidth: '600px' }}>
                {loading ? (
                    <p>Loading settings...</p>
                ) : (
                    <form onSubmit={handleSave}>
                        <div className="input-group">
                            <label>Admin WhatsApp Number</label>
                            <input
                                type="tel"
                                className="input-field"
                                value={settings.whatsappNumber}
                                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                placeholder="+92 310 1748362"
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Admin Email Address</label>
                            <input
                                type="email"
                                className="input-field"
                                value={settings.email}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                placeholder="admin@example.com"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1.5rem' }}>
                            {saving ? 'Saving...' : 'Save Notification Settings'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminNotificationSettings;
