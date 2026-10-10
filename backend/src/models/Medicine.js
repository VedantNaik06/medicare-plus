import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    dosage: { type: String, trim: true, maxlength: 60, default: '' }, // copied by the user from the prescription
    frequency: { type: String, enum: ['once', 'twice', 'thrice', 'four', 'custom'], default: 'once' },
    times: { type: [String], validate: (v) => v.length >= 1 && v.length <= 8 }, // "HH:mm" in the user's time zone
    startDate: { type: String, required: true }, // "YYYY-MM-DD" (a calendar date, not an instant)
    endDate: { type: String }, // optional
    foodInstruction: { type: String, enum: ['none', 'before', 'after', 'with'], default: 'none' },
    notes: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Medicine', medicineSchema);
