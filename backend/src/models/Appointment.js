import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorName: { type: String, required: true, trim: true, maxlength: 100 },
    clinicName: { type: String, trim: true, maxlength: 100, default: '' },
    appointmentAt: { type: Date, required: true }, // UTC
    reason: { type: String, trim: true, maxlength: 300, default: '' },
    status: { type: String, enum: ['upcoming', 'completed', 'rescheduled', 'cancelled'], default: 'upcoming' },
    reminderLeadMinutes: { type: [Number], default: [1440, 60] },
    remindersSent: { type: [Number], default: [] }, // which leads were already notified
  },
  { timestamps: true }
);

appointmentSchema.index({ user: 1, appointmentAt: 1 });

export default mongoose.model('Appointment', appointmentSchema);
