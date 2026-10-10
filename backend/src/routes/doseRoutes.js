import { Router } from 'express';
import { doseHistory, listDoses, markDose } from '../controllers/doseController.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { doseHistoryQuery, doseListQuery, doseMarkBody } from '../validators/dose.js';

const router = Router();
router.get('/', validate({ query: doseListQuery }), listDoses);
router.get('/history', validate({ query: doseHistoryQuery }), doseHistory);
router.patch('/:id', validate({ params: idParams, body: doseMarkBody }), markDose);
export default router;
