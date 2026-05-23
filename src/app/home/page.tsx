import { redirect } from 'next/navigation';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { getTranslations } from 'next-intl/server';
import PageShell from '@/components/page-shell';
import { getCurrentUser } from '@/use-cases/get-current-user';
import HomeActions, { HomeLogoutButton } from './_components/home-actions';

/**
 * Authenticated home — connect / start / logout entry point.
 *
 * SSR-fetches the user via the forwarded session cookie. Bounces to `/` if
 * the cookie is missing/invalid/expired. The greeting renders on the
 * server; interactive controls (Create/Join sticky CTAs + logout) live in
 * client islands and don't need the user prop.
 */
const HomePage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect('/start');

  const t = await getTranslations('home');
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <PageShell
      appBar={{ title: t('title'), trailing: <HomeLogoutButton /> }}
      footer={<HomeActions isAdmin={user.isAdmin} />}
    >
      <Stack spacing={3} sx={{ textAlign: 'center', alignItems: 'center', pt: 4 }}>
        <Avatar
          src={user.avatarUrl ?? undefined}
          alt={user.name}
          sx={{
            width: 88,
            height: 88,
            bgcolor: 'rgba(0,122,255,0.14)',
            color: 'rgba(0,122,255,0.95)',
            fontSize: '2rem',
            fontWeight: 600,
            border: '0.5px solid rgba(255,255,255,0.7)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          }}
        >
          {initial}
        </Avatar>

        <Box>
          <Typography
            component="h2"
            sx={{
              fontSize: '1.8rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.88)',
              letterSpacing: '-0.02em',
              mb: 1,
            }}
          >
            {t('greeting', { name: user.name })}
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, px: 1 }}>
            {t('subtitle')}
          </Typography>
        </Box>
      </Stack>
    </PageShell>
  );
};

export default HomePage;
