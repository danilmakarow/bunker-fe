'use client';

import { Box } from '@mui/material';
import type { Participant } from '@/entities';
import { GlassFieldGroup, GlassLabel } from './glass';
import ParticipantRow from './participant-row';

interface ParticipantListProps {
  participants: Participant[];
  myUserId: string | undefined;
  amIAdmin: boolean;
  onKick: (participant: Participant) => void;
  headerLabel: string;
  kickLabel: string;
  youLabel: string;
}

/**
 * Active-roster view of a lobby. Filters out KICKED/LEFT history rows
 * and orders by seat number. The kick affordance is rendered only when
 * the local user is the admin and the row isn't self.
 */
const ParticipantList = ({
  participants,
  myUserId,
  amIAdmin,
  onKick,
  headerLabel,
  kickLabel,
  youLabel,
}: ParticipantListProps) => {
  const active = participants
    .filter((participant) => participant.status === 'JOINED')
    .slice()
    .sort((left, right) => left.seatNumber - right.seatNumber);

  return (
    <Box>
      <GlassLabel sx={{ px: 0.5, mb: 1 }}>
        {headerLabel} ({active.length})
      </GlassLabel>
      <GlassFieldGroup>
        {active.map((participant) => (
          <ParticipantRow
            key={participant.id}
            participant={participant}
            isSelf={participant.userId === myUserId}
            canKick={amIAdmin && participant.userId !== myUserId}
            onKick={onKick}
            kickLabel={kickLabel}
            youLabel={youLabel}
          />
        ))}
      </GlassFieldGroup>
    </Box>
  );
};

export default ParticipantList;
