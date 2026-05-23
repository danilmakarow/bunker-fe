'use client';

import { useMemo, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  GlassAlert,
  GlassButton,
  GlassFieldGroup,
  GlassSelect,
  GlassSpinner,
  GlassTextInput,
} from '@/components/glass';
import { notify } from '@/components/notify';
import { errorMessageKey } from '@/adapters/error-message';
import type { BackofficeTrait, Polarity, TraitKind } from '@/entities';
import {
  useBackofficeTraits,
  useCreateTrait,
  useDeleteTrait,
  useUpdateTrait,
} from '@/use-cases/use-backoffice';
import { TRAIT_KIND_ORDER } from '@/entities/attributes';
import ContentRowCard from '../../_components/content-row-card';
import CreateToggle from '../../_components/create-toggle';
import PolaritySelect from '../../_components/polarity-select';

interface TraitFormState {
  kind: TraitKind;
  polarity: Polarity;
  titleUk: string;
  descriptionUk: string;
}

const EMPTY_FORM: TraitFormState = {
  kind: 'HEALTH',
  polarity: 'NEUTRAL',
  titleUk: '',
  descriptionUk: '',
};

const toForm = (row: BackofficeTrait): TraitFormState => ({
  kind: row.kind,
  polarity: row.polarity,
  titleUk: row.titleUk,
  descriptionUk: row.descriptionUk ?? '',
});

interface TraitEditFormProps {
  initial: TraitFormState;
  busy: boolean;
  submitLabel: string;
  onSubmit: (form: TraitFormState) => void;
}

const TraitEditForm = ({
  initial,
  busy,
  submitLabel,
  onSubmit,
}: TraitEditFormProps) => {
  const t = useTranslations('backoffice.traits');
  const tCommon = useTranslations('backoffice.common');
  const tKind = useTranslations('game.kind');
  const [form, setForm] = useState<TraitFormState>(initial);

  const canSubmit = form.titleUk.trim().length > 0;

  return (
    <Stack spacing={1.5}>
      <GlassFieldGroup>
        <GlassSelect
          label={tCommon('kind')}
          value={form.kind}
          options={TRAIT_KIND_ORDER.map((kind) => ({
            value: kind,
            label: tKind(kind),
          }))}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, kind: event.target.value as TraitKind }))
          }
        />
      </GlassFieldGroup>
      <GlassTextInput
        label={t('titleUk')}
        value={form.titleUk}
        onChange={(event) =>
          setForm((prev) => ({ ...prev, titleUk: event.target.value }))
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

const FILTER_ALL = 'ALL' as const;

const TraitsList = () => {
  const tCommon = useTranslations('backoffice.common');
  const tTraits = useTranslations('backoffice.traits');
  const tKind = useTranslations('game.kind');
  const tPolarity = useTranslations('game.polarity');
  const tErrors = useTranslations('errors');
  const { data, isLoading, error } = useBackofficeTraits();
  const create = useCreateTrait();
  const update = useUpdateTrait();
  const remove = useDeleteTrait();
  const [filterKind, setFilterKind] = useState<TraitKind | typeof FILTER_ALL>(
    FILTER_ALL,
  );

  const filtered = useMemo(() => {
    const rows = data ?? [];
    if (filterKind === FILTER_ALL) return rows;
    return rows.filter((row) => row.kind === filterKind);
  }, [data, filterKind]);

  if (isLoading) return <GlassSpinner />;
  if (error) {
    return (
      <GlassAlert severity="error">{tErrors(errorMessageKey(error))}</GlassAlert>
    );
  }

  const enabledCount = filtered.filter((row) => row.enabled).length;

  const handleCreate = async (form: TraitFormState, close: () => void) => {
    try {
      await create.mutateAsync({
        ...form,
        descriptionUk: form.descriptionUk.trim() ? form.descriptionUk : null,
      });
      notify.success(tCommon('created'));
      close();
    } catch (mutationError) {
      notify.error(tErrors(errorMessageKey(mutationError)));
    }
  };

  const handleUpdate = async (id: string, body: Partial<BackofficeTrait>) => {
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
          <TraitEditForm
            initial={EMPTY_FORM}
            busy={create.isPending}
            submitLabel={
              create.isPending ? tCommon('creating') : tCommon('create')
            }
            onSubmit={(form) => handleCreate(form, close)}
          />
        )}
      </CreateToggle>

      <GlassFieldGroup>
        <GlassSelect
          label={tTraits('filterKind')}
          value={filterKind}
          options={[
            { value: FILTER_ALL, label: tTraits('filterAll') },
            ...TRAIT_KIND_ORDER.map((kind) => ({
              value: kind,
              label: tKind(kind),
            })),
          ]}
          onChange={(event) =>
            setFilterKind(event.target.value as TraitKind | typeof FILTER_ALL)
          }
        />
      </GlassFieldGroup>

      <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>
        {tCommon('rowsEnabled', {
          enabled: enabledCount,
          total: filtered.length,
        })}
      </Typography>

      {filtered.length === 0 ? (
        <Typography
          sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}
        >
          {tCommon('empty')}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {filtered.map((row) => (
            <ContentRowCard
              key={row.id}
              title={row.titleUk}
              subtitle={`${tKind(row.kind)} · ${tPolarity(row.polarity)}`}
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
                <TraitEditForm
                  initial={toForm(row)}
                  busy={update.isPending}
                  submitLabel={
                    update.isPending ? tCommon('saving') : tCommon('save')
                  }
                  onSubmit={(form) =>
                    handleUpdate(row.id, {
                      ...form,
                      descriptionUk: form.descriptionUk.trim()
                        ? form.descriptionUk
                        : null,
                    })
                  }
                />
              }
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default TraitsList;
