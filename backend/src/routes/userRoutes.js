import { Router } from 'express';
import { deleteMe, getMe, updateMe } from '../controllers/userController.js';
import { validate } from '../middleware/validate.js';
import { deleteMeBody, updateMeBody } from '../validators/user.js';

const router = Router();
router.get('/me', getMe);
router.patch('/me', validate({ body: updateMeBody }), updateMe);
router.delete('/me', validate({ body: deleteMeBody }), deleteMe);
export default router;
