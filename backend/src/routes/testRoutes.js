import { Router } from 'express';
import {
  compareMeasurements,
  createTest,
  deleteTest,
  getTest,
  listTests,
  measurementNames,
  updateTest,
} from '../controllers/testController.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { compareQuery, testBody, testListQuery } from '../validators/test.js';

const router = Router();
router.get('/', validate({ query: testListQuery }), listTests);
router.post('/', validate({ body: testBody }), createTest);
// Fixed paths must come BEFORE "/:id", otherwise "compare" would be read as an id.
router.get('/names', measurementNames);
router.get('/compare', validate({ query: compareQuery }), compareMeasurements);
router.get('/:id', validate({ params: idParams }), getTest);
router.put('/:id', validate({ params: idParams, body: testBody }), updateTest);
router.delete('/:id', validate({ params: idParams }), deleteTest);
export default router;
