import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import orderRoutes from './routes/orders.js';
import adminSettingsRoutes from './routes/adminSettings.js';
import categoriesRoutes from './routes/categories.js';
import productsRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import dashboardRoutes from './routes/dashboard.js';
import { defaultCategories, defaultProducts, defaultOrders } from './utils/seedData.js';
import Category from './models/category.js';
import Product from './models/product.js';
import Order from './models/order.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/axiswear';

app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    })
);
app.use(express.json());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const seedCollection = async (Model, data) => {
    const count = await Model.countDocuments();
    if (count === 0) {
        await Model.insertMany(data);
        console.log(`Seeded ${data.length} ${Model.collection.name} documents`);
    }
};

const startServer = async () => {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        await seedCollection(Category, defaultCategories);
        await seedCollection(Product, defaultProducts);
        await seedCollection(Order, defaultOrders);

        app.listen(port, () => {
            console.log(`Backend server listening on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Unable to start backend', error);
        process.exit(1);
    }
};

startServer();
