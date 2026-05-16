import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { layout, safeArea } from '@/theme/tokens';
import AppBar from './app-bar';
import StickyActionBar from './sticky-action-bar';

interface AppBarConfig {
  title?: string;
  back?: { href?: string; onClick?: () => void; label?: string };
  trailing?: ReactNode;
}

interface PageShellProps {
  children: ReactNode;
  /** Mount the fixed top app-bar; omit on the landing/login hero. */
  appBar?: AppBarConfig;
  /** Buttons rendered inside the StickyActionBar (mounted only if provided). */
  footer?: ReactNode;
  /** Centre content vertically — used by landing/login hero. */
  centered?: boolean;
  /** Cap the centred content width on large screens (default 480). */
  maxContentWidth?: number;
}

/**
 * Full-bleed mobile-first page shell.
 *
 * Layout: [fixed AppBar?] · [scrollable main] · [fixed StickyActionBar?].
 * The main region reserves padding for whichever chrome is mounted +
 * the device safe areas so content never lands under the notch / home bar.
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
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
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
          pb: hasFooter
            ? `calc(${safeArea.bottom} + ${layout.footerReserve}px)`
            : `calc(${safeArea.bottom} + 16px)`,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: maxContentWidth }}>{children}</Box>
      </Box>

      {footer && <StickyActionBar>{footer}</StickyActionBar>}
    </Box>
  );
};

export default PageShell;
