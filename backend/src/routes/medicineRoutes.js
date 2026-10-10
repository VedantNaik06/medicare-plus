import { Router } from 'express';
import { createMedicine, deleteMedicine, getMedicine, listMedicines, updateMedicine } from '../controllers/medicineController.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { medicineBody, medicineListQuery } from '../validators/medicine.js';

const router = Router();
router.get('/', validate({ query: medicineListQuery }), listMedicines);
router.post('/', validate({ body: medicineBody }), createMedicine);
router.get('/:id', validate({ params: idParams }), getMedicine);
router.put('/:id', validate({ params: idParams, body: medicineBody }), updateMedicine);
router.delete('/:id', validate({ params: idParams }), deleteMedicine);
export default router;
