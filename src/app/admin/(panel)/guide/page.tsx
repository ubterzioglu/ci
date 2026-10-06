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
        <p className="font-body text-charcoal/80 text-sm leading-7">{GUIDE_INTRO}</p>
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
                <p key={i} className="font-body text-charcoal/80 text-sm leading-7">
                  {paragraph}
                </p>
              ))}

              {section.steps && section.steps.length > 0 && (
                <ol className="space-y-2">
                  {section.steps.map((step, i) => (
                    <li key={i} className="font-body text-charcoal/85 flex gap-3 text-sm leading-6">
                      <span className="bg-olive font-body text-ivory mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}

              {section.tips && section.tips.length > 0 && (
                <div className="border-terracotta/25 bg-terracotta/5 rounded-md border px-4 py-3">
                  <div className="font-body text-terracotta mb-2 text-[11px] font-semibold tracking-[0.16em] uppercase">
                    İpuçları
                  </div>
                  <ul className="space-y-1.5">
                    {section.tips.map((tip, i) => (
                      <li
                        key={i}
                        className="font-body text-charcoal/80 flex gap-2 text-sm leading-6"
                      >
                        <span className="text-terracotta mt-0.5 shrink-0">•</span>
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
