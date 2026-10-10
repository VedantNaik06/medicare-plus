import mongoose from 'mongoose';

export const TEST_CATEGORIES = ['blood', 'diabetes', 'lipid', 'thyroid', 'urine', 'imaging', 'other'];

const testReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testName: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, enum: TEST_CATEGORIES, default: 'other' },
    testDate: { type: String, required: true }, // "YYYY-MM-DD"
    labName: { type: String, trim: true, maxlength: 100, default: '' },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
    record: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord', default: null }, // original uploaded file
  },
  { timestamps: true }
);

testReportSchema.index({ user: 1, testDate: -1 });

export default mongoose.model('TestReport', testReportSchema);
