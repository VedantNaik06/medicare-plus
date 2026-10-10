import mongoose from 'mongoose';

// One row = one scheduled dose (for example "Vitamin D on 12 Oct at 8:00 am").
// Stored status is scheduled | taken | skipped. "due" and "overdue" are worked out when we read.
const doseLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    scheduledAt: { type: Date, required: true }, // UTC
    status: { type: String, enum: ['scheduled', 'taken', 'skipped'], default: 'scheduled' },
    actedAt: { type: Date },
    notifiedAt: { type: Date, default: null }, // set once, atomically, so a reminder is never sent twice
  },
  { timestamps: true }
);

// This unique index is what makes duplicate dose entries impossible.
doseLogSchema.index({ medicine: 1, scheduledAt: 1 }, { unique: true });
doseLogSchema.index({ user: 1, scheduledAt: 1 });

export default mongoose.model('DoseLog', doseLogSchema);
