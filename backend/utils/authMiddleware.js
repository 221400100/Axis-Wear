import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const admin = await Admin.findById(decoded.id).select('-password');

            if (!admin) {
                return res.status(401).json({ error: 'Not authorized, admin not found.' });
            }

            req.user = admin;
            return next();
        } catch (error) {
            return res.status(401).json({ error: 'Not authorized, token failed.' });
        }
    }

    return res.status(401).json({ error: 'Not authorized, no token.' });
};

export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Not authorized as admin.' });
};
