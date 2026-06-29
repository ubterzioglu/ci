import { AdminPageHeader, AdminSurface } from '@/components/admin/primitives';
import { UPDATE_ENTRIES, UPDATE_PENDING } from '@/content/admin-updates';

/** Read-only changelog. Content is edited in src/content/admin-updates.ts. */
export default function UpdatesPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Çalışma Alanı"
        title="Güncellemeler"
        description="Sitede tamamlanan geliştirmeler ve sırada bekleyen işler."
      />

      <div className="space-y-6">
        <AdminSurface title="Yapılanlar" description="En yeni kayıt en üstte tutulur.">
          <p className="font-body text-sm leading-7 text-muted">
            Bu alan yalnızca okunurdur. Ekip ve müşteri tarafında “neler bitti, neler sırada”
            sorusuna tek bakışta cevap vermesi için sade tutulur.
          </p>
        </AdminSurface>

        {UPDATE_ENTRIES.map((group) => (
          <div
            key={`${group.date}-${group.title}`}
            className="rounded-lg border border-stone border-l-4 border-l-olive bg-marble p-6 shadow-[0_18px_50px_rgba(35,33,28,0.06)]"
          >
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-xl text-charcoal">{group.title}</h3>
              <span className="font-body text-xs font-semibold text-terracotta">{group.date}</span>
            </div>
            <ul className="space-y-2">
              {group.items.map((item, i) => (
                <li key={i} className="flex gap-2 font-body text-sm leading-6 text-charcoal/80">
                  <span className="mt-0.5 shrink-0 text-olive">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {UPDATE_PENDING.length > 0 && (
          <div className="rounded-lg border border-terracotta/30 bg-terracotta/5 p-6 shadow-[0_18px_50px_rgba(35,33,28,0.05)]">
            <h3 className="mb-3 font-display text-xl text-charcoal">Sırada / İçerik Bekleyen</h3>
            <ul className="space-y-2">
              {UPDATE_PENDING.map((item, i) => (
                <li key={i} className="flex gap-2 font-body text-sm leading-6 text-charcoal/80">
                  <span className="mt-0.5 shrink-0 text-terracotta">○</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
