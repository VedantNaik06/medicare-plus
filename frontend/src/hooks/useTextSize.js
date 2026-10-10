import { useEffect, useState } from 'react';
import { TEXT_SIZE_EVENT, TEXT_SIZES, getTextSize, setTextSize } from '../utils/textSize.js';

export function useTextSize() {
  const [size, setSize] = useState(getTextSize());
  useEffect(() => {
    const sync = () => setSize(getTextSize());
    window.addEventListener(TEXT_SIZE_EVENT, sync);
    return () => window.removeEventListener(TEXT_SIZE_EVENT, sync);
  }, []);
  const cycle = () => {
    const index = TEXT_SIZES.findIndex((s) => s.id === size);
    setTextSize(TEXT_SIZES[(index + 1) % TEXT_SIZES.length].id);
  };
  return { size, setSize: setTextSize, cycle };
}
