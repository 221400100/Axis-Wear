import express from 'express';
import Order from '../models/order.js';
import Product from '../models/product.js';
import { protect, admin } from '../utils/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, async (req, res, next) => {
    try {
        const orders = await Order.find({});
        const totalProducts = await Product.countDocuments();

        const totalSales = orders
            .filter((order) => order.status !== 'Cancelled')
            .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        const pendingOrdersCount = orders.filter((order) => order.status === 'Pending').length;
        const now = new Date();
        const todayString = now.toISOString().slice(0, 10);
        const month = now.getMonth();
        const year = now.getFullYear();

        const todayRevenue = orders
            .filter((order) => {
                if (!order.createdAt) return false;
                const createdAt = new Date(order.createdAt).toISOString().slice(0, 10);
                return createdAt === todayString && order.status !== 'Cancelled';
            })
            .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        const monthRevenue = orders
            .filter((order) => {
                if (!order.createdAt) return false;
                const createdAt = new Date(order.createdAt);
                return createdAt.getFullYear() === year && createdAt.getMonth() === month && order.status !== 'Cancelled';
            })
            .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        const productSales = orders.reduce((aggregation, order) => {
            (order.orderItems || []).forEach((item) => {
                const key = item.product || item.name;
                if (!aggregation[key]) {
                    aggregation[key] = { name: item.name, qty: 0 };
                }
                aggregation[key].qty += item.qty || 0;
            });
            return aggregation;
        }, {});

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 3);

        const paymentCounts = orders.reduce((counts, order) => {
            const paymentStatus = order.paymentStatus || 'Pending';
            counts[paymentStatus] = (counts[paymentStatus] || 0) + 1;
            return counts;
        }, {});

        res.json({
            totalSales,
            totalOrders: orders.length,
            totalProducts,
            pendingOrdersCount,
            todayRevenue,
            monthRevenue,
            topProducts,
            paymentCounts
        });
    } catch (error) {
        next(error);
    }
});

export default router;
