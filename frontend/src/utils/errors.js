// Turn any API/network error into a message in the user's language.
export function errorCode(error) {
  if (!error) return 'UNKNOWN';
  if (!error.response) return 'NETWORK';
  return error.response.data?.error?.code || 'UNKNOWN';
}

export function getErrorMessage(error, t) {
  const code = errorCode(error);
  return t(`errors.${code}`, { defaultValue: t('errors.UNKNOWN') });
}

// Show server-side field errors (translated) on the matching form fields.
// Returns true if at least one field error was shown.
export function applyServerErrors(error, setError, t) {
  const details = error?.response?.data?.error?.details;
  if (!Array.isArray(details) || !details.length) return false;
  let shown = false;
  for (const d of details) {
    if (!d.field) continue;
    setError(d.field, { type: 'server', message: t(d.message, { defaultValue: t('validation.invalid') }) });
    shown = true;
  }
  return shown;
}
