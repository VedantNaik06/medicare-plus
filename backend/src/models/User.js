import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false }, // never returned unless asked for
    language: { type: String, enum: ['en', 'mr'], default: 'en' },
    timeZone: { type: String, default: 'Asia/Kolkata' },
    notificationPrefs: {
      browser: { type: Boolean, default: true },
      appointmentLeadMinutes: { type: [Number], default: [1440, 60] },
    },
    emergencyContact: {
      name: { type: String, trim: true, maxlength: 80, default: '' },
      phone: { type: String, trim: true, maxlength: 20, default: '' },
      relation: { type: String, trim: true, maxlength: 40, default: '' },
    },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
