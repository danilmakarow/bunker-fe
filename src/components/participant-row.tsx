'use client';

import { Avatar, Box, Typography } from '@mui/material';
import { Crown, X } from 'lucide-react';
import type { Participant } from '@/entities';
import { GlassIconButton } from './glass';
import { glass } from '@/theme/tokens';

interface ParticipantRowProps {
  participant: Participant;
  isSelf: boolean;
  canKick: boolean;
  onKick: (participant: Participant) => void;
  kickLabel: string;
  youLabel: string;
}

/**
 * Single row in the lobby participant list: seat-number badge, avatar, name,
 * crown for admin, "you" pill for the local user, and a kick button slot
 * that's only rendered when the local user is the admin.
 */
const ParticipantRow = ({
  participant,
  isSelf,
  canKick,
  onKick,
  kickLabel,
  youLabel,
}: ParticipantRowProps) => {
  const initial = participant.name.charAt(0).toUpperCase();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.25,
      }}
    >
      <Box
        sx={{
          minWidth: 32,
          height: 32,
          px: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.06)',
          borderRadius: '10px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.04em',
        }}
      >
        {participant.seatNumber}
      </Box>

      <Avatar
        src={participant.avatarUrl ?? undefined}
        alt={participant.name}
        sx={{
          width: 36,
          height: 36,
          bgcolor: 'rgba(0,122,255,0.14)',
          color: 'rgba(0,122,255,0.95)',
          fontSize: '0.95rem',
          fontWeight: 600,
          border: '0.5px solid rgba(255,255,255,0.7)',
        }}
      >
        {initial}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography
          sx={{
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.88)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {participant.name}
        </Typography>

        {participant.isAdmin && (
          <Crown
            size={14}
            strokeWidth={2.2}
            color="rgba(255,149,0,0.9)"
            aria-label="admin"
          />
        )}

        {isSelf && (
          <Box
            sx={{
              ml: 0.5,
              px: 0.75,
              py: 0.1,
              borderRadius: 999,
              background: 'rgba(0,122,255,0.12)',
              color: 'rgba(0,122,255,0.9)',
              fontSize: '0.65rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {youLabel}
          </Box>
        )}
      </Box>

      {canKick && (
        <GlassIconButton
          danger
          aria-label={kickLabel}
          onClick={() => onKick(participant)}
          sx={{ flexShrink: 0, transition: glass.transition }}
        >
          <X size={18} strokeWidth={2.2} />
        </GlassIconButton>
      )}
    </Box>
  );
};

export default ParticipantRow;
