import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';

const { buildDoseTimes, getDisplayStatus } = await import('../src/services/doseService.js');

const med = { startDate: '2026-10-10', endDate: '2026-10-11', times: ['08:00', '20:00'] };

test('builds one dose per time per day, converted from Kolkata time to UTC', () => {
  const now = new Date('2026-10-10T02:00:00Z'); // 07:30 in Kolkata
  const doses = buildDoseTimes(med, 'Asia/Kolkata', now);
  assert.equal(doses.length, 4); // 2 days x 2 times
  assert.equal(doses[0].toISOString(), '2026-10-10T02:30:00.000Z'); // 08:00 IST
  assert.equal(doses[1].toISOString(), '2026-10-10T14:30:00.000Z'); // 20:00 IST
});

test('does not create doses before the start date or after the end date', () => {
  const now = new Date('2026-10-08T00:00:00Z');
  const doses = buildDoseTimes(med, 'Asia/Kolkata', now);
  assert.ok(doses.every((d) => d >= new Date('2026-10-09T18:30:00Z') && d <= new Date('2026-10-11T18:30:00Z')));
  assert.equal(doses.length, 4);
});

test('a dose moves from upcoming to due to overdue as time passes', () => {
  const log = { status: 'scheduled', scheduledAt: new Date('2026-10-10T08:00:00Z') };
  assert.equal(getDisplayStatus(log, new Date('2026-10-10T07:59:00Z')), 'upcoming');
  assert.equal(getDisplayStatus(log, new Date('2026-10-10T08:30:00Z')), 'due');
  assert.equal(getDisplayStatus(log, new Date('2026-10-10T09:01:00Z')), 'overdue');
});

test('taken and skipped doses keep their status', () => {
  const when = new Date('2026-10-10T08:00:00Z');
  assert.equal(getDisplayStatus({ status: 'taken', scheduledAt: when }, new Date('2026-10-12T00:00:00Z')), 'taken');
  assert.equal(getDisplayStatus({ status: 'skipped', scheduledAt: when }, new Date('2026-10-12T00:00:00Z')), 'skipped');
});
