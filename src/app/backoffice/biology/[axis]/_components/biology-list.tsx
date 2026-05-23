'use client';

import { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  GlassAlert,
  GlassButton,
  GlassSpinner,
  GlassTextInput,
} from '@/components/glass';
import { notify } from '@/components/notify';
import { errorMessageKey } from '@/adapters/error-message';
import type {
  BackofficeBiologyRow,
  BiologyAxisSlug,
} from '@/entities';
import {
  useBackofficeBiology,
  useCreateBiology,
  useDeleteBiology,
  useUpdateBiology,
} from '@/use-cases/use-backoffice';
import ContentRowCard from '../../../_components/content-row-card';
import CreateToggle from '../../../_components/create-toggle';

interface BiologyListProps {
  axis: BiologyAxisSlug;
}

interface BiologyFormProps {
  initial: string;
  busy: boolean;
  submitLabel: string;
  onSubmit: (valueUk: string) => void;
}

const BiologyForm = ({
  initial,
  busy,
  submitLabel,
  onSubmit,
}: BiologyFormProps) => {
  const t = useTranslations('backoffice.biology');
  const [value, setValue] = useState(initial);

  return (
    <Stack spacing={1.5}>
      <GlassTextInput
        label={t('valueUk')}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <GlassButton
        glassVariant="primary"
        sx={{ py: 1, fontSize: '0.9rem' }}
        disabled={!value.trim() || busy}
        loading={busy}
        onClick={() => onSubmit(value.trim())}
      >
        {submitLabel}
      </GlassButton>
    </Stack>
  );
};

const BiologyList = ({ axis }: BiologyListProps) => {
  const tCommon = useTranslations('backoffice.common');
  const tErrors = useTranslations('errors');
  const { data, isLoading, error } = useBackofficeBiology(axis);
  const create = useCreateBiology(axis);
  const update = useUpdateBiology(axis);
  const remove = useDeleteBiology(axis);

  if (isLoading) return <GlassSpinner />;
  if (error) {
    return (
      <GlassAlert severity="error">{tErrors(errorMessageKey(error))}</GlassAlert>
    );
  }

  const rows = data ?? [];
  const enabledCount = rows.filter((row) => row.enabled).length;

  const handleCreate = async (valueUk: string, close: () => void) => {
    try {
      await create.mutateAsync({ valueUk });
      notify.success(tCommon('created'));
      close();
    } catch (mutationError) {
      notify.error(tErrors(errorMessageKey(mutationError)));
    }
  };

  const handleUpdate = async (
    id: string,
    body: Partial<BackofficeBiologyRow>,
  ) => {
    try {
      await update.mutateAsync({ id, body });
      notify.success(tCommon('saved'));
    } catch (mutationError) {
      notify.error(tErrors(errorMessageKey(mutationError)));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      notify.success(tCommon('deleted'));
    } catch (mutationError) {
      notify.error(tErrors(errorMessageKey(mutationError)));
    }
  };

  return (
    <Stack spacing={2}>
      <CreateToggle>
        {(close) => (
          <BiologyForm
            initial=""
            busy={create.isPending}
            submitLabel={
              create.isPending ? tCommon('creating') : tCommon('create')
            }
            onSubmit={(valueUk) => handleCreate(valueUk, close)}
          />
        )}
      </CreateToggle>

      <Typography sx={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.55)' }}>
        {tCommon('rowsEnabled', {
          enabled: enabledCount,
          total: rows.length,
        })}
      </Typography>

      {rows.length === 0 ? (
        <Typography
          sx={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.55)', textAlign: 'center' }}
        >
          {tCommon('empty')}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {rows.map((row) => (
            <ContentRowCard
              key={row.id}
              title={row.valueUk}
              enabled={row.enabled}
              weight={row.weight}
              onToggleEnabled={(next) =>
                handleUpdate(row.id, { enabled: next })
              }
              onWeightChange={(next) =>
                handleUpdate(row.id, { weight: next })
              }
              onDelete={() => handleDelete(row.id)}
              busy={update.isPending || remove.isPending}
              editForm={
                <BiologyForm
                  initial={row.valueUk}
                  busy={update.isPending}
                  submitLabel={
                    update.isPending ? tCommon('saving') : tCommon('save')
                  }
                  onSubmit={(valueUk) => handleUpdate(row.id, { valueUk })}
                />
              }
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default BiologyList;
