'use client';

import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Apocalypse, Polarity, Shelter } from '@/lib/api/types';
import { polarityColor } from '@/lib/game/attributes';
import { GlassIconButton, GlassLabel } from './glass';
import InfoSheet from './info-sheet';

interface GameTopBarProps {
  apocalypse: Apocalypse;
  shelter: Shelter;
}

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = ({ label, value }: InfoRowProps) => (
  <Box>
    <Typography
      sx={{
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'rgba(0,0,0,0.45)',
        mb: 0.25,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: '0.95rem',
        color: 'rgba(0,0,0,0.85)',
        lineHeight: 1.45,
      }}
    >
      {value}
    </Typography>
  </Box>
);

interface PolarityChipProps {
  label: string;
  polarity: Polarity;
}

const PolarityChip = ({ label, polarity }: PolarityChipProps) => (
  <Box
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.6,
      px: 0.9,
      py: 0.25,
      borderRadius: 999,
      background: 'rgba(255,255,255,0.6)',
      border: `0.5px solid ${polarityColor(polarity)}`,
      color: polarityColor(polarity),
      fontSize: '0.7rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
    }}
  >
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: polarityColor(polarity),
      }}
    />
    {label}
  </Box>
);

/**
 * Slot rendered in the AppBar's `trailing` slot during a game. A single
 * info icon opens an InfoSheet with the apocalypse and shelter details —
 * the at-a-glance scenario card sits inside the page content above the
 * player grid, so this sheet is the deep-dive surface.
 */
const GameTopBar = ({ apocalypse, shelter }: GameTopBarProps) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('game');
  const tPolarity = useTranslations('game.polarity');

  return (
    <>
      <GlassIconButton
        active={open}
        onClick={() => setOpen(true)}
        aria-label={t('infoSheet.title')}
      >
        <Info size={20} strokeWidth={2.2} />
      </GlassIconButton>

      <InfoSheet open={open} title={t('infoSheet.title')} onClose={() => setOpen(false)}>
        <Stack spacing={3}>
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 1.5,
                mb: 1,
              }}
            >
              <GlassLabel sx={{ mb: 0 }}>{t('infoSheet.apocalypseHeading')}</GlassLabel>
              <PolarityChip label={tPolarity(apocalypse.polarity)} polarity={apocalypse.polarity} />
            </Box>
            <Typography
              sx={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'rgba(0,0,0,0.88)',
                letterSpacing: '-0.01em',
                mb: 0.5,
              }}
            >
              {apocalypse.nameUk}
            </Typography>
            <Typography
              sx={{ fontSize: '0.92rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.45, mb: 1.5 }}
            >
              {apocalypse.descriptionUk}
            </Typography>
            <InfoRow
              label={t('infoSheet.populationRemainder')}
              value={apocalypse.populationRemainderUk}
            />
          </Box>

          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 1.5,
                mb: 1,
              }}
            >
              <GlassLabel sx={{ mb: 0 }}>{t('infoSheet.shelterHeading')}</GlassLabel>
              <PolarityChip label={tPolarity(shelter.polarity)} polarity={shelter.polarity} />
            </Box>
            <Stack spacing={1.5}>
              <InfoRow label={t('infoSheet.location')} value={shelter.locationUk} />
              <InfoRow label={t('infoSheet.area')} value={shelter.areaUk} />
              <InfoRow label={t('infoSheet.duration')} value={shelter.durationUk} />
              <InfoRow label={t('infoSheet.equipment')} value={shelter.equipmentUk} />
              <InfoRow label={t('infoSheet.supplies')} value={shelter.suppliesUk} />
            </Stack>
          </Box>
        </Stack>
      </InfoSheet>
    </>
  );
};

export default GameTopBar;
