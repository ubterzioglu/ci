import { ImageResponse } from 'next/og';

import { siteConfig } from '@/lib/site-config';

/**
 * Default Open Graph / Twitter share image, generated at build/edge time so it
 * always matches the brand palette without shipping a binary. Pages without
 * their own OG image inherit this. 1200×630 is the canonical social size.
 */
export const runtime = 'edge';
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Brand tokens (mirrors src/app/globals.css @theme).
const MARBLE = '#f6f2e9';
const CHARCOAL = '#23211c';
const OLIVE = '#5a6240';
const TERRACOTTA = '#b5623c';
const MUTED = '#6b6457';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: MARBLE,
          padding: '80px',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: TERRACOTTA,
            fontWeight: 600,
          }}
        >
          Kaş · Antalya
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 132,
            color: CHARCOAL,
            fontFamily: 'Georgia, serif',
            marginTop: 24,
            marginBottom: 24,
            fontWeight: 500,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            width: 120,
            height: 2,
            backgroundColor: OLIVE,
            marginBottom: 32,
          }}
        />
        <div
          style={{
            fontSize: 38,
            color: MUTED,
            textAlign: 'center',
            maxWidth: 820,
            lineHeight: 1.3,
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
