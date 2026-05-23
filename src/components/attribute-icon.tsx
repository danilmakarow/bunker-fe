'use client';

import {
  AlertTriangle,
  Backpack,
  Brain,
  BookOpen,
  Briefcase,
  Calendar,
  Compass,
  HeartPulse,
  IdCard,
  Palette,
  Scale,
  Skull,
  User,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { AttributeKind } from '@/entities';
import { BIOLOGY_SLOT_KIND, type SlotKind } from '@/entities/attributes';

/**
 * Single source of truth for the icon associated with each attribute kind.
 * Includes the synthetic `BIOLOGY` slot used by the player card to render
 * the five biology axes as one combined slot.
 */
const ICON_BY_KIND: Record<SlotKind | AttributeKind, LucideIcon> = {
  [BIOLOGY_SLOT_KIND]: IdCard,
  AGE: Calendar,
  WEIGHT: Scale,
  SEX: User,
  GENDER: Users,
  RACE: Compass,
  HEALTH: HeartPulse,
  PROFESSION: Briefcase,
  HOBBY: Palette,
  PHOBIA: Skull,
  CHARACTER_TRAIT: Brain,
  LUGGAGE: Backpack,
  PERSONAL_FACT: BookOpen,
  ACTION_CARD: Zap,
  CONDITION_CARD: AlertTriangle,
};

interface AttributeIconProps {
  kind: SlotKind | AttributeKind;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** lucide-react icon picker for an attribute or synthetic slot kind. */
const AttributeIcon = ({ kind, size = 18, color, strokeWidth = 2 }: AttributeIconProps) => {
  const Icon = ICON_BY_KIND[kind];
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
};

export default AttributeIcon;
