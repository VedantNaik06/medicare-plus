import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { claimDueReminders } from '../services/reminderService.js';

// POST /reminders/claim  -> reminders that THIS request claimed (and so should show as notifications)
export const claim = asyncHandler(async (req, res) => {
  ok(res, await claimDueReminders(req.user));
});
