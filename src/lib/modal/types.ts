import type { ReactNode } from 'react';

/** Visual tint for a modal's primary action button. */
export type ConfirmColor = 'primary' | 'error';

export interface ConfirmOptions {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: ConfirmColor;
}

export interface AlertOptions {
  title: string;
  message?: ReactNode;
  okLabel?: string;
}

export interface PromptOptions {
  title: string;
  message?: ReactNode;
  inputLabel?: string;
  inputDefaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Discriminated union of every modal kind the app can render.
 * Adding a new modal kind = extend this union + handle it in ModalRoot.
 */
export type ModalState =
  | { kind: 'closed' }
  | { kind: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { kind: 'alert'; options: AlertOptions; resolve: () => void }
  | {
      kind: 'prompt';
      options: PromptOptions;
      resolve: (value: string | null) => void;
    };
