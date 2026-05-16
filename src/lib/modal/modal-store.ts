'use client';

import { create } from 'zustand';
import type {
  AlertOptions,
  ConfirmOptions,
  ModalState,
  PromptOptions,
} from './types';

type OpenState = Exclude<ModalState, { kind: 'closed' }>;

interface ModalStore {
  state: ModalState;
  show: (next: OpenState) => void;
  close: () => void;
}

/**
 * Single source of truth for the globally mounted modal layer.
 * Components should not consume this directly — use the `confirm`,
 * `alertModal`, and `prompt` helpers below, which return Promises.
 */
export const useModalStore = create<ModalStore>((set) => ({
  state: { kind: 'closed' },
  show: (next) => set({ state: next }),
  close: () => set({ state: { kind: 'closed' } }),
}));

/**
 * Imperative confirm modal — resolves to true if the user confirms,
 * false if they cancel or dismiss.
 */
export const confirm = (options: ConfirmOptions): Promise<boolean> =>
  new Promise((resolve) => {
    useModalStore.getState().show({
      kind: 'confirm',
      options,
      resolve: (value) => {
        useModalStore.getState().close();
        resolve(value);
      },
    });
  });

/** Imperative alert modal — resolves when the user acknowledges. */
export const alertModal = (options: AlertOptions): Promise<void> =>
  new Promise((resolve) => {
    useModalStore.getState().show({
      kind: 'alert',
      options,
      resolve: () => {
        useModalStore.getState().close();
        resolve();
      },
    });
  });

/**
 * Imperative prompt modal — resolves to the entered string,
 * or null if the user cancels.
 */
export const prompt = (options: PromptOptions): Promise<string | null> =>
  new Promise((resolve) => {
    useModalStore.getState().show({
      kind: 'prompt',
      options,
      resolve: (value) => {
        useModalStore.getState().close();
        resolve(value);
      },
    });
  });
