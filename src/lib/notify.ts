'use client';

import { toast } from 'sonner';
import type { ReactNode } from 'react';

/**
 * Thin wrapper over sonner's toast API.
 * Centralises the channel so future re-skinning (icon set, default
 * duration, position) happens in one place.
 */
export const notify = {
  /** Neutral informational toast. */
  info: (message: ReactNode) => toast(message),
  /** Successful action toast. */
  success: (message: ReactNode) => toast.success(message),
  /** Recoverable failure toast. */
  error: (message: ReactNode) => toast.error(message),
  /** Soft warning toast. */
  warning: (message: ReactNode) => toast.warning(message),
};
