import { ALargeSmall } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTextSize } from '../../hooks/useTextSize.js';

// One button in the header that cycles Normal -> Large -> Extra large.
export default function TextSizeToggle() {
  const { t } = useTranslation();
  const { size, cycle } = useTextSize();
  const label = t('a11y.textSize', { size: t(`a11y.sizes.${size}`) });
  return (
    <button type="button" onClick={cycle} aria-label={label} title={label}
      className="grid size-11 place-items-center rounded-full text-brand-900 hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-brand-700">
      <ALargeSmall className="size-6" aria-hidden="true" />
    </button>
  );
}
