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
  Palette,
  Scale,
  Skull,
  User,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { AttributeKind } from '@/lib/api/types';

/**
 * Single source of truth for the icon associated with each attribute kind.
 * Used by RevealSlot, PlayerCard headers, and the GameTopBar legend.
 */
const ICON_BY_KIND: Record<AttributeKind, LucideIcon> = {
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
  kind: AttributeKind;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** lucide-react icon picker for an attribute kind. */
const AttributeIcon = ({ kind, size = 18, color, strokeWidth = 2 }: AttributeIconProps) => {
  const Icon = ICON_BY_KIND[kind];
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
};

export default AttributeIcon;
