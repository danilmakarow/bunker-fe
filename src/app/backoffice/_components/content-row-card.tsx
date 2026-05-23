'use client';

import { useState, type ReactNode } from 'react';
import { Box, Stack, Switch, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import {
  GlassButton,
  GlassCard,
  GlassDivider,
  GlassTextInput,
} from '@/components/glass';
import { confirm } from '@/components/modal/modal-store';

interface ContentRowCardProps {
  /** Title shown at the top of the card (e.g. apocalypse name). */
  title: ReactNode;
  /** Optional subtitle below the title (e.g. trait kind / polarity). */
  subtitle?: ReactNode;
  enabled: boolean;
  weight: number;
  onToggleEnabled: (next: boolean) => void;
  onWeightChange: (next: number) => void;
  onDelete: () => void;
  /** Body rendered inside the expandable edit area. */
  editForm: ReactNode;
  busy?: boolean;
}

/**
 * Card layout shared by every backoffice list page. Always shows:
 *   - title + subtitle line
 *   - enabled toggle row
 *   - weight stepper row
 *   - expand/collapse edit form
 *   - delete button
 *
 * Entity-specific fields slot into `editForm`.
 */
const ContentRowCard = ({
  title,
  subtitle,
  enabled,
  weight,
  onToggleEnabled,
  onWeightChange,
  onDelete,
  editForm,
  busy = false,
}: ContentRowCardProps) => {
  const t = useTranslations('backoffice.common');
  const [expanded, setExpanded] = useState(false);

  const handleDelete = async () => {
    const ok = await confirm({
      title: t('deleteConfirm'),
      message: t('deleteConfirmHint'),
      confirmLabel: t('delete'),
      confirmColor: 'error',
    });

    if (ok) onDelete();
  };

  return (
    <GlassCard sx={{ p: 2, opacity: enabled ? 1 : 0.65 }}>
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.88)',
                letterSpacing: '-0.01em',
                wordBreak: 'break-word',
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.55)',
                  mt: 0.25,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>
              {enabled ? t('enabled') : t('disabled')}
            </Typography>
          </Box>
          <Switch
            checked={enabled}
            disabled={busy}
            onChange={(event) => onToggleEnabled(event.target.checked)}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>
            {t('weight')}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <GlassTextInput
            type="number"
            value={String(weight)}
            slotProps={{
              htmlInput: { min: 0, step: 1, style: { textAlign: 'right' } },
            }}
            onChange={(event) => {
              const parsed = parseInt(event.target.value, 10);
              if (Number.isFinite(parsed) && parsed >= 0) {
                onWeightChange(parsed);
              }
            }}
            disabled={busy}
            sx={{ maxWidth: 100 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <GlassButton
            glassVariant="ghost"
            sx={{
              flex: 1,
              py: 0.8,
              fontSize: '0.85rem',
              minHeight: 0,
              display: 'flex',
              gap: 0.5,
            }}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? (
              <ChevronUp size={16} strokeWidth={2.5} />
            ) : (
              <ChevronDown size={16} strokeWidth={2.5} />
            )}
            {t('edit')}
          </GlassButton>
          <GlassButton
            glassVariant="danger"
            sx={{
              py: 0.8,
              fontSize: '0.85rem',
              minHeight: 0,
              minWidth: 44,
            }}
            onClick={handleDelete}
            disabled={busy}
          >
            <Trash2 size={16} strokeWidth={2.5} />
          </GlassButton>
        </Box>

        {expanded && (
          <>
            <GlassDivider sx={{ my: 1 }} />
            {editForm}
          </>
        )}
      </Stack>
    </GlassCard>
  );
};

export default ContentRowCard;
