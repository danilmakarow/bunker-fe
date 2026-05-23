/**
 * Backoffice content domain models (admin-only). These carry the full
 * editable row shape — draw weight, enabled flag, timestamps — on top of
 * the player-facing fields. Mirror of the bunker-api `ContentEntity` DTOs.
 */
import type { Polarity, TraitKind } from './game';

/**
 * Fields every backoffice content row carries on top of its entity-specific
 * payload. Mirrors the BE's `ContentEntity` base.
 */
export interface ContentRow {
  id: string;
  enabled: boolean;
  /** Non-negative integer relative draw weight. 0 = effectively disabled. */
  weight: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackofficeUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  createdAt: string;
}

export interface BackofficeApocalypse extends ContentRow {
  nameUk: string;
  descriptionUk: string;
  populationRemainderUk: string;
  polarity: Polarity;
}

export interface BackofficeShelter extends ContentRow {
  areaUk: string;
  locationUk: string;
  durationUk: string;
  equipmentUk: string;
  suppliesUk: string;
  polarity: Polarity;
}

export interface BackofficeTrait extends ContentRow {
  kind: TraitKind;
  polarity: Polarity;
  titleUk: string;
  descriptionUk: string | null;
}

export interface BackofficeBiologyRow extends ContentRow {
  valueUk: string;
}

export type BiologyAxisSlug = 'ages' | 'weights' | 'sexes' | 'genders' | 'races';
