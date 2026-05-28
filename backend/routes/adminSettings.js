import express from 'express';
import AdminSetting from '../models/adminSetting.js';

const router = express.Router();
const SETTINGS_ID = 'admin_settings';

const resolveDefaultSettings = () => ({
    _id: SETTINGS_ID,
    whatsappNumber: process.env.ADMIN_WHATSAPP_NUMBER || '',
    email: process.env.ADMIN_EMAIL || ''
});

router.get('/', async (req, res, next) => {
    try {
        let settings = await AdminSetting.findById(SETTINGS_ID);
        if (!settings) {
            settings = await AdminSetting.create(resolveDefaultSettings());
        }
        res.json(settings.toObject());
    } catch (error) {
        next(error);
    }
});

router.put('/', async (req, res, next) => {
    try {
        const { whatsappNumber, email } = req.body;
        if (!whatsappNumber || !email) {
            return res.status(400).json({ error: 'Both whatsappNumber and email are required.' });
        }
        const settings = await AdminSetting.findOneAndUpdate(
            { _id: SETTINGS_ID },
            { whatsappNumber, email },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json(settings.toObject());
    } catch (error) {
        next(error);
    }
});

export default router;
