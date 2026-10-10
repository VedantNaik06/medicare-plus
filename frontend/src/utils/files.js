import { recordApi } from '../services/endpoints.js';

// Files are private, so we fetch them with our login cookie and show them from a temporary local URL.
export async function openRecordFile(record, { download = false } = {}) {
  // Open the tab immediately (inside the click) so pop-up blockers allow it.
  const tab = download ? null : window.open('about:blank', '_blank');
  try {
    const blob = await recordApi.file(record.id, download);
    const url = URL.createObjectURL(blob);
    if (download || !tab) {
      const a = document.createElement('a');
      a.href = url;
      a.download = record.originalName || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      tab.location.href = url;
    }
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
  } catch (err) {
    if (tab) tab.close();
    throw err;
  }
}

export const formatBytes = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export const MAX_FILE_MB = 5; // must match MAX_FILE_SIZE_MB on the server
export const ACCEPT = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
export const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
