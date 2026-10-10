import { Router } from 'express';
import { deleteRecord, getRecordFile, listRecords, uploadRecord } from '../controllers/recordController.js';
import { uploadSingle } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { idParams } from '../validators/common.js';
import { fileQuery, recordListQuery } from '../validators/record.js';

const router = Router();
router.get('/', validate({ query: recordListQuery }), listRecords);
router.post('/', uploadSingle, uploadRecord); // body is validated inside the controller (after the upload)
router.get('/:id/file', validate({ params: idParams, query: fileQuery }), getRecordFile);
router.delete('/:id', validate({ params: idParams }), deleteRecord);
export default router;
