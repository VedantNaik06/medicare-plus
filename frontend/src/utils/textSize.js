// "Text size" setting for people who find small text hard to read.
// Everything in the app is sized in rem, so changing the root font size scales text AND buttons.
export const TEXT_KEY = 'medicare_text_size';
export const TEXT_SIZES = [
  { id: 'normal', percent: 100 },
  { id: 'large', percent: 115 },
  { id: 'xlarge', percent: 130 },
];
const EVENT = 'textsize:change';

export function getTextSize() {
  try {
    const saved = localStorage.getItem(TEXT_KEY);
    return TEXT_SIZES.some((s) => s.id === saved) ? saved : 'normal';
  } catch {
    return 'normal';
  }
}

export function setTextSize(id) {
  const size = TEXT_SIZES.find((s) => s.id === id) || TEXT_SIZES[0];
  document.documentElement.style.fontSize = `${size.percent}%`;
  try { localStorage.setItem(TEXT_KEY, size.id); } catch { /* private mode: ignore */ }
  window.dispatchEvent(new Event(EVENT));
}

export const TEXT_SIZE_EVENT = EVENT;

// Apply the saved size as soon as the app loads.
setTextSize(getTextSize());
