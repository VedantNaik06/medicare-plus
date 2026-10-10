import './setup.js';
import test from 'node:test';
import assert from 'node:assert/strict';

const { buildComparison } = await import('../src/services/compareService.js');
const { normalizeName, normalizeUnit } = await import('../src/utils/time.js');

const row = (date, value, unit, extra = {}) => ({
  report: `r-${date}`, testDate: date, name: 'Hemoglobin', nameKey: 'hemoglobin',
  valueType: 'numeric', valueNumber: value, unit, unitKey: normalizeUnit(unit), ...extra,
});

test('names and units are normalised so "mg/dL" and "MG/DL " match', () => {
  assert.equal(normalizeName('  Total  Cholesterol (LDL) '), 'total cholesterol ldl');
  assert.equal(normalizeUnit('MG/DL '), normalizeUnit('mg/dl'));
});

test('only values with the same unit are placed on one chart', () => {
  const rows = [row('2026-01-01', 12.5, 'g/dL'), row('2026-04-01', 13.1, 'g/dL'), row('2026-07-01', 130, 'g/L')];
  const result = buildComparison(rows);
  assert.equal(result.unit, 'g/dL');
  assert.equal(result.points.length, 2);
  assert.equal(result.otherUnitCount, 1);
  assert.equal(result.availableUnits.length, 2);
});

test('a requested unit that does not exist gives an empty chart, not mixed data', () => {
  const result = buildComparison([row('2026-01-01', 12.5, 'g/dL')], 'mmol/l');
  assert.equal(result.points.length, 0);
});

test('text results are listed separately and never charted', () => {
  const rows = [row('2026-01-01', 12.5, 'g/dL'), { ...row('2026-02-01', 0, ''), valueType: 'qualitative', valueNumber: undefined, valueText: 'Positive' }];
  const result = buildComparison(rows);
  assert.equal(result.points.length, 1);
  assert.equal(result.qualitative.length, 1);
});

test('reference ranges are shown only when the user typed them', () => {
  const result = buildComparison([row('2026-01-01', 12.5, 'g/dL')]);
  assert.equal(result.points[0].refLow, null);
  assert.equal(result.points[0].refHigh, null);
});
