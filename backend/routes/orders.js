import express from 'express';
import Order from '../models/order.js';
import { triggerOrderNotifications } from '../utils/notifications.js';
import { protect, admin } from '../utils/authMiddleware.js';

const router = express.Router();

const generateOrderNumber = () => `AX-${Math.floor(10000 + Math.random() * 90000)}`;

router.get('/', async (req, res, next) => {
    try {
        const { orderNumber, status, paymentStatus, customer, phoneNumber, from, to } = req.query;
        const filter = {};

        if (orderNumber) {
            filter.orderNumber = { $regex: orderNumber, $options: 'i' };
        }
        if (status) {
            filter.status = status;
        }
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }
        if (customer) {
            filter.customerName = { $regex: customer, $options: 'i' };
        }
        if (phoneNumber) {
            filter.$or = [
                { phoneNumber: { $regex: phoneNumber, $options: 'i' } },
                { whatsappNumber: { $regex: phoneNumber, $options: 'i' } }
            ];
        }
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = toDate;
            }
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({ order });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', protect, admin, async (req, res, next) => {
    try {
        const { status, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        const updatedOrder = await order.save();
        res.json({ order: updatedOrder, message: 'Order updated successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const orderData = req.body;
        const order = new Order({
            ...orderData,
            orderNumber: orderData.orderNumber || generateOrderNumber(),
            whatsappNumber: orderData.phoneNumber,
            verificationChannel: orderData.verificationChannel || 'WhatsApp',
            verificationCode: orderData.verificationCode || Math.floor(100000 + Math.random() * 900000).toString(),
            status: orderData.status || 'Pending',
            createdAt: new Date()
        });

        const savedOrder = await order.save();

        triggerOrderNotifications(savedOrder).catch((notificationError) => {
            console.error('Notification error:', notificationError);
        });

        res.status(201).json({
            order: savedOrder,
            message: 'Order created successfully. Notifications are being delivered in the background.'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
