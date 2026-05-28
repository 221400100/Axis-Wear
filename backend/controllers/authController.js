import Admin from '../models/admin.js';
import generateToken from '../utils/generateToken.js';

export const authAdmin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (admin && (await admin.matchPassword(password))) {
            return res.json({
                _id: admin._id,
                email: admin.email,
                role: admin.role,
                token: generateToken(admin._id)
            });
        }

        return res.status(401).json({ error: 'Invalid email or password.' });
    } catch (error) {
        next(error);
    }
};

export const setupAdmin = async (req, res, next) => {
    try {
        if (process.env.ADMIN_SETUP_ENABLED !== 'true') {
            return res.status(403).json({ error: 'Admin setup is disabled.' });
        }

        const adminExists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
        if (adminExists) {
            return res.status(400).json({ error: 'Admin already exists.' });
        }

        const admin = await Admin.create({
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD
        });

        return res.status(201).json({
            _id: admin._id,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id)
        });
    } catch (error) {
        next(error);
    }
};
