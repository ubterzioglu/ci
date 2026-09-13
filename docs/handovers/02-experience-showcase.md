# Handover — Premium "Deneyim" Showcase Section

> **Amaç:** Ana sayfaya, gece-bahçe fotoğrafı üzerinde yüzen frosted-glass kartlarla
> premium bir "deneyim" (experience) showcase bölümü eklemek. Bu döküman, işi
> sıfırdan bağlam olmadan devralacak başka bir session için hazırlandı.

---

## 1. İstek (kullanıcının talebi)

Kullanıcı, ana sayfadaki mevcut **"Menümüzden Bir Tat"** menü-teaser bölümünün (referans
görsel: Ana Menü / Günün Spesiyali / Şarap Menüsü — koyu bahçe arka planı üzerinde üç
beyaz kart + line-art ikonlar) **daha premium görünümlü** bir versiyonunu istedi.

Brainstorming sırasında iki karar netleşti (kullanıcı onayladı):

1. **Section içeriği:** Mevcut menüyü taklit etmeyen, **net-new bir "deneyim" showcase**
   (Chef's Table / Şarap Eşleştirme / Bahçe Akşamları). Menü teaser **olduğu gibi kalır**.
2. **Görsel stil:** **Gece-bahçe fotoğrafı üzerinde frosted glass kartlar**
   (backdrop-blur), olive/terracotta paleti + ince altın hairline. Referans görsele en
   yakın ama daha rafine, marka-uyumlu seçenek.

> ⚠️ Henüz **spec yazılmadı ve kod yazılmadı**. Brainstorming tasarım onayı aşamasında
> kalındı (kullanıcı son tasarımı henüz "onayladım" demedi — aşağıdaki "Açık sorular"a bak).

---

## 2. Proje bağlamı (keşfedildi)

- **Proje:** Çi Neo Cucina — restoran web sitesi. Kök: `c:\temp_private\ci`
- **Stack:** Next.js 16.2.9 (App Router), React 19, **Tailwind v4** (`@theme` token'ları
  `globals.css` içinde — `tailwind.config` YOK), Supabase, TypeScript, pnpm.
- **Dil:** Site içeriği **Türkçe**. Tüm metinler Türkçe yazılmalı.
- **Görseller:** `next/image`, `src/lib/images.ts` içindeki `resolveImage(id)` helper'ı ile
  çözülür. Manifest: `src/content/media-data.ts`. Yereldeki dosyalar `public/images/imported/`.

### Ana sayfa yapısı — `src/app/page.tsx`

```
Hero → StorySection → MenuPreview → ReservationCTA → Gallery → ContactSection
```

`HomePage` bir async server component; JSON-LD için `getMenu()` çağırıyor.

### Design tokens — `src/app/globals.css` (`@theme` bloğu)

Renkler (hex):

- `--color-marble: #f6f2e9` (krem zemin)
- `--color-cream-deep: #ece5d6`
- `--color-charcoal: #23211c` (ana ink / koyu bölümler)
- `--color-charcoal-soft: #34312a`
- `--color-ivory: #f3efe6` (koyu zeminde metin)
- `--color-olive: #5a6240` (ana aksan) / `--color-olive-deep: #434a30`
- `--color-terracotta: #b5623c` (ikincil aksan)
- `--color-wine: #6e2a33`
- `--color-stone: #c9bfa9` (warm border) / `--color-stone-soft: #ded6c4`
- `--color-muted: #6b6457`

Tipografi:

- `--font-display`: Cormorant Garamond (serif başlıklar — yeşil editorial his)
- `--font-body`: Inter

Yardımcı sınıflar (globals.css `@layer components`):

- `.container-editorial` (max-w 76rem, ortalı, responsive padding)
- `.rule-olive` (imza olan olive hairline divider — `::before/::after` gradient çizgiler)
- `.eyebrow` (terracotta, uppercase, letter-spacing 0.22em, küçük etiket)
- `.fade-up` (giriş animasyonu)
- Spacing: `--spacing-section: 6rem` → `py-section` olarak kullanılıyor
- `prefers-reduced-motion` zaten globals.css'de handle ediliyor (animasyonları kapatıyor)

### Mevcut convention'lar (örnek component'lerden)

- Section'lar: `<section className="bg-... py-section">` + içinde `.container-editorial`
- Başlıklar `SectionHeading` ile (`src/components/ui/SectionHeading.tsx`):
  props `{ title, eyebrow?, align?, as?, className? }`. Ortalı modda `.rule-olive` render eder.
- Kartlar: `rounded-lg border border-stone-soft bg-marble p-7 transition-colors hover:border-olive`,
  `group` + `group-hover:text-olive`, link sonunda `terracotta` "→" CTA.
- Grid: `grid gap-6 md:grid-cols-3`
- `MenuPreview.tsx` ve `StorySection.tsx` birebir okunması gereken referans örnekler.

### İlgili görsel

- `restaurant-garden-night` (id) → `/images/imported/restaurant-garden-night.jpg`
  — "Zeytin ağaçları arasında akşam restoran bahçesi". Yeni section'ın arka planı bu olacak.
  `resolveImage('restaurant-garden-night')` ile çözülür.

---

## 3. Onaylanan tasarım (uygulama planı)

**Yeni bölüm:** `ExperienceShowcase` — Ana sayfada `StorySection` ile `MenuPreview` arasına.

```
Hero → StorySection → [ExperienceShowcase ⟵ YENİ] → MenuPreview → ReservationCTA → Gallery → ContactSection
```

### İçerik (net-new, Türkçe — `homeContent.experiences` olarak eklenecek)

| İkon              | Başlık               | Açıklama                                                                                |
| ----------------- | -------------------- | --------------------------------------------------------------------------------------- |
| 🍽 (fork/plate)   | **Chef's Table**     | Şefin sofrasında, mevsimin en taze malzemeleriyle kişiye özel bir menü deneyimi.        |
| 🍷 (wine glass)   | **Şarap Eşleştirme** | Yerel üreticilerin seçkisinden, her tabağa eşlik eden özenli şarap önerileri.           |
| 🌿 (olive branch) | **Bahçe Akşamları**  | Zeytin ağaçlarının altında, gün batımından gece yarısına uzanan dingin akşam yemekleri. |

- Her kart `/experiences` sayfasına link verir (CTA: `Deneyimi Keşfet →`).
  - Not: `/experiences` sayfası mevcut (`src/app/experiences/page.tsx`).
- "Chef's Table" markaca gerçek (`homeContent.chefsTable` zaten var). Diğer iki başlık
  makul ama **yeni/uydurma marketing copy** — kullanıcıya bu açıkça belirtildi.

### Görsel / yapı

- Full-bleed section; arka plan `restaurant-garden-night.jpg` (`next/image` `fill`,
  `object-cover`), üstüne charcoal gradient overlay (`from-charcoal/85 via-charcoal/70`)
  → metin AA-okunur kalsın.
- `SectionHeading` yeniden kullanılır: `eyebrow="Deneyim"`, `title="Sofranın Ötesinde"`,
  ama koyu zeminde **ivory** renkte. → `SectionHeading`'e opsiyonel
  `tone?: 'dark' | 'light'` prop'u eklenecek (default `'dark'`, geriye dönük uyumlu).
  `tone='light'` başlığı ivory yapar ve `.rule-olive`'i açık zemine uygun hale getirir.
- Üç frosted glass kart:
  `bg-ivory/8 backdrop-blur-md border border-ivory/15 rounded-lg`, bol padding.
  İçinde: küçük inline **line-art SVG ikon** (stroke = warm gold/terracotta) → serif başlık
  (ivory) → muted-ivory açıklama → `Deneyimi Keşfet →` linki.
- Premium aksanlar: ikon altında ince altın hairline; hover'da kart yükselir
  (`hover:-translate-y-1`), border altına döner, blur derinleşir. Tümü
  `prefers-reduced-motion`'a saygılı (globals.css zaten hallediyor).
- İkonlar: 3 inline SVG (çatal/tabak, şarap kadehi, zeytin dalı) — referanstaki el-çizimi
  line-art hissine yakın, küçük, `aria-hidden`.

### Erişilebilirlik / perf

- Koyu overlay kontrastı garantiler. `backdrop-blur` graceful degrade eder.
- `next/image`'e explicit `sizes` verilir. Kartlar `<Link>` (klavye-erişilebilir, global
  `:focus-visible` görünür focus sağlıyor).
