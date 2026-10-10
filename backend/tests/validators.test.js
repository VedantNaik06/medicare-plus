import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';

const { registerBody } = await import('../src/validators/auth.js');
const { medicineBody } = await import('../src/validators/medicine.js');
const { testBody } = await import('../src/validators/test.js');

test('registration rejects a weak password and a bad email', () => {
  const bad = registerBody.safeParse({ name: 'Asha', email: 'nope', password: 'short' });
  assert.equal(bad.success, false);
  const good = registerBody.safeParse({ name: 'Asha', email: 'ASHA@Example.com ', password: 'abcdefg1' });
  assert.equal(good.success, true);
  assert.equal(good.data.email, 'asha@example.com');
});

test('registration ignores unexpected fields such as "user" or "role"', () => {
  const parsed = registerBody.parse({ name: 'Asha', email: 'a@b.co', password: 'abcdefg1', role: 'admin', user: '123' });
  assert.equal('role' in parsed, false);
  assert.equal('user' in parsed, false);
});

test('medicine needs unique, valid times and an end date after the start date', () => {
  const base = { name: 'Vitamin D', frequency: 'twice', times: ['08:00', '20:00'], startDate: '2026-10-10' };
  assert.equal(medicineBody.safeParse(base).success, true);
  assert.equal(medicineBody.safeParse({ ...base, times: ['08:00', '08:00'] }).success, false);
  assert.equal(medicineBody.safeParse({ ...base, times: ['25:00'] }).success, false);
  assert.equal(medicineBody.safeParse({ ...base, endDate: '2026-10-01' }).success, false);
});

test('numeric measurements must contain a number; lab range must be ordered', () => {
  const base = { testName: 'CBC', testDate: '2026-10-01' };
  const m = (extra) => ({ ...base, measurements: [{ name: 'Hemoglobin', valueType: 'numeric', value: '13.2', ...extra }] });
  assert.equal(testBody.safeParse(m({})).success, true);
  assert.equal(testBody.safeParse(m({ value: 'abc' })).success, false);
  assert.equal(testBody.safeParse(m({ refLow: '15', refHigh: '10' })).success, false);
});
