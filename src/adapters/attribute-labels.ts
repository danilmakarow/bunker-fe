import type { SlotKind } from '@/entities/attributes';

/** i18n key under `game.kind.<KIND>` — full display label for a slot kind. */
export const kindLabelKey = (kind: SlotKind): string => `kind.${kind}`;
