import mongoose from 'mongoose';

// Only the METADATA of an uploaded file lives in MongoDB. The file itself is on private storage.
const medicalRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['prescription', 'lab_report', 'other'], default: 'other' },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    originalName: { type: String, trim: true, maxlength: 200, default: 'document' },
    storageKey: { type: String, required: true, unique: true }, // random name, e.g. 3f2a....pdf
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    recordDate: { type: String }, // "YYYY-MM-DD", optional
  },
  { timestamps: true }
);

medicalRecordSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
