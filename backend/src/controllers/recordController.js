import MedicalRecord from '../models/MedicalRecord.js';
import TestReport from '../models/TestReport.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError, notFound } from '../utils/ApiError.js';
import { ok, pageInfo, skipFor } from '../utils/response.js';
import { serializeRecord } from '../utils/serializers.js';
import { recordBody } from '../validators/record.js';
import * as storage from '../services/storageService.js';

const mine = (req, extra = {}) => ({ user: req.user._id, ...extra });

export const listRecords = asyncHandler(async (req, res) => {
  const { page, limit, type } = req.query;
  const filter = mine(req, type ? { type } : {});
  const [total, docs] = await Promise.all([
    MedicalRecord.countDocuments(filter),
    MedicalRecord.find(filter).sort({ createdAt: -1 }).skip(skipFor(page, limit)).limit(limit),
  ]);
  ok(res, { items: docs.map(serializeRecord), ...pageInfo(page, limit, total) });
});

// POST /records  (multipart: file + type + title + recordDate)
export const uploadRecord = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'VALIDATION_ERROR', 'A file is required.', [{ field: 'file', message: 'validation.fileRequired' }]);

  try {
    const body = recordBody.parse(req.body);
    const { storageKey, mimeType } = await storage.finalizeUpload(req.file);
    try {
      const record = await MedicalRecord.create({
        user: req.user._id,
        type: body.type,
        title: body.title || req.file.originalname.slice(0, 100),
        originalName: req.file.originalname.slice(0, 200),
        storageKey,
        mimeType,
        sizeBytes: req.file.size,
        recordDate: body.recordDate,
      });
      ok(res, { record: serializeRecord(record) }, 201);
    } catch (err) {
      await storage.remove(storageKey); // do not leave a file with no database row
      throw err;
    }
  } catch (err) {
    await storage.remove(req.file.filename).catch(() => {}); // temp file may already be renamed
    throw err;
  }
});

// GET /records/:id/file  - only the owner can read the file; there is no public URL.
export const getRecordFile = asyncHandler(async (req, res, next) => {
  const record = await MedicalRecord.findOne(mine(req, { _id: req.params.id }));
  if (!record) throw notFound();

  const safeName = record.originalName.replace(/[^\w.\- ]+/g, '_');
  const disposition = req.query.download === '1' ? 'attachment' : 'inline';
  res.setHeader('Content-Type', record.mimeType);
  res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'private, no-store');

  const stream = storage.openReadStream(record.storageKey);
  stream.on('error', (err) => (err.code === 'ENOENT' ? next(notFound()) : next(err)));
  stream.pipe(res);
});

export const deleteRecord = asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findOneAndDelete(mine(req, { _id: req.params.id }));
  if (!record) throw notFound();
  await storage.remove(record.storageKey);
  await TestReport.updateMany(mine(req, { record: record._id }), { record: null });
  ok(res, { deleted: true });
});
