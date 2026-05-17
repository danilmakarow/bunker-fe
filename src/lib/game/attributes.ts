import type {
  AttributeKind,
  BiologyAxis,
  MyCharacter,
  Polarity,
  RevealedAttribute,
  TraitKind,
} from '@/lib/api/types';

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
 * UI-only synthetic kind used to render the five biology axes (age/weight/
 * sex/gender/race) as a single combined slot. The BE still tracks them as
 * five independent attributes — revealing the combined slot fires five
 * mutations under the hood.
 */
export const BIOLOGY_SLOT_KIND = 'BIOLOGY' as const;

/**
 * Union of every kind that can occupy a slot on the player card. Includes
 * the synthetic `BIOLOGY` pseudo-kind plus every BE trait kind.
 */
export type SlotKind = typeof BIOLOGY_SLOT_KIND | TraitKind;

/**
 * A single slot on a player card. `instance` disambiguates multi-slot kinds
 * (e.g. the two ACTION_CARD slots — instances 0 and 1).
 */
export interface AttributeSlot {
  kind: SlotKind;
  instance: number;
}

/**
 * Canonical ordered list of every slot on a player card. Used by the
 * other-player view to render placeholder locked tiles before any reveals
 * land. Order: combined biology slot first, then trait kinds in display
 * order, with multi-slot kinds expanded.
 */
export const ALL_SLOTS: readonly AttributeSlot[] = [
  { kind: BIOLOGY_SLOT_KIND, instance: 0 },
  ...TRAIT_KIND_ORDER.flatMap((kind) =>
    Array.from({ length: TRAIT_SLOT_COUNTS[kind] }, (_, instance) => ({ kind, instance })),
  ),
];

/** True when the kind is one of the biology axes (5 fixed slots per card). */
export const isBiologyAxis = (kind: AttributeKind): kind is BiologyAxis =>
  (BIOLOGY_AXES as readonly AttributeKind[]).includes(kind);

/** i18n key under `game.kind.<KIND>` — full display label for a slot kind. */
export const kindLabelKey = (kind: SlotKind): string => `kind.${kind}`;

/** Maps trait/apocalypse/shelter polarity to an iOS-palette CSS color. */
export const polarityColor = (polarity: Polarity): string => {
  if (polarity === 'POSITIVE') return 'rgba(52,199,89,0.85)';
  if (polarity === 'NEGATIVE') return 'rgba(255,59,48,0.85)';
  return 'rgba(0,0,0,0.45)';
};

/**
 * Returns the reveals of a given attribute kind, in their BE-determined order.
 * Single-slot kinds return at most one entry; ACTION_CARD can return up to two.
 */
export const revealsOfKind = (
  reveals: readonly RevealedAttribute[],
  kind: AttributeKind,
): RevealedAttribute[] => reveals.filter((reveal) => reveal.attribute === kind);

/**
 * Resolves the reveal at a given slot position for an other-player card.
 *
 * Other players' decks are opaque to us, so multi-slot kinds (ACTION_CARD)
 * are filled positionally: instance 0 takes the first revealed entry of
 * that kind, instance 1 the second, and so on. Returns `null` when the
 * slot at this index has not been revealed yet.
 */
export const otherSlotReveal = (
  reveals: readonly RevealedAttribute[],
  kind: AttributeKind,
  instance: number,
): RevealedAttribute | null => revealsOfKind(reveals, kind)[instance] ?? null;

/**
 * True when every biology axis (5 in total) has a public reveal entry.
 * The combined biology slot is treated as revealed only once all axes are
 * shared with the room.
 */
export const isBiologyFullyRevealed = (reveals: readonly RevealedAttribute[]): boolean =>
  BIOLOGY_AXES.every((axis) => reveals.some((reveal) => reveal.attribute === axis));

/**
 * Builds the combined biology summary string for the local player's card —
 * concatenates the five biology values in display order.
 */
export const formatBiologySummaryFromCharacter = (character: MyCharacter): string =>
  [
    character.age.valueUk,
    character.weight.valueUk,
    character.sex.valueUk,
    character.gender.valueUk,
    character.race.valueUk,
  ].join(' · ');

/**
 * Builds the combined biology summary string from a player's public reveals.
 * Returns `null` when biology isn't fully revealed yet; otherwise joins the
 * five biology values in {@link BIOLOGY_AXES} order.
 */
export const formatBiologySummaryFromReveals = (
  reveals: readonly RevealedAttribute[],
): string | null => {
  const parts: string[] = [];
  for (const axis of BIOLOGY_AXES) {
    const reveal = reveals.find(
      (entry) => entry.attribute === axis && entry.biologyValue !== null,
    );
    if (!reveal || !reveal.biologyValue) return null;
    parts.push(reveal.biologyValue.valueUk);
  }
  return parts.join(' · ');
};
