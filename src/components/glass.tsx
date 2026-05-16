'use client';

import {
  Box,
  Typography,
  TextField,
  Button,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  type BoxProps,
  type ButtonProps,
  type TypographyProps,
  type CheckboxProps,
  type FormControlLabelProps,
} from '@mui/material';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import {
  forwardRef,
  useState,
  useRef,
  type ReactNode,
  type InputHTMLAttributes,
  type ChangeEvent,
  type KeyboardEvent,
  Children,
  isValidElement,
  type MouseEvent,
} from 'react';
import { glass, layout } from '@/theme/tokens';

/* ─────────────────────────────────────────────
 *  GlassCard — main container panel
 * ───────────────────────────────────────────── */
/** Frosted-glass panel used as the primary content surface. */
export const GlassCard = ({ children, sx, ...rest }: BoxProps) => (
  <Box
    sx={{
      p: { xs: 2.5, sm: 3.5 },
      borderRadius: glass.radiusLg,
      background: glass.bg,
      backdropFilter: glass.blur,
      WebkitBackdropFilter: glass.blur,
      border: `0.5px solid ${glass.border}`,
      boxShadow: glass.shadowLg,
      transition: glass.transition,
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
);

/* ─────────────────────────────────────────────
 *  GlassFieldGroup — groups rows with dividers
 *  (like iOS Settings grouped cells)
 * ───────────────────────────────────────────── */
/** Vertical stack of rows separated by hairline dividers, iOS-Settings style. */
export const GlassFieldGroup = ({ children, sx, ...rest }: BoxProps) => {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <Box
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        ...sx,
      }}
      {...rest}
    >
      {items.map((child, index) => (
        <Box key={index}>
          {index > 0 && (
            <Box sx={{ mx: 1.5, height: '0.5px', background: 'rgba(0,0,0,0.07)' }} />
          )}
          {child}
        </Box>
      ))}
    </Box>
  );
};

/* ─────────────────────────────────────────────
 *  GlassInput — iOS Settings row style
 *  Label on the left, input value on the right
 * ───────────────────────────────────────────── */
interface GlassInputProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  readOnly?: boolean;
  dimmed?: boolean;
  error?: boolean;
  helperText?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
  type?: InputHTMLAttributes<HTMLInputElement>['type'];
}

/** Inline iOS-Settings row input: label left, value right-aligned. */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    { label, dimmed = false, error, helperText, readOnly, onChange, onBlur, onKeyDown, ...rest },
    ref,
  ) => (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          py: 1.2,
          opacity: dimmed ? 0.5 : 1,
          transition: glass.transition,
        }}
      >
        {label && (
          <Typography
            component="label"
            sx={{
              fontSize: '0.9rem',
              fontWeight: 400,
              color: 'rgba(0,0,0,0.85)',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              minWidth: 80,
            }}
          >
            {label}
          </Typography>
        )}
        <Box
          component="input"
          ref={ref}
          readOnly={readOnly}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          sx={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            fontWeight: 400,
            color: 'rgba(0,0,0,0.7)',
            textAlign: 'right',
            py: 0,
            px: 0,
            '&::placeholder': { color: 'rgba(0,0,0,0.22)' },
            '&:read-only': { cursor: 'default' },
          }}
          {...rest}
        />
      </Box>
      {helperText && (
        <Typography
          sx={{
            fontSize: '0.7rem',
            color: error ? 'rgba(255,59,48,0.8)' : 'rgba(0,0,0,0.3)',
            px: 1.5,
            pb: 0.5,
            mt: -0.3,
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  ),
);
GlassInput.displayName = 'GlassInput';

/* ─────────────────────────────────────────────
 *  GlassTextInput — traditional centered input
 *  (for modals, search bars, standalone fields)
 * ───────────────────────────────────────────── */
interface GlassTextInputProps {
  label?: string;
  value?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}

/** Traditional centered MUI text input styled to match the glass aesthetic. */
export const GlassTextInput = forwardRef<HTMLDivElement, GlassTextInputProps>(
  ({ label, ...rest }, ref) => (
    <TextField
      ref={ref}
      fullWidth
      size="small"
      label={label}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '12px',
          backgroundColor: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          fontSize: '0.9rem',
          transition: glass.transition,
          '& fieldset': { borderColor: 'rgba(255,255,255,0.5)', borderWidth: 0.5 },
          '&:hover': {
            backgroundColor: glass.bgHover,
            '& fieldset': { borderColor: glass.borderHover },
          },
          '&.Mui-focused': {
            backgroundColor: glass.bgFocus,
            '& fieldset': { borderColor: 'rgba(0,122,255,0.5)', borderWidth: 1 },
          },
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.85rem',
          fontWeight: 500,
          color: 'rgba(0,0,0,0.48)',
          '&.Mui-focused': { color: 'rgba(0,122,255,0.85)' },
        },
      }}
      {...rest}
    />
  ),
);
GlassTextInput.displayName = 'GlassTextInput';

