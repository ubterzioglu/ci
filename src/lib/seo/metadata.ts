import type { Metadata } from 'next';

import { siteConfig } from '@/lib/site-config';

/**
 * Shared metadata helpers. `buildMetadata` produces consistent canonical URLs,
 * Open Graph and Twitter cards for every page from a small set of inputs.
 */

const baseUrl = siteConfig.url;

interface BuildMetadataInput {
  title?: string;
  description?: string;
  path?: string; // e.g. "/menu"
  ogImage?: string | null;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path = '/',
  ogImage,
  noIndex = false,
}: BuildMetadataInput): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const desc = description ?? siteConfig.description;
  const canonical = new URL(path, baseUrl).toString();
  const image = ogImage ?? `${baseUrl}/og-default.jpg`;

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: fullTitle,
      description: desc,
      url: canonical,
      locale: siteConfig.locale,
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [image],
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
