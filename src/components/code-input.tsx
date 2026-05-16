'use client';

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
import { Box } from '@mui/material';
import { glass } from '@/theme/tokens';

interface CodeInputProps {
  /** Number of letter slots. Defaults to 4 to match room-code length. */
  length?: number;
  value: string;
  onChange: (next: string) => void;
  /** Called when every slot is filled — convenient for auto-submit. */
  onComplete?: (value: string) => void;
  /** Visual error state (e.g. "room not found"). */
  error?: boolean;
  /** Auto-focus the first empty slot on mount. */
  autoFocus?: boolean;
}

export interface CodeInputHandle {
  focus: () => void;
}

const sanitiseChar = (raw: string): string => raw.toUpperCase().replace(/[^A-Z]/g, '');

/**
 * PIN-style 4-slot code input.
 *
 * Each slot is a single-character field with auto-advance on type,
 * backspace-to-previous, paste-to-fill-all, and uppercase A–Z coercion.
 * The visual style matches the glass primitives. Large per-slot type
 * makes the room code legible at arm's length on phones.
 */
const CodeInput = forwardRef<CodeInputHandle, CodeInputProps>(
  ({ length = 4, value, onChange, onComplete, error, autoFocus }, ref) => {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const padded = useMemo(() => value.padEnd(length, ' ').slice(0, length), [value, length]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        const firstEmpty = value.length < length ? value.length : 0;
        inputsRef.current[firstEmpty]?.focus();
      },
    }));

    const emitChange = useCallback(
      (next: string) => {
        onChange(next);
        if (next.length === length) onComplete?.(next);
      },
      [length, onChange, onComplete],
    );

    const handleSlotChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const ch = sanitiseChar(raw).slice(-1);

      if (!ch) {
        const trimmed = value.slice(0, index);
        emitChange(trimmed);
        return;
      }

      const chars = value.padEnd(length, ' ').split('');
      chars[index] = ch;
      const next = chars.join('').replace(/\s+$/, '');
      emitChange(next);

      if (index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    };

    const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Backspace' && !padded[index]?.trim()) {
        if (index > 0) {
          inputsRef.current[index - 1]?.focus();
          const trimmed = value.slice(0, Math.max(0, index - 1));
          emitChange(trimmed);
          event.preventDefault();
        }
        return;
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        inputsRef.current[index - 1]?.focus();
        event.preventDefault();
        return;
      }
      if (event.key === 'ArrowRight' && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
        event.preventDefault();
      }
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
      const pasted = sanitiseChar(event.clipboardData.getData('text')).slice(0, length);
      if (!pasted) return;
      event.preventDefault();
      emitChange(pasted);
      const focusIndex = Math.min(pasted.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
    };

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${length}, 1fr)`,
          gap: 1.25,
          width: '100%',
        }}
      >
        {Array.from({ length }).map((_, index) => {
          const slotChar = padded[index]?.trim() ?? '';
          return (
            <Box
              key={index}
              component="input"
              ref={(node: HTMLInputElement | null) => {
                inputsRef.current[index] = node;
              }}
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="one-time-code"
              autoCorrect="off"
              spellCheck={false}
              maxLength={1}
              value={slotChar}
              autoFocus={autoFocus && index === 0}
              onChange={handleSlotChange(index)}
              onKeyDown={handleKeyDown(index)}
              onPaste={handlePaste}
              onFocus={(event) => event.currentTarget.select()}
              aria-label={`Slot ${index + 1}`}
              sx={{
                width: '100%',
                aspectRatio: '1 / 1.15',
                textAlign: 'center',
                fontSize: { xs: '2rem', sm: '2.4rem' },
                fontWeight: 700,
                fontFamily: 'inherit',
                letterSpacing: 0,
                color: 'rgba(0,0,0,0.88)',
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${error ? 'rgba(255,59,48,0.55)' : 'rgba(255,255,255,0.7)'}`,
                borderRadius: glass.radius,
                outline: 'none',
                caretColor: 'rgba(0,122,255,0.9)',
                transition: glass.transition,
                '&:focus': {
                  borderColor: error ? 'rgba(255,59,48,0.85)' : 'rgba(0,122,255,0.85)',
                  background: 'rgba(255,255,255,0.78)',
                  boxShadow: error
                    ? '0 0 0 4px rgba(255,59,48,0.18)'
                    : '0 0 0 4px rgba(0,122,255,0.18)',
                },
              }}
            />
          );
        })}
      </Box>
    );
  },
);
CodeInput.displayName = 'CodeInput';

export default CodeInput;
