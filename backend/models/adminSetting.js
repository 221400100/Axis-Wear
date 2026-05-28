import mongoose from 'mongoose';

const adminSettingSchema = new mongoose.Schema(
    {
        _id: { type: String, default: 'admin_settings' },
        whatsappNumber: { type: String, default: process.env.ADMIN_WHATSAPP_NUMBER || '' },
        email: { type: String, default: process.env.ADMIN_EMAIL || '' }
    },
    {
        collection: 'adminsettings',
        timestamps: true
    }
);

const AdminSetting = mongoose.models.AdminSetting || mongoose.model('AdminSetting', adminSettingSchema);
export default AdminSetting;
