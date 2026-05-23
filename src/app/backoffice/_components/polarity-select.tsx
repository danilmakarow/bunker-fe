'use client';

import { useTranslations } from 'next-intl';
import { GlassFieldGroup, GlassSelect } from '@/components/glass';
import type { Polarity } from '@/entities';

interface PolaritySelectProps {
  value: Polarity;
  onChange: (next: Polarity) => void;
}

const POLARITIES: readonly Polarity[] = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];

/**
 * Inline-row polarity picker. Shares the GlassSelect popover used elsewhere
 * (see `<GlassSelect>` in `glass.tsx`) so the look matches the rest of the
 * iOS-style settings rows.
 */
const PolaritySelect = ({ value, onChange }: PolaritySelectProps) => {
  const t = useTranslations();
  const tCommon = useTranslations('backoffice.common');

  return (
    <GlassFieldGroup>
      <GlassSelect
        label={tCommon('polarity')}
        value={value}
        options={POLARITIES.map((polarity) => ({
          value: polarity,
          label: t(`game.polarity.${polarity}`),
        }))}
        onChange={(event) => onChange(event.target.value as Polarity)}
      />
    </GlassFieldGroup>
  );
};

export default PolaritySelect;