- Saf CSS hover — client JS yok, server component kalır.

---

## 4. Dosya değişiklikleri (yapılacaklar)

1. **YENİ** `src/components/sections/ExperienceShowcase.tsx`
   - Server component. `resolveImage('restaurant-garden-night')` ile arka plan.
   - `homeContent.experiences` üzerinde map. 3 inline SVG ikon (veya küçük alt-component'ler).
   - Mevcut convention'ları takip et (bkz. `MenuPreview.tsx` / `StorySection.tsx`).
2. **YENİ (opsiyonel)** `src/components/ui/icons/` — 3 küçük inline ikon component'i.
   - Karar: tek odaklı dosya için ikonları `ExperienceShowcase.tsx` içinde inline tutmaya
     meyilliyiz. Ayrı dosya istenirse buraya konur.
3. **DÜZENLE** `src/content/pages-data.ts`
   - `homeContent` objesine `experiences` dizisi ekle (yukarıdaki Türkçe copy, tipli).
     Yapı `menusTeaser`'a benzer: `{ key, title, description, href }` + ikon tanımlayıcı.
4. **DÜZENLE** `src/app/page.tsx`
   - `<StorySection />`'dan sonra `<ExperienceShowcase />` ekle + import.
5. **DÜZENLE** `src/components/ui/SectionHeading.tsx`
   - Opsiyonel `tone?: 'dark' | 'light'` prop ekle (default `'dark'`). `'light'` → başlık
     ivory, rule açık zemine uygun. Geriye dönük uyumlu (mevcut çağrılar etkilenmez).

---

## 5. Açık sorular / dikkat

- **Tasarım onayı:** Kullanıcı stil ve içerik yönünü seçti (glass-over-photo + net-new
  deneyim showcase), ama son tasarım özetine henüz net "onaylıyorum" demedi. İlk adımda
  bu onayı doğrula. Onaylanırsa doğrudan uygulamaya geçilebilir.
- **Uydurma copy:** "Şarap Eşleştirme" ve "Bahçe Akşamları" başlıkları yeni marketing
  copy. Kullanıcı isterse gerçek/marka-doğru metinlerle değiştirilmeli. Marka gerçeklerini
  uydurma kuralı geçerli (CLAUDE.md / pages-data.ts notları).
- **Link hedefleri:** Şu an üçü de `/experiences`. Chef's Table için `/reservations`
  ("iletişime geçin" niyeti) tercih edilirse değiştirilebilir — kullanıcıya sorulabilir.

---

## 6. İş akışı notları (bu repo / kullanıcı kuralları)

- Kullanıcı **superpowers:brainstorming** skill'i ile başladı (tasarım → onay → spec →
  writing-plans). Brainstorming kuralı: **kod yazmadan önce tasarım sunulup onaylanmalı**.
  Onay sonrası spec `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` altına yazılır ve
  commit edilir; ardından `writing-plans` skill'i ile implementation plan oluşturulur.
