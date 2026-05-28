import express from 'express';
import { authAdmin, setupAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authAdmin);
router.post('/setup', setupAdmin);

export default router;
