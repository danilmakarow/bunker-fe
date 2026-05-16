import { ImageResponse } from 'next/og';
import { themeColor } from '@/theme/tokens';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * iOS home-screen icon. Smaller render so SF Pro proportions read at
 * the Apple Touch Icon size; padded to act as a maskable target so iOS
 * doesn't crop the glyph.
 */
const AppleIcon = () =>
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
          fontSize: 126,
          fontWeight: 700,
          fontFamily: 'system-ui, -apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
          letterSpacing: -3,
        }}
      >
        Б
      </div>
    ),
    size,
  );

export default AppleIcon;
