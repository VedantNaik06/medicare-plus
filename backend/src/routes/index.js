import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { claim } from '../controllers/reminderController.js';
import { requireAuth } from '../middleware/auth.js';
import { ok } from '../utils/response.js';
import appointmentRoutes from './appointmentRoutes.js';
import authRoutes from './authRoutes.js';
import doseRoutes from './doseRoutes.js';
import medicineRoutes from './medicineRoutes.js';
import recordRoutes from './recordRoutes.js';
import testRoutes from './testRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

// ---- Public routes ----
router.get('/health', (_req, res) => ok(res, { status: 'ok', time: new Date().toISOString() }));
router.use('/auth', authRoutes);

// ---- Everything below this line needs a valid login ----
router.use(requireAuth);
router.use('/users', userRoutes);
router.use('/medicines', medicineRoutes);
router.use('/doses', doseRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/records', recordRoutes);
router.use('/tests', testRoutes);
router.get('/dashboard', getDashboard);
router.post('/reminders/claim', claim);

export default router;
