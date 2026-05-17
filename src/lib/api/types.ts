/**
 * API surface types — kept in lockstep with the bunker-api DTOs.
 * Describe the **inner payload** (post-envelope-unwrap), not the wire format.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

export type RoomStatus = 'LOBBY' | 'IN_GAME' | 'FINISHED' | 'ABANDONED';

export type ParticipantStatus = 'JOINED' | 'KICKED' | 'LEFT';

export interface Participant {
  id: string;
  userId: string;
  seatNumber: number;
  name: string;
  avatarUrl: string | null;
  status: ParticipantStatus;
  isAdmin: boolean;
  joinedAt: string;
  leftAt: string | null;
}

export interface RoomSnapshot {
  id: string;
  code: string;
  status: RoomStatus;
  adminUserId: string;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  participants: Participant[];
}

export type BiologyAxis = 'AGE' | 'WEIGHT' | 'SEX' | 'GENDER' | 'RACE';

export type TraitKind =
  | 'HEALTH'
  | 'PROFESSION'
  | 'HOBBY'
  | 'PHOBIA'
  | 'CHARACTER_TRAIT'
  | 'LUGGAGE'
  | 'PERSONAL_FACT'
  | 'ACTION_CARD'
  | 'CONDITION_CARD';

/** Every kind that can be revealed during play — biology axes + trait kinds. */
export type AttributeKind = BiologyAxis | TraitKind;

export type Polarity = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface BiologyValue {
  id: string;
  valueUk: string;
}

export interface Trait {
  id: string;
  kind: TraitKind;
  polarity: Polarity;
  titleUk: string;
  descriptionUk: string | null;
}

export interface Apocalypse {
  id: string;
  nameUk: string;
  descriptionUk: string;
  populationRemainderUk: string;
  polarity: Polarity;
}

export interface Shelter {
  id: string;
  areaUk: string;
  locationUk: string;
  durationUk: string;
  equipmentUk: string;
  suppliesUk: string;
  polarity: Polarity;
}

export interface MyCharacter {
  id: string;
  age: BiologyValue;
  weight: BiologyValue;
  sex: BiologyValue;
  gender: BiologyValue;
  race: BiologyValue;
  traits: Trait[];
}

/**
 * One publicly revealed slot on any player's card. Exactly one of
 * `biologyValue` / `trait` is set, mirroring the BE's `RevealedAttribute`
 * DTO. Reveals are global — every player in the room sees the same shape.
 */
export interface RevealedAttribute {
  attribute: AttributeKind;
  biologyValue: BiologyValue | null;
  trait: Trait | null;
  revealedAt: string;
}

export interface GamePlayer {
  userId: string;
  seatNumber: number;
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  status: ParticipantStatus;
  /**
   * Publicly revealed slots. Order is BE-determined (`revealedAt` ASC).
   * The same shape appears on every player entry, including the caller's,
   * so the FE can derive "is this slot public" for my own card too.
   */
  reveals: RevealedAttribute[];
}

export interface GameSnapshot {
  roomId: string;
  code: string;
  status: RoomStatus;
  adminUserId: string;
  apocalypse: Apocalypse;
  shelter: Shelter;
  myCharacter: MyCharacter;
  players: GamePlayer[];
  startedAt: string;
  finishedAt: string | null;
}
