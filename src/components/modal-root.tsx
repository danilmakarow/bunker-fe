'use client';

import { useTranslations } from 'next-intl';
import LiquidModal from './liquid-modal';
import { useModalStore } from '@/lib/modal/modal-store';
import type {
  AlertOptions,
  ConfirmOptions,
  PromptOptions,
} from '@/lib/modal/types';

interface ConfirmModalProps {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

const ConfirmModal = ({ options, resolve }: ConfirmModalProps) => {
  const t = useTranslations('modal');
  return (
    <LiquidModal
      open
      title={options.title}
      message={options.message}
      confirmLabel={options.confirmLabel ?? t('confirm')}
      cancelLabel={options.cancelLabel ?? t('cancel')}
      confirmColor={options.confirmColor ?? 'primary'}
      onConfirm={() => resolve(true)}
      onCancel={() => resolve(false)}
    />
  );
};

interface AlertModalProps {
  options: AlertOptions;
  resolve: () => void;
}

const AlertModal = ({ options, resolve }: AlertModalProps) => {
  const t = useTranslations('modal');
  return (
    <LiquidModal
      open
      title={options.title}
      message={options.message}
      confirmLabel={options.okLabel ?? t('ok')}
      hideCancel
      onConfirm={() => resolve()}
      onCancel={() => resolve()}
    />
  );
};

interface PromptModalProps {
  options: PromptOptions;
  resolve: (value: string | null) => void;
}

const PromptModal = ({ options, resolve }: PromptModalProps) => {
  const t = useTranslations('modal');
  return (
    <LiquidModal
      open
      showInput
      title={options.title}
      message={options.message}
      inputLabel={options.inputLabel}
      inputDefaultValue={options.inputDefaultValue}
      inputPlaceholder={options.placeholder}
      confirmLabel={options.confirmLabel ?? t('confirm')}
      cancelLabel={options.cancelLabel ?? t('cancel')}
      onConfirm={(value) => resolve(value ?? '')}
      onCancel={() => resolve(null)}
    />
  );
};

/**
 * Renders the currently active modal (if any) as dictated by `useModalStore`.
 * Mounted once in the root client providers. Per-kind subcomponents own their
 * own `useTranslations` call so the hook only runs when a modal is actually
 * mounted — avoids next-intl's ENVIRONMENT_FALLBACK during static prerender.
 */
const ModalRoot = () => {
  const state = useModalStore((store) => store.state);

  if (state.kind === 'closed') return null;
  if (state.kind === 'confirm') return <ConfirmModal options={state.options} resolve={state.resolve} />;
  if (state.kind === 'alert') return <AlertModal options={state.options} resolve={state.resolve} />;
  return <PromptModal options={state.options} resolve={state.resolve} />;
};

export default ModalRoot;
