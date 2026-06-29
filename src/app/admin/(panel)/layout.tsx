import { requireAdmin } from '@/lib/auth/require-admin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

/**
 * Layout for the authenticated admin panel. requireAdmin() runs on every
 * navigation: a non-admin (or signed-out) request is redirected to login before
 * any panel page renders. The login route lives outside this group, so it never
 * triggers the guard.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-marble">
      <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-6 lg:grid-cols-[272px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pb-2">
              <AdminSidebar userEmail={admin.email} />
            </div>
          </div>

          <main className="min-w-0 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
