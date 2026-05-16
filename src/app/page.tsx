import { redirect } from 'next/navigation';
import { Box, Stack, Typography } from '@mui/material';
import { getTranslations } from 'next-intl/server';
import { GlassButton } from '@/components/glass';
import PageShell from '@/components/page-shell';
import { getCurrentUser } from '@/lib/api/auth';

/**
 * Landing / login page.
 *
 * SSR — reads the session cookie via {@link getCurrentUser}. If the user is
 * already signed in, redirect to `/home`. Otherwise render the hero with
 * the "Sign in with Google" button, which plain-navigates to the BE OAuth
 * route (the rewrite proxies it, the BE sets the cookie and redirects
 * back to `${FRONTEND_URL}/home`).
 */
const LandingPage = async () => {
  const user = await getCurrentUser();
  if (user) redirect('/home');

  const t = await getTranslations('landing');

  return (
    <PageShell centered>
      <Stack
        spacing={4}
        sx={{
          textAlign: 'center',
          color: 'rgba(0,0,0,0.85)',
          alignItems: 'stretch',
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '2.6rem', sm: '3rem' },
              fontWeight: 800,
              letterSpacing: '-0.03em',
              textShadow: '0 1px 1px rgba(255,255,255,0.4)',
              mb: 1,
            }}
          >
            {t('heading')}
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: 'rgba(0,0,0,0.65)' }}>
            {t('subheading')}
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          <GlassButton
            component="a"
            href="/api/auth/google"
            glassVariant="primary"
            sx={{ py: 1.6, fontSize: '1rem' }}
          >
            {t('signIn')}
          </GlassButton>
        </Stack>

        <Typography
          sx={{
            fontSize: '0.85rem',
            color: 'rgba(0,0,0,0.55)',
            lineHeight: 1.55,
            px: 1,
          }}
        >
          {t('footerHint')}
        </Typography>
      </Stack>
    </PageShell>
  );
};

export default LandingPage;
