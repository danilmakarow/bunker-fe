'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Stack, Typography } from '@mui/material';
import PageShell from '@/components/page-shell';
import { GlassButton } from '@/components/glass';
import CodeInput from '@/components/code-input';
import { useJoinRoom } from '@/use-cases/use-join-room';
import { notify } from '@/components/notify';
import { errorMessageKey } from '@/adapters/error-message';

const ROOM_CODE_LENGTH = 4;

/**
 * Join-by-code form. POSTs to /rooms/:code/join via {@link useJoinRoom},
 * seeds the snapshot cache from the response, then navigates to the lobby.
 * BE error envelopes are translated to friendly Ukrainian via
 * {@link errorMessageKey}.
 */
const JoinForm = () => {
  const router = useRouter();
  const t = useTranslations('join');
  const tErrors = useTranslations('errors');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const joinRoom = useJoinRoom();
  const isComplete = code.length === ROOM_CODE_LENGTH;

  const submit = useCallback(
    async (value: string) => {
      if (value.length !== ROOM_CODE_LENGTH) return;
      setErrorMessage(null);
      try {
        const snapshot = await joinRoom.mutateAsync({ code: value });
        router.push(`/room/${snapshot.code}`);
      } catch (error) {
        const message = tErrors(errorMessageKey(error));
        setErrorMessage(message);
        notify.error(message);
      }
    },
    [joinRoom, router, tErrors],
  );

  return (
    <PageShell
      appBar={{ title: t('title'), back: { href: '/home' } }}
      footer={
        <GlassButton
          glassVariant="primary"
          sx={{ py: 1.5 }}
          disabled={!isComplete || joinRoom.isPending}
          loading={joinRoom.isPending}
          onClick={() => submit(code)}
        >
          {joinRoom.isPending ? t('joining') : t('submit')}
        </GlassButton>
      }
    >
      <Stack spacing={3.5} sx={{ alignItems: 'stretch', pt: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            component="h2"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'rgba(0,0,0,0.88)',
              letterSpacing: '-0.02em',
              mb: 0.75,
            }}
          >
            {t('heading')}
          </Typography>
          <Typography sx={{ fontSize: '0.95rem', color: 'rgba(0,0,0,0.55)' }}>
            {t('subheading')}
          </Typography>
        </Box>

        <CodeInput
          autoFocus
          length={ROOM_CODE_LENGTH}
          value={code}
          onChange={(next) => {
            setCode(next);
            if (errorMessage) setErrorMessage(null);
          }}
          onComplete={submit}
          error={Boolean(errorMessage)}
        />

        {errorMessage && (
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: 'rgba(255,59,48,0.95)',
              textAlign: 'center',
            }}
          >
            {errorMessage}
          </Typography>
        )}
      </Stack>
    </PageShell>
  );
};

export default JoinForm;
