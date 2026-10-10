import cron from 'node-cron';
import { topUpAllUsers } from './doseService.js';

// The scheduler keeps every user's next 7 days of dose rows prepared, even if nobody opens the app.
// It is safe after a restart because everything is stored in MongoDB and creation is idempotent
// (unique index + upsert). "Due" and "overdue" are computed from the clock when data is read,
// so correctness never depends on this job having run on time.
export function startScheduler() {
  const run = async () => {
    try {
      const n = await topUpAllUsers();
      console.log(`[scheduler] dose schedules refreshed for ${n} medicine(s)`);
    } catch (err) {
      console.error('[scheduler] failed:', err.message);
    }
  };
  run();
  return cron.schedule('0 * * * *', run); // every hour, on the hour
}
