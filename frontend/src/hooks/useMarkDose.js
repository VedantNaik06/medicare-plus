import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { doseApi } from '../services/endpoints.js';
import { getErrorMessage } from '../utils/errors.js';

// Shared "taken / skipped" action with loading state and toast feedback.
export function useMarkDose(onChanged) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(null);

  const mark = useCallback(
    async (id, status) => {
      setBusy(`${id}:${status}`);
      try {
        await doseApi.mark(id, status);
        toast.success(t(status === 'taken' ? 'medicines.markedTaken' : 'medicines.markedSkipped'));
        await onChanged?.();
      } catch (err) {
        toast.error(getErrorMessage(err, t));
      } finally {
        setBusy(null);
      }
    },
    [onChanged, t]
  );

  return { mark, busy };
}
