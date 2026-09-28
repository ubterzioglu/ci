import type { Metadata } from 'next';

import { ToastProvider } from '@/components/admin/Toast';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  // Spelled out rather than relying on a root-layout title template — the brand
  // suffix is owned by buildMetadata(), which the admin area bypasses.
  title: `Yönetim Paneli | ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

/**
 * Admin root layout. Wraps the whole /admin area (login + panel) in the toast
 * provider. Authorization is enforced per-page by requireAdmin() and at the
 * edge by proxy.ts — this layout stays auth-agnostic so the login route can
 * render inside it. The route group app/admin/(panel) adds the sidebar chrome.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
