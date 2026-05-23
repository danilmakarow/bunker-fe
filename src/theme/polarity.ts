import type { Polarity } from '@/entities/game';

/** Maps trait/apocalypse/shelter polarity to an iOS-palette CSS color. */
export const polarityColor = (polarity: Polarity): string => {
  if (polarity === 'POSITIVE') return 'rgba(52,199,89,0.85)';
  if (polarity === 'NEGATIVE') return 'rgba(255,59,48,0.85)';
  return 'rgba(0,0,0,0.45)';
};
