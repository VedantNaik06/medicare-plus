import mongoose from 'mongoose';

// One typed value from a report, e.g. "Hemoglobin 13.2 g/dL".
// nameKey + unitKey are normalised copies used to decide which values can be compared.
const measurementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    report: { type: mongoose.Schema.Types.ObjectId, ref: 'TestReport', required: true, index: true },
    testDate: { type: String, required: true }, // copied from the report so charts need one query
    name: { type: String, required: true, trim: true, maxlength: 80 },
    nameKey: { type: String, required: true },
    valueType: { type: String, enum: ['numeric', 'qualitative'], required: true },
    valueNumber: { type: Number },
    valueText: { type: String, trim: true, maxlength: 100 },
    unit: { type: String, trim: true, maxlength: 20, default: '' },
    unitKey: { type: String, default: '' },
    refLow: { type: Number }, // only what the laboratory printed; we never invent ranges
    refHigh: { type: Number },
    refText: { type: String, trim: true, maxlength: 60, default: '' },
  },
  { timestamps: true }
);

measurementSchema.index({ user: 1, nameKey: 1, unitKey: 1, testDate: 1 });

export default mongoose.model('Measurement', measurementSchema);
