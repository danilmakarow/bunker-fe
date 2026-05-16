'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Stack, Typography } from '@mui/material';
import PageShell from '@/components/page-shell';
import { GlassButton, GlassCard } from '@/components/glass';
import { confirm } from '@/lib/modal/modal-store';

interface GamePageProps {
  params: Promise<{ code: string }>;
}

/**
 * Game route shell.
 * SPA route — polling, my card, other players' grid, and the reveal
 * confirm dialog arrive in M4–M5. Exit smoke-tests the modal channel.
 */
const GamePage = ({ params }: GamePageProps) => {
  const { code } = use(params);
  const router = useRouter();
  const t = useTranslations('game');
  const upperCode = code.toUpperCase();

  const handleExit = async () => {
    const ok = await confirm({
      title: t('exitConfirm'),
      message: t('exitConfirmHint'),
      confirmLabel: t('exit'),
      confirmColor: 'error',
    });
    if (!ok) return;
    router.push('/home');
  };

  return (
    <PageShell
      appBar={{ title: `${t('title')} ${upperCode}` }}
      footer={
        <GlassButton glassVariant="danger" sx={{ py: 1.3 }} onClick={handleExit}>
          {t('exit')}
        </GlassButton>
      }
      maxContentWidth={720}
    >
      <Stack spacing={2} sx={{ pt: 3 }}>
        <GlassCard sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ fontSize: '0.95rem', color: 'rgba(0,0,0,0.6)' }}>
            {t('comingSoonNote')}
          </Typography>
        </GlassCard>
      </Stack>
    </PageShell>
  );
};

export default GamePage;
