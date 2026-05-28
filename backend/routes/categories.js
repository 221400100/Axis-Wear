import express from 'express';
import Category from '../models/category.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json({ categories });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required.' });
        }

        const category = new Category({ name });
        await category.save();
        res.status(201).json({ category });
    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const { name } = req.body;
        const category = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
        if (!category) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        res.json({ category });
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        res.json({ message: 'Category deleted successfully.' });
    } catch (error) {
        next(error);
    }
});

export default router;
