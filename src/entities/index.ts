/**
 * Entities barrel — the core domain models, the innermost layer. Every
 * outer layer (use-cases, adapters, presentation) imports its types from
 * here. Entities depend on nothing but each other.
 *
 * Domain *rules* (the slot model, reveal helpers) live in `./attributes`
 * and are imported directly from `@/entities/attributes`, keeping this
 * barrel type-only.
 */
export type { User } from './user';
export type {
  ParticipantStatus,
  Participant,
  RoomStatus,
  RoomSnapshot,
} from './room';
export type {
  Apocalypse,
  AttributeKind,
  BiologyAxis,
  BiologyValue,
  GamePlayer,
  GameSnapshot,
  MyCharacter,
  Polarity,
  RevealedAttribute,
  Shelter,
  Trait,
  TraitKind,
} from './game';
export type {
  BackofficeApocalypse,
  BackofficeBiologyRow,
  BackofficeShelter,
  BackofficeTrait,
  BackofficeUser,
  BiologyAxisSlug,
  ContentRow,
} from './content';
