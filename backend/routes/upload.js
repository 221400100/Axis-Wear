import express from 'express';
import upload from '../utils/upload.js';
import { protect, admin } from '../utils/authMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, upload.array('images', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images were uploaded.' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const images = req.files.map((file) => `${baseUrl}/uploads/${file.filename}`);
    res.status(201).json({ message: 'Images uploaded successfully.', images });
});

export default router;