- Commit mesajları: conventional commits (`feat:`, `fix:`, ...). Global trailer convention'ı
  var (CLAUDE.md `<commit_protocol>`) — önemli kararlar için `Constraint:`, `Rejected:`,
  `Confidence:` vb. trailer'lar.
- Doğrulama: değişiklik sonrası `pnpm typecheck`, `pnpm lint`, `pnpm format` çalıştırılabilir.
  Geçici domain notu: site şu an `notyetbro.club` üzerinde (memory'de kayıtlı), canlıya
  geçince `cineocucina.com`'a dönülecek — bu işle ilgisiz ama context için.

---

## 7. Devralan session için ilk adımlar

1. Bu dökümanı oku. Gerekirse şu dosyaları aç (referans/convention):
   `src/app/page.tsx`, `src/components/sections/MenuPreview.tsx`,
   `src/components/sections/StorySection.tsx`, `src/components/ui/SectionHeading.tsx`,
   `src/content/pages-data.ts`, `src/app/globals.css`, `src/lib/images.ts`,
   `src/content/media-data.ts`.
2. Kullanıcıdan son tasarım onayını al (yukarıdaki §3).
3. Onaylanınca: §4'teki dosya değişikliklerini uygula → typecheck/lint → kullanıcıya göster.
4. (Brainstorming akışı izleniyorsa) önce spec yaz + commit, sonra writing-plans.
