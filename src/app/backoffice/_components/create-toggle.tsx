'use client';

import { useState, type ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Plus, X } from 'lucide-react';
import { GlassButton, GlassCard, GlassDivider } from '@/components/glass';

interface CreateToggleProps {
  /** Render the entity-specific create form here. */
  children: (close: () => void) => ReactNode;
}

/**
 * "Add new" trigger that expands into an inline create form. Every backoffice
 * list page uses it at the top of the page; collapsed by default so the list
 * stays compact.
 */
const CreateToggle = ({ children }: CreateToggleProps) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('backoffice.common');

  if (!open) {
    return (
      <GlassButton
        glassVariant="secondary"
        sx={{ py: 1.1, fontSize: '0.9rem', alignSelf: 'flex-start' }}
        onClick={() => setOpen(true)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Plus size={16} strokeWidth={2.5} />
          {t('create')}
        </Box>
      </GlassButton>
    );
  }

  return (
    <GlassCard sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <GlassButton
            glassVariant="ghost"
            sx={{ minWidth: 0, p: 0.6, minHeight: 0 }}
            onClick={() => setOpen(false)}
          >
            <X size={18} strokeWidth={2.5} />
          </GlassButton>
        </Box>
        <GlassDivider sx={{ my: 0 }} />
        {children(() => setOpen(false))}
      </Stack>
    </GlassCard>
  );
};

export default CreateToggle;
