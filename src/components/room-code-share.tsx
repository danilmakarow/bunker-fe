'use client';

import { useCallback } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { Copy, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GlassButton, GlassCard, GlassLabel } from './glass';
import { notify } from '@/components/notify';

interface RoomCodeShareProps {
  code: string;
}

/**
 * Big room-code tiles + a primary "Share link" / secondary "Copy code"
 * action row. Share uses the native Web Share sheet when available
 * (mobile), with a clipboard fallback elsewhere.
 */
const RoomCodeShare = ({ code }: RoomCodeShareProps) => {
  const t = useTranslations('room');

  /** Best-effort clipboard write, with a textarea fallback for older browsers. */
  const writeToClipboard = useCallback(async (text: string): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Permission denied / non-secure context — fall through to legacy path.
      }
    }
    if (typeof document === 'undefined') return false;
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }, []);

  /** Absolute URL to the lobby route, safe for SSR pre-hydration. */
  const linkForCode = (): string => {
    if (typeof window === 'undefined') return `/room/${code}`;
    return `${window.location.origin}/room/${code}`;
  };

  const handleShareLink = async () => {
    const url = linkForCode();
    const title = t('title', { code });
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // AbortError = user dismissed the sheet; not a failure worth surfacing.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    const ok = await writeToClipboard(url);
    if (ok) notify.success(t('linkCopied'));
    else notify.error(t('copyFailed'));
  };

  const handleCopyCode = async () => {
    const ok = await writeToClipboard(code);
    if (ok) notify.success(t('codeCopied'));
    else notify.error(t('copyFailed'));
  };

  return (
    <GlassCard
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        py: 3,
      }}
    >
      <GlassLabel sx={{ mb: 0 }}>{t('title', { code: '' })}</GlassLabel>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {code.split('').map((char, index) => (
          <Box
            key={index}
            sx={{
              width: 52,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              fontWeight: 700,
              color: 'rgba(0,0,0,0.88)',
              background: 'rgba(255,255,255,0.5)',
              border: '0.5px solid rgba(255,255,255,0.7)',
              borderRadius: '14px',
            }}
          >
            {char}
          </Box>
        ))}
      </Box>
      <Typography
        sx={{
          mt: 0.5,
          fontSize: '0.78rem',
          color: 'rgba(0,0,0,0.5)',
          textAlign: 'center',
          maxWidth: 260,
          lineHeight: 1.4,
        }}
      >
        {t('shareHint')}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ width: '100%', mt: 1 }}>
        <GlassButton
          glassVariant="primary"
          sx={{ flex: 1, py: 1.1 }}
          onClick={handleShareLink}
          startIcon={<Share2 size={16} strokeWidth={2.2} />}
        >
          {t('shareLink')}
        </GlassButton>
        <GlassButton
          glassVariant="secondary"
          sx={{ flex: 1, py: 1.1 }}
          onClick={handleCopyCode}
          startIcon={<Copy size={16} strokeWidth={2.2} />}
        >
          {t('copyCode')}
        </GlassButton>
      </Stack>
    </GlassCard>
  );
};

export default RoomCodeShare;
