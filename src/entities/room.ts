/**
 * Lobby / room domain models — the pre-game membership view.
 * Mirror of the bunker-api room DTOs (inner payload, post-envelope-unwrap).
 */

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
