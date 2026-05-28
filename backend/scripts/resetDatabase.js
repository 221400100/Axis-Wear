import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/category.js';
import Product from '../models/product.js';
import Order from '../models/order.js';
import Admin from '../models/admin.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/axiswear';
const uploadsDir = path.join(process.cwd(), 'uploads');

const clearUploads = () => {
    if (!fs.existsSync(uploadsDir)) return;
    const files = fs.readdirSync(uploadsDir);
    files.forEach((file) => {
        const filePath = path.join(uploadsDir, file);
        if (fs.lstatSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
        }
    });
};

const resetDatabase = async () => {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
        throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD, and JWT_SECRET must be set in .env before running reset.');
    }

    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✓ Connected to MongoDB');

        // Drop the full database and remove uploaded assets
        console.log('🗑️  Dropping database...');
        await mongoose.connection.db.dropDatabase();
        console.log('✓ Database dropped');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        clearUploads();
        console.log('✓ Upload directory cleared');

        const admin = await Admin.create({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD
        });

        console.log(`✓ Admin account created: ${admin.email}`);
        console.log('\n✅ Database reset complete! Only the admin account remains.\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Database reset failed:', error.message);
        process.exit(1);
    }
};

resetDatabase();
