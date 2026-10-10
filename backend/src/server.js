import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { startScheduler } from './services/schedulerService.js';

try {
  await connectDB();
} catch (err) {
  console.error('Could not connect to MongoDB:', err.message);
  console.error('Check MONGODB_URI in backend/.env and Atlas "Network Access" (allow your IP address).');
  process.exit(1);
}

const server = app.listen(env.PORT, () => console.log(`MediCare+ API running on http://localhost:${env.PORT}`));
const job = startScheduler();

async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  job.stop();
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
