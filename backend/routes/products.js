import express from 'express';
import Product from '../models/product.js';
import Category from '../models/category.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const { category, size, priceMin, priceMax, search } = req.query;
        const filter = {};

        if (category) {
            filter['category._id'] = category;
        }
        if (size) {
            filter.sizes = size;
        }
        if (priceMin || priceMax) {
            filter.price = {};
            if (priceMin) filter.price.$gte = Number(priceMin);
            if (priceMax) filter.price.$lte = Number(priceMax);
        }
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json({ products });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.json({ product });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { name, description, category, price, discount, sizes, colors, stock, images } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Product name, price and category are required.' });
        }

        let categoryData = category;
        if (typeof category === 'string') {
            const foundCategory = await Category.findById(category);
            if (!foundCategory) {
                return res.status(400).json({ error: 'Category ID is invalid.' });
            }
            categoryData = { _id: foundCategory._id.toString(), name: foundCategory.name };
        }

        const product = new Product({
            name,
            description: description || '',
            category: categoryData,
            price: Number(price),
            discount: Number(discount) || 0,
            sizes: Array.isArray(sizes) ? sizes : [],
            colors: Array.isArray(colors) ? colors : [],
            stock: Number(stock) || 0,
            images: Array.isArray(images) ? images : []
        });

        await product.save();
        res.status(201).json({ product });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const updateData = { ...req.body };
        if (updateData.category && typeof updateData.category === 'string') {
            const foundCategory = await Category.findById(updateData.category);
            if (foundCategory) {
                updateData.category = { _id: foundCategory._id.toString(), name: foundCategory.name };
            }
        }
        if (updateData.price !== undefined) updateData.price = Number(updateData.price);
        if (updateData.discount !== undefined) updateData.discount = Number(updateData.discount);
        if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);

        const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.json({ product });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found.' });
        }
        res.json({ message: 'Product deleted successfully.' });
    } catch (error) {
        next(error);
    }
});

export default router;
