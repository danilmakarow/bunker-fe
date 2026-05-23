import type { ReactNode } from 'react';
import { Box, Stack } from '@mui/material';
import { layout, safeArea } from '@/theme/tokens';
import AppBar from './app-bar';

interface AppBarConfig {
  title?: string;
  back?: { href?: string; onClick?: () => void; label?: string };
  trailing?: ReactNode;
}

interface PageShellProps {
  children: ReactNode;
  /** Mount the fixed top app-bar; omit on the landing/login hero. */
  appBar?: AppBarConfig;
  /** Action buttons rendered in normal flow at the bottom of the page (mounted only if provided). */
  footer?: ReactNode;
  /** Centre content vertically — used by landing/login hero. */
  centered?: boolean;
  /** Cap the centred content width on large screens (default 480). */
  maxContentWidth?: number;
}

/**
 * Full-bleed mobile-first page shell.
 *
 * Layout: [fixed AppBar?] · [scrollable main with optional bottom actions].
 * The main region reserves top padding for the notch + app-bar. A `footer`
 * renders its buttons in normal flow, pushed to the bottom of the viewport
 * but scrolling with the page (not fixed); the bottom safe-area inset keeps
 * them clear of the home indicator. Without a footer, content runs full-bleed
 * under the indicator.
 */
const PageShell = ({
  children,
  appBar,
  footer,
  centered = false,
  maxContentWidth = 480,
}: PageShellProps) => {
  const hasAppBar = Boolean(appBar);
  const hasFooter = Boolean(footer);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {appBar && <AppBar title={appBar.title} back={appBar.back} trailing={appBar.trailing} />}

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: centered ? 'center' : 'flex-start',
          width: '100%',
          px: layout.contentGutter,
          pt: hasAppBar
            ? `calc(${safeArea.top} + ${layout.appBarHeight}px + 16px)`
            : `calc(${safeArea.top} + 16px)`,
          // With a footer, keep its buttons clear of the home indicator.
          // Without one, let content run full-bleed under the indicator.
          pb: hasFooter ? `calc(${safeArea.bottom} + 16px)` : '16px',
          // py: "0px"
        }}
      >
        <Box sx={{ width: '100%', maxWidth: maxContentWidth }}>{children}</Box>

        {footer && (
          <Box sx={{ width: '100%', maxWidth: maxContentWidth, mt: 'auto', pt: 3 }}>
            <Stack spacing={1}>{footer}</Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageShell;
