import { AdminPageHeader, AdminSurface } from '@/components/admin/primitives';
import { AdminCollapsible } from '@/components/admin/Collapsible';
import { GUIDE_INTRO, GUIDE_SECTIONS } from '@/content/admin-guide';

/**
 * Kullanım Kılavuzu — panelin her bölümünün nasıl kullanılacağını anlatan,
 * akordeon kartlarla düzenlenmiş bilgilendirme sayfası. İçerik
 * src/content/admin-guide.ts dosyasından okunur (salt okunur).
 */
export default function GuidePage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Yardım"
        title="Kullanım Kılavuzu"
        description="Yönetim panelinin her bölümünün nasıl kullanılacağı — başlıklara tıklayarak açın."
      />

      <AdminSurface>
        <p className="font-body text-sm leading-7 text-charcoal/80">{GUIDE_INTRO}</p>
      </AdminSurface>

      <div className="space-y-3">
        {GUIDE_SECTIONS.map((section) => (
          <AdminCollapsible
            key={section.title}
            title={section.title}
            description={section.summary}
            defaultOpen={section.defaultOpen}
          >
            <div className="space-y-4">
              {section.body?.map((paragraph, i) => (
                <p key={i} className="font-body text-sm leading-7 text-charcoal/80">
                  {paragraph}
                </p>
              ))}

              {section.steps && section.steps.length > 0 && (
                <ol className="space-y-2">
                  {section.steps.map((step, i) => (
                    <li
                      key={i}
                      className="flex gap-3 font-body text-sm leading-6 text-charcoal/85"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-olive font-body text-[11px] font-semibold text-ivory">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}

              {section.tips && section.tips.length > 0 && (
                <div className="rounded-md border border-terracotta/25 bg-terracotta/5 px-4 py-3">
                  <div className="mb-2 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-terracotta">
                    İpuçları
                  </div>
                  <ul className="space-y-1.5">
                    {section.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="flex gap-2 font-body text-sm leading-6 text-charcoal/80"
                      >
                        <span className="mt-0.5 shrink-0 text-terracotta">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </AdminCollapsible>
        ))}
      </div>
    </>
  );
}
