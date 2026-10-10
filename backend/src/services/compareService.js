// Pure function: decides what can be compared on one chart.
// Rules: same measurement name AND same unit. Different units are never mixed or converted.
export function buildComparison(rows, requestedUnitKey) {
  if (!rows.length) {
    return { name: null, nameKey: null, unit: '', unitKey: '', availableUnits: [], points: [], qualitative: [], otherUnitCount: 0 };
  }

  const numeric = rows.filter((r) => r.valueType === 'numeric' && Number.isFinite(r.valueNumber));
  const qualitative = rows
    .filter((r) => r.valueType === 'qualitative')
    .map((r) => ({ reportId: String(r.report), date: r.testDate, value: r.valueText || '' }));

  const groups = new Map();
  for (const r of numeric) {
    const g = groups.get(r.unitKey) || { unitKey: r.unitKey, unit: r.unit || '', count: 0 };
    g.count += 1;
    groups.set(r.unitKey, g);
  }
  const availableUnits = [...groups.values()].sort((a, b) => b.count - a.count);
  const chosen = requestedUnitKey !== undefined ? groups.get(requestedUnitKey) || null : availableUnits[0] || null;

  const points = chosen
    ? numeric
        .filter((r) => r.unitKey === chosen.unitKey)
        .map((r) => ({
          reportId: String(r.report),
          date: r.testDate,
          value: r.valueNumber,
          refLow: r.refLow ?? null,
          refHigh: r.refHigh ?? null,
          refText: r.refText || '',
        }))
    : [];

  return {
    name: rows[0].name,
    nameKey: rows[0].nameKey,
    unit: chosen ? chosen.unit : '',
    unitKey: chosen ? chosen.unitKey : '',
    availableUnits,
    points,
    qualitative,
    otherUnitCount: numeric.length - points.length,
  };
}
