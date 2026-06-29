import { ImageResponse } from 'next/og';

/**
 * Apple touch icon (180×180), generated to match the brand favicon (the "Çi"
 * monogram on charcoal). Used when the site is saved to an iOS home screen.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#23211c',
          color: '#f6f2e9',
          fontSize: 104,
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
        }}
      >
        Çi
      </div>
    ),
    { ...size },
  );
}