/* ─────────────────────────────────────────────
 *  GlassSelect — Apple-style inline row select
 *  Label left, value + chevron right
 * ───────────────────────────────────────────── */
interface GlassSelectOption {
  value: string | number;
  label: string;
  italic?: boolean;
}

interface GlassSelectProps {
  label?: string;
  value?: string | number;
  options: GlassSelectOption[];
  onChange?: (event: { target: { value: string | number } }) => void;
}

/** Inline row select rendered as a clickable row with a popover menu. */
export const GlassSelect = ({ label, value, options, onChange }: GlassSelectProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const open = Boolean(anchorEl);

  const selectedOption = options.find((option) => option.value === value);
  const displayLabel = selectedOption?.label ?? '';

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSelect = (optionValue: string | number) => {
    onChange?.({ target: { value: optionValue } });
    setAnchorEl(null);
  };

  return (
    <>
      <Box
        ref={rowRef}
        onClick={handleOpen}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          py: 1.2,
          cursor: 'pointer',
          transition: glass.transition,
          '&:active': { opacity: 0.7 },
        }}
      >
        {label && (
          <Typography
            sx={{
              fontSize: '0.9rem',
              fontWeight: 400,
              color: 'rgba(0,0,0,0.85)',
              flexShrink: 0,
              minWidth: 80,
            }}
          >
            {label}
          </Typography>
        )}
        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 400,
            color: 'rgba(0,0,0,0.45)',
          }}
        >
          {selectedOption?.italic ? <em>{displayLabel}</em> : displayLabel}
        </Typography>
        <UnfoldMoreRoundedIcon sx={{ fontSize: 18, color: 'rgba(0,0,0,0.25)' }} />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 180,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(40px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
              border: '0.5px solid rgba(255,255,255,0.6)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              py: 0.5,
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === value}
            onClick={() => handleSelect(option.value)}
            sx={{
              fontSize: '0.88rem',
              borderRadius: '8px',
              mx: 0.5,
              px: 1.5,
              py: 0.8,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              '&.Mui-selected': {
                bgcolor: 'transparent',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              },
            }}
          >
            <span>{option.italic ? <em>{option.label}</em> : option.label}</span>
            {option.value === value && (
              <CheckRoundedIcon sx={{ fontSize: 16, color: 'rgba(0,122,255,0.9)' }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

/* ─────────────────────────────────────────────
 *  GlassButton — primary / secondary / danger / ghost
 * ───────────────────────────────────────────── */
interface GlassButtonProps extends Omit<ButtonProps, 'variant'> {
  glassVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
}

/** Glass-styled action button with iOS palette variants. */
export const GlassButton = ({
  glassVariant = 'primary',
  loading = false,
  children,
  sx,
  disabled,
  ...rest
}: GlassButtonProps) => {
  const styles: Record<string, object> = {
    primary: {
      background: 'rgba(0,122,255,0.82)',
      color: '#fff',
      '&:hover': {
        background: 'rgba(0,122,255,0.92)',
        boxShadow: '0 4px 20px rgba(0,122,255,0.3)',
      },
    },
    secondary: {
      background: 'rgba(255,255,255,0.4)',
      color: 'rgba(0,122,255,0.9)',
      border: '0.5px solid rgba(0,122,255,0.25)',
      '&:hover': { background: 'rgba(255,255,255,0.55)', borderColor: 'rgba(0,122,255,0.4)' },
    },
    danger: {
      background: 'rgba(255,59,48,0.12)',
      color: 'rgba(255,59,48,0.9)',
      border: '0.5px solid rgba(255,59,48,0.2)',
      '&:hover': { background: 'rgba(255,59,48,0.2)' },
    },
    ghost: {
      background: 'transparent',
      color: 'rgba(0,0,0,0.5)',
      '&:hover': { background: 'rgba(0,0,0,0.04)' },
    },
  };

  return (
    <Button
      disabled={disabled || loading}
      sx={{
        borderRadius: glass.radius,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.95rem',
        minHeight: layout.minTapTarget,
        px: 2.5,
        py: 1,
        boxShadow: 'none',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: glass.transition,
        letterSpacing: '-0.01em',
        ...styles[glassVariant],
        ...sx,
      }}
      {...rest}
    >
      {loading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : children}
    </Button>
  );
};

/* ─────────────────────────────────────────────
 *  GlassIconButton — small pill icon buttons
 * ───────────────────────────────────────────── */
interface GlassIconButtonProps extends BoxProps {
  active?: boolean;
  danger?: boolean;
}

/** Small 34px pill icon button (used for toolbar / row actions). */
export const GlassIconButton = ({ active, danger, children, sx, ...rest }: GlassIconButtonProps) => (
  <Box
    component="button"
    type="button"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 44,
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      background: danger
        ? 'rgba(255,59,48,0.1)'
        : active
          ? 'rgba(0,122,255,0.12)'
          : 'rgba(255,255,255,0.35)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      transition: glass.transition,
      color: danger ? 'rgba(255,59,48,0.8)' : active ? 'rgba(0,122,255,0.8)' : 'rgba(0,0,0,0.4)',
      '&:hover': {
        background: danger
          ? 'rgba(255,59,48,0.18)'
          : active
            ? 'rgba(0,122,255,0.2)'
            : 'rgba(255,255,255,0.5)',
      },
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Box>
);

/* ─────────────────────────────────────────────
 *  GlassLabel — small uppercase section label
 * ───────────────────────────────────────────── */
/** Tiny uppercase section label, used above field groups. */
export const GlassLabel = ({ children, sx, ...rest }: TypographyProps) => (
  <Typography
    sx={{
      fontSize: '0.72rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'rgba(0,0,0,0.35)',
      mb: 1,
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Typography>
);

/* ─────────────────────────────────────────────
 *  GlassCheckbox
 * ───────────────────────────────────────────── */
interface GlassCheckboxProps {
  checked?: boolean;
  onChange?: CheckboxProps['onChange'];
  label?: ReactNode;
  sx?: FormControlLabelProps['sx'];
}

/** Checkbox + label pair styled to match the glass aesthetic. */
export const GlassCheckbox = ({ checked, onChange, label, sx }: GlassCheckboxProps) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={checked}
        onChange={onChange}
        size="small"
        sx={{
          color: 'rgba(0,0,0,0.25)',
          '&.Mui-checked': { color: 'rgba(0,122,255,0.8)' },
        }}
      />
    }
    label={label}
    sx={{
      '& .MuiFormControlLabel-label': {
        fontSize: '0.88rem',
        color: 'rgba(0,0,0,0.6)',
      },
      ...sx,
    }}
  />
);

/* ─────────────────────────────────────────────
 *  GlassDivider
 * ───────────────────────────────────────────── */
/** Hairline horizontal divider with vertical breathing room. */
export const GlassDivider = ({ sx, ...rest }: BoxProps) => (
  <Box
    sx={{
      height: '0.5px',
      background: 'rgba(0,0,0,0.08)',
      my: 2.5,
      ...sx,
    }}
    {...rest}
  />
);

/* ─────────────────────────────────────────────
 *  GlassAlert
 * ───────────────────────────────────────────── */
interface GlassAlertProps extends BoxProps {
  severity: 'error' | 'success';
}

/** Tinted alert box for inline error/success messages. */
export const GlassAlert = ({ severity, children, sx, ...rest }: GlassAlertProps) => {
  const isError = severity === 'error';
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: '12px',
        fontSize: '0.84rem',
        background: isError ? 'rgba(255,59,48,0.1)' : 'rgba(52,199,89,0.1)',
        border: `0.5px solid ${isError ? 'rgba(255,59,48,0.2)' : 'rgba(52,199,89,0.2)'}`,
        color: isError ? 'rgba(255,59,48,0.9)' : 'rgba(36,138,61,0.9)',
        wordBreak: 'break-all',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

/* ─────────────────────────────────────────────
 *  GlassSpinner — centered loading indicator
 * ───────────────────────────────────────────── */
interface GlassSpinnerProps {
  size?: number;
  sx?: BoxProps['sx'];
}

/** Centered MUI spinner with the iOS-blue tint. */
export const GlassSpinner = ({ size = 28, sx }: GlassSpinnerProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      ...sx,
    }}
  >
    <CircularProgress size={size} sx={{ color: 'rgba(0,122,255,0.8)' }} />
  </Box>
);
