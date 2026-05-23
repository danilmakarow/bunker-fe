'use client';

import Link from 'next/link';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { BiologyAxisSlug } from '@/entities';
import { glass } from '@/theme/tokens';

interface BiologyAxisTabsProps {
  current: BiologyAxisSlug;
}

const AXES: readonly BiologyAxisSlug[] = [
  'ages',
  'weights',
  'sexes',
  'genders',
  'races',
];

/**
 * Horizontal scroll-strip switcher for the 5 biology axes. Each tab is a
 * `<Link>` so clicks survive a hard refresh and the URL stays shareable.
 */
const BiologyAxisTabs = ({ current }: BiologyAxisTabsProps) => {
  const t = useTranslations('backoffice.biologyAxis');

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        pb: 0.5,
        mb: 2,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {AXES.map((axis) => {
        const active = axis === current;
        return (
          <Link
            key={axis}
            href={`/backoffice/biology/${axis}`}
            style={{ textDecoration: 'none' }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 0.7,
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                color: active ? '#fff' : 'rgba(0,0,0,0.7)',
                background: active
                  ? 'rgba(0,122,255,0.85)'
                  : 'rgba(255,255,255,0.55)',
                border: `0.5px solid ${active ? 'rgba(0,122,255,0.85)' : glass.border}`,
                backdropFilter: glass.blur,
                WebkitBackdropFilter: glass.blur,
                transition: glass.transition,
              }}
            >
              {t(axis)}
            </Box>
          </Link>
        );
      })}
    </Box>
  );
};

export default BiologyAxisTabs;
