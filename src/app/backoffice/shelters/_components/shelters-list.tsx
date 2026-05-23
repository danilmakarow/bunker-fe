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
import type { BackofficeShelter, Polarity } from '@/entities';
import {
  useBackofficeShelters,
  useCreateShelter,
  useDeleteShelter,
  useUpdateShelter,
} from '@/use-cases/use-backoffice';
import ContentRowCard from '../../_components/content-row-card';
import CreateToggle from '../../_components/create-toggle';
import PolaritySelect from '../../_components/polarity-select';

interface ShelterFormState {
  areaUk: string;
  locationUk: string;
  durationUk: string;
  equipmentUk: string;
  suppliesUk: string;
  polarity: Polarity;
}

const EMPTY_FORM: ShelterFormState = {
  areaUk: '',
  locationUk: '',
  durationUk: '',
  equipmentUk: '',
  suppliesUk: '',
  polarity: 'NEUTRAL',
};

const toForm = (row: BackofficeShelter): ShelterFormState => ({
  areaUk: row.areaUk,
  locationUk: row.locationUk,
  durationUk: row.durationUk,
  equipmentUk: row.equipmentUk,
  suppliesUk: row.suppliesUk,
  polarity: row.polarity,
});

interface ShelterEditFormProps {
  initial: ShelterFormState;
  busy: boolean;
  submitLabel: string;
  onSubmit: (form: ShelterFormState) => void;
}

const ShelterEditForm = ({
  initial,
  busy,
  submitLabel,
  onSubmit,
}: ShelterEditFormProps) => {
  const t = useTranslations('backoffice.shelters');
  const [form, setForm] = useState<ShelterFormState>(initial);

  const canSubmit = (
    [
      form.areaUk,
      form.locationUk,
      form.durationUk,
      form.equipmentUk,
      form.suppliesUk,
    ] as const
  ).every((field) => field.trim().length > 0);

  return (
    <Stack spacing={1.5}>
      <GlassTextInput
        label={t('areaUk')}
        value={form.areaUk}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, areaUk: event.target.value }))
        }
      />
      <GlassTextInput
        label={t('locationUk')}
        value={form.locationUk}
        multiline
        minRows={2}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, locationUk: event.target.value }))
        }
      />
      <GlassTextInput
        label={t('durationUk')}
        value={form.durationUk}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, durationUk: event.target.value }))
        }
      />
      <GlassTextInput
        label={t('equipmentUk')}
        value={form.equipmentUk}
        multiline
        minRows={2}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, equipmentUk: event.target.value }))
        }
      />
      <GlassTextInput
        label={t('suppliesUk')}
        value={form.suppliesUk}
        multiline
        minRows={2}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, suppliesUk: event.target.value }))
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

const SheltersList = () => {
  const tCommon = useTranslations('backoffice.common');
  const tPolarity = useTranslations('game.polarity');
  const tErrors = useTranslations('errors');
  const { data, isLoading, error } = useBackofficeShelters();
  const create = useCreateShelter();
  const update = useUpdateShelter();
  const remove = useDeleteShelter();

  if (isLoading) return <GlassSpinner />;
  if (error) {
    return (
      <GlassAlert severity="error">{tErrors(errorMessageKey(error))}</GlassAlert>
    );
  }

  const rows = data ?? [];
  const enabledCount = rows.filter((row) => row.enabled).length;

  const handleCreate = async (form: ShelterFormState, close: () => void) => {
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
    body: Partial<BackofficeShelter>,
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
          <ShelterEditForm
            initial={EMPTY_FORM}
            busy={create.isPending}
            submitLabel={
              create.isPending ? tCommon('creating') : tCommon('create')
            }
            onSubmit={(form) => handleCreate(form, close)}
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
              title={row.locationUk}
              subtitle={`${tPolarity(row.polarity)} · ${row.areaUk} · ${row.durationUk}`}
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
                <ShelterEditForm
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

export default SheltersList;
