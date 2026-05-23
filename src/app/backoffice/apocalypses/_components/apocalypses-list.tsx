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
import type { BackofficeApocalypse, Polarity } from '@/entities';
import {
  useBackofficeApocalypses,
  useCreateApocalypse,
  useDeleteApocalypse,
  useUpdateApocalypse,
} from '@/use-cases/use-backoffice';
import ContentRowCard from '../../_components/content-row-card';
import CreateToggle from '../../_components/create-toggle';
import PolaritySelect from '../../_components/polarity-select';

interface ApocalypseFormState {
  nameUk: string;
  descriptionUk: string;
  populationRemainderUk: string;
  polarity: Polarity;
}

const EMPTY_FORM: ApocalypseFormState = {
  nameUk: '',
  descriptionUk: '',
  populationRemainderUk: '',
  polarity: 'NEUTRAL',
};

const toForm = (row: BackofficeApocalypse): ApocalypseFormState => ({
  nameUk: row.nameUk,
  descriptionUk: row.descriptionUk,
  populationRemainderUk: row.populationRemainderUk,
  polarity: row.polarity,
});

interface ApocalypseEditFormProps {
  initial: ApocalypseFormState;
  busy: boolean;
  submitLabel: string;
  onSubmit: (form: ApocalypseFormState) => void;
}

const ApocalypseEditForm = ({
  initial,
  busy,
  submitLabel,
  onSubmit,
}: ApocalypseEditFormProps) => {
  const t = useTranslations('backoffice.apocalypses');
  const [form, setForm] = useState<ApocalypseFormState>(initial);

  const canSubmit =
    form.nameUk.trim() &&
    form.descriptionUk.trim() &&
    form.populationRemainderUk.trim();

  return (
    <Stack spacing={1.5}>
      <GlassTextInput
        label={t('nameUk')}
        value={form.nameUk}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, nameUk: event.target.value }))
        }
      />
      <GlassTextInput
        label={t('descriptionUk')}
        value={form.descriptionUk}
        multiline
        minRows={2}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, descriptionUk: event.target.value }))
        }
      />
      <GlassTextInput
        label={t('populationRemainderUk')}
        value={form.populationRemainderUk}
        onChange={(event) =>
          setForm((prev) => ({
            ...prev,
            populationRemainderUk: event.target.value,
          }))
        }
      />
      <PolaritySelect
        value={form.polarity}
        onChange={(polarity) => setForm((prev) => ({ ...prev, polarity }))}
      />
      <GlassButton
        glassVariant="primary"
        sx={{ py: 1, fontSize: '0.9rem' }}
        disabled={!canSubmit || busy}
        loading={busy}
        onClick={() => onSubmit(form)}
      >
        {submitLabel}
      </GlassButton>
    </Stack>
  );
};

const ApocalypsesList = () => {
  const tCommon = useTranslations('backoffice.common');
  const tPolarity = useTranslations('game.polarity');
  const tErrors = useTranslations('errors');
  const { data, isLoading, error } = useBackofficeApocalypses();
  const create = useCreateApocalypse();
  const update = useUpdateApocalypse();
  const remove = useDeleteApocalypse();

  if (isLoading) return <GlassSpinner />;
  if (error) {
    return (
      <GlassAlert severity="error">{tErrors(errorMessageKey(error))}</GlassAlert>
    );
  }

  const rows = data ?? [];
  const enabledCount = rows.filter((row) => row.enabled).length;

  const handleCreate = async (form: ApocalypseFormState, close: () => void) => {
    try {
      await create.mutateAsync(form);
      notify.success(tCommon('created'));
      close();
    } catch (mutationError) {
      notify.error(tErrors(errorMessageKey(mutationError)));
    }
  };

  const handleUpdate = async (
    id: string,
    body: Partial<BackofficeApocalypse>,
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
          <ApocalypseEditForm
            initial={EMPTY_FORM}
            busy={create.isPending}
            submitLabel={
              create.isPending ? tCommon('creating') : tCommon('create')
            }
            onSubmit={(form) => handleCreate(form, close)}
          />
        )}
      </CreateToggle>

      <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>
        {tCommon('rowsEnabled', {
          enabled: enabledCount,
          total: rows.length,
        })}
      </Typography>

      {rows.length === 0 ? (
        <Typography
          sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}
        >
          {tCommon('empty')}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {rows.map((row) => (
            <ContentRowCard
              key={row.id}
              title={row.nameUk}
              subtitle={`${tPolarity(row.polarity)} · ${row.populationRemainderUk}`}
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
                <ApocalypseEditForm
                  initial={toForm(row)}
                  busy={update.isPending}
                  submitLabel={
                    update.isPending ? tCommon('saving') : tCommon('save')
                  }
                  onSubmit={(form) => handleUpdate(row.id, form)}
                />
              }
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default ApocalypsesList;
