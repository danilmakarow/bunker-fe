import Link from 'next/link';
import { Box, Stack, Typography } from '@mui/material';
import { Eye, IdCard, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { GlassButton, GlassCard, GlassLabel } from '@/components/glass';
import PageShell from '@/components/page-shell';

interface HowToStep {
  icon: typeof Users;
  title: string;
  text: string;
}

/**
 * Public marketing landing.
 *
 * Describes the game and routes visitors to `/start` to sign in. Fully
 * static — no session lookup — so it stays fast and cacheable; `/start`
 * owns the auth check and bounces already-signed-in users to `/home`.
 */
const LandingPage = async () => {
  const t = await getTranslations('landing');

  const steps: HowToStep[] = [
    { icon: Users, title: t('step1Title'), text: t('step1Text') },
    { icon: IdCard, title: t('step2Title'), text: t('step2Text') },
    { icon: Eye, title: t('step3Title'), text: t('step3Text') },
  ];

  return (
    <PageShell
      footer={
        <GlassButton
          component={Link}
          href="/start"
          glassVariant="primary"
          sx={{ py: 1.6, fontSize: '1rem' }}
        >
          {t('cta')}
        </GlassButton>
      }
    >
      <Stack spacing={4} sx={{ color: 'rgba(255,255,255,0.85)', pt: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '2.8rem', sm: '3.2rem' },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              textShadow: '0 1px 1px rgba(255,255,255,0.4)',
              mb: 1,
            }}
          >
            {t('heading')}
          </Typography>
          <Typography
            sx={{
              fontSize: '1.1rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '-0.01em',
            }}
          >
            {t('tagline')}
          </Typography>
        </Box>

        <GlassCard sx={{ p: 2.25 }}>
          <Typography
            sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}
          >
            {t('intro')}
          </Typography>
        </GlassCard>

        <Box>
          <GlassLabel sx={{ px: 0.5, mb: 1.5 }}>{t('stepsTitle')}</GlassLabel>
          <Stack spacing={1.5}>
            {steps.map(({ icon: Icon, title, text }) => (
              <GlassCard
                key={title}
                sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 1.75 }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    flexShrink: 0,
                    background: 'rgba(0,122,255,0.1)',
                    color: 'rgba(0,122,255,0.9)',
                  }}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.88)',
                      mb: 0.25,
                    }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.45 }}
                  >
                    {text}
                  </Typography>
                </Box>
              </GlassCard>
            ))}
          </Stack>
        </Box>

        <Typography
          sx={{
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            px: 1,
          }}
        >
          {t('ctaHint')}
        </Typography>
      </Stack>
    </PageShell>
  );
};

export default LandingPage;
