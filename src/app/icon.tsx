import { ImageResponse } from 'next/og';
import { themeColor } from '@/theme/tokens';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

/**
 * Procedurally generated favicon / PWA icon — a warm gradient disc
 * with the "Б" glyph for Бункер. Replace with a designed asset when
 * branding is finalised.
 */
const Icon = () =>
  new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(160deg, ${themeColor} 0%, #b08494 55%, #4f5c75 100%)`,
          color: 'rgba(255,255,255,0.95)',
          fontSize: 360,
          fontWeight: 700,
          fontFamily: 'system-ui, -apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
          letterSpacing: -10,
        }}
      >
        Б
      </div>
    ),
    size,
  );

export default Icon;
