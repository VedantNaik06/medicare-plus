import Appointment from '../models/Appointment.js';
import DoseLog from '../models/DoseLog.js';
import Measurement from '../models/Measurement.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Medicine from '../models/Medicine.js';
import TestReport from '../models/TestReport.js';
import User from '../models/User.js';
import * as storage from './storageService.js';

// Account removal: delete files first, then every row that belongs to the user.
export async function deleteUserData(userId) {
  const records = await MedicalRecord.find({ user: userId }).select('storageKey');
  for (const r of records) await storage.remove(r.storageKey);

  await Promise.all([
    Measurement.deleteMany({ user: userId }),
    TestReport.deleteMany({ user: userId }),
    MedicalRecord.deleteMany({ user: userId }),
    DoseLog.deleteMany({ user: userId }),
    Medicine.deleteMany({ user: userId }),
    Appointment.deleteMany({ user: userId }),
  ]);
  await User.deleteOne({ _id: userId });
}
