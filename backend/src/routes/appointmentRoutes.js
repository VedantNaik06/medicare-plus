import { Router } from 'express';
import {
  createAppointment,
  deleteAppointment,
  getAppointment,
  listAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { validate } from '../middleware/validate.js';
import { appointmentBody, appointmentListQuery, appointmentStatusBody } from '../validators/appointment.js';
import { idParams } from '../validators/common.js';

const router = Router();
router.get('/', validate({ query: appointmentListQuery }), listAppointments);
router.post('/', validate({ body: appointmentBody }), createAppointment);
router.get('/:id', validate({ params: idParams }), getAppointment);
router.put('/:id', validate({ params: idParams, body: appointmentBody }), updateAppointment);
router.patch('/:id/status', validate({ params: idParams, body: appointmentStatusBody }), updateAppointmentStatus);
router.delete('/:id', validate({ params: idParams }), deleteAppointment);
export default router;
