import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true }
    },
    { _id: false }
);

const orderItemSchema = new mongoose.Schema(
    {
        product: { type: String, required: true },
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        size: { type: String },
        color: { type: String },
        image: { type: String },
        price: { type: Number, required: true }
    },
    { _id: false }
);

const couponSchema = new mongoose.Schema(
    {
        code: String,
        discountAmount: Number,
        discountPercent: Number
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: { type: String, required: true },
        customerName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        whatsappNumber: { type: String },
        shippingAddress: { type: addressSchema, required: true },
        orderItems: { type: [orderItemSchema], required: true },
        paymentMethod: { type: String, default: 'Cash on Delivery' },
        paymentStatus: { type: String, default: 'Pending' },
        shippingFee: { type: Number, default: 0 },
        coupon: { type: couponSchema, default: null },
        totalPrice: { type: Number, required: true },
        status: { type: String, default: 'Pending' },
        verificationChannel: { type: String, default: 'WhatsApp' },
        verificationCode: { type: String },
        createdAt: { type: Date, default: () => new Date() }
    },
    {
        collection: 'Order'
    }
);

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
