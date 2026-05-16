import type { AttributeKind, BiologyAxis, Polarity, TraitKind } from '@/lib/api/types';

/** Display order of biology axes on a player card. */
export const BIOLOGY_AXES: readonly BiologyAxis[] = [
  'AGE',
  'WEIGHT',
  'SEX',
  'GENDER',
  'RACE',
];

/**
 * How many slots each trait kind contributes to a player's card.
 * Mirrors the BE's `TRAIT_DRAW_COUNTS` (TASK.md §6.1).
 */
export const TRAIT_SLOT_COUNTS: Record<TraitKind, number> = {
  HEALTH: 1,
  PROFESSION: 1,
  HOBBY: 1,
  PHOBIA: 1,
  CHARACTER_TRAIT: 1,
  LUGGAGE: 1,
  PERSONAL_FACT: 1,
  ACTION_CARD: 2,
  CONDITION_CARD: 1,
};

/**
 * Display order of trait kinds. Multi-slot kinds (ACTION_CARD) appear once
 * here; the slot index is added when expanding the canonical slot list.
 */
export const TRAIT_KIND_ORDER: readonly TraitKind[] = [
  'HEALTH',
  'PROFESSION',
  'HOBBY',
  'PHOBIA',
  'CHARACTER_TRAIT',
  'LUGGAGE',
  'PERSONAL_FACT',
  'ACTION_CARD',
  'CONDITION_CARD',
];

/**
 * A single slot on a player card. `instance` disambiguates multi-slot kinds
 * (e.g. the two ACTION_CARD slots — instances 0 and 1).
 */
export interface AttributeSlot {
  kind: AttributeKind;
  instance: number;
}

/**
 * Canonical ordered list of every slot on a player card. Used by the
 * other-player view to render placeholder locked tiles before any reveals
 * land. Order: biology axes first, then trait kinds in display order,
 * with multi-slot kinds expanded.
 */
export const ALL_SLOTS: readonly AttributeSlot[] = [
  ...BIOLOGY_AXES.map((kind) => ({ kind, instance: 0 })),
  ...TRAIT_KIND_ORDER.flatMap((kind) =>
    Array.from({ length: TRAIT_SLOT_COUNTS[kind] }, (_, instance) => ({ kind, instance })),
  ),
];

/** True when the kind is one of the biology axes (5 fixed slots per card). */
export const isBiologyAxis = (kind: AttributeKind): kind is BiologyAxis =>
  (BIOLOGY_AXES as readonly AttributeKind[]).includes(kind);

/** i18n key under `game.kind.<KIND>` — full display label for an attribute kind. */
export const kindLabelKey = (kind: AttributeKind): string => `kind.${kind}`;

/** Maps trait/apocalypse/shelter polarity to an iOS-palette CSS color. */
export const polarityColor = (polarity: Polarity): string => {
  if (polarity === 'POSITIVE') return 'rgba(52,199,89,0.85)';
  if (polarity === 'NEGATIVE') return 'rgba(255,59,48,0.85)';
  return 'rgba(0,0,0,0.45)';
};
