import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    orderNumber: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: () => new Date() },
    type: { type: String, default: 'Order' },
    channels: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'read'],
      default: 'pending'
    },
    message: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { collection: 'notifications' }
);

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;
