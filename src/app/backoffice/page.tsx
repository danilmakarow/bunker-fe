import Link from 'next/link';
import { Box, Stack, Typography } from '@mui/material';
import { getTranslations } from 'next-intl/server';
import PageShell from '@/components/page-shell';
import { GlassCard } from '@/components/glass';
import { requireAdmin } from './_components/backoffice-guard';

const sections: ReadonlyArray<{
  href: string;
  labelKey:
    | 'users'
    | 'apocalypses'
    | 'shelters'
    | 'traits'
    | 'biology';
  hintKey:
    | 'usersHint'
    | 'apocalypsesHint'
    | 'sheltersHint'
    | 'traitsHint'
    | 'biologyHint';
}> = [
  { href: '/backoffice/users', labelKey: 'users', hintKey: 'usersHint' },
  {
    href: '/backoffice/apocalypses',
    labelKey: 'apocalypses',
    hintKey: 'apocalypsesHint',
  },
  { href: '/backoffice/shelters', labelKey: 'shelters', hintKey: 'sheltersHint' },
  { href: '/backoffice/traits', labelKey: 'traits', hintKey: 'traitsHint' },
  { href: '/backoffice/biology/ages', labelKey: 'biology', hintKey: 'biologyHint' },
];

/**
 * Backoffice dashboard — tile grid linking to each content section. Guarded
 * server-side by `requireAdmin` so non-admins never see this route.
 */
const BackofficePage = async () => {
  await requireAdmin();
  const t = await getTranslations('backoffice');

  return (
    <PageShell appBar={{ title: t('title'), back: { href: '/home' } }}>
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        <Typography
          sx={{
            fontSize: '0.95rem',
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            px: 2,
          }}
        >
          {t('dashboardSubtitle')}
        </Typography>
        <Stack spacing={1.5}>
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <GlassCard
                sx={{
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  '&:active': { transform: 'scale(0.985)' },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: 'rgba(255,255,255,0.88)',
                  }}
                >
                  {t(`sections.${section.labelKey}`)}
                </Typography>
                <Box
                  sx={{
                    fontSize: '0.82rem',
                    color: 'rgba(255,255,255,0.55)',
                  }}
                >
                  {t(`sections.${section.hintKey}`)}
                </Box>
              </GlassCard>
            </Link>
          ))}
        </Stack>
      </Stack>
    </PageShell>
  );
};

export default BackofficePage;
