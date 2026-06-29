# QR Menü — Durum ve Admin Panel Entegrasyon Notları

> Son güncelleme: 2026-06-29 · Sahibi: ubterzioglu

Masadaki bir misafirin QR kod okutarak ulaştığı, "chrome-free" (Header/Footer'sız) dijital menü.
Pazarlama amaçlı `/menu` sayfasından farklı; tek elle kaydırma için mobil-öncelikli tasarlanmıştır.

---

## 1. Mevcut Durum — Hazır ✅

QR menü route'u `f8cb135` commit'iyle eklendi ve şu an çalışır durumda.

| Parça | Konum | Not |
|---|---|---|
| Route (`/qr`) | [src/app/(qr)/qr/page.tsx](../src/app/(qr)/qr/page.tsx) | Server component, client JS yok |
| Layout (chrome-free) | [src/app/(qr)/layout.tsx](../src/app/(qr)/layout.tsx) | Header/Footer yok; `robots: index:false` |
| Menü veri katmanı | [src/lib/db/menu.ts](../src/lib/db/menu.ts) | `getMenu()` — Supabase → local fallback |
| Local fallback verisi | [src/content/menu-data.ts](../src/content/menu-data.ts) | Supabase yoksa bu render edilir |
| Ortak kategori bileşeni | [src/components/menu/MenuCategory.tsx](../src/components/menu/MenuCategory.tsx) | `/menu` ile paylaşılır |

### Davranış özeti

- **Veri kaynağı `/menu` ile ortak.** İkisi de `getMenu()` çağırır → Supabase'deki `menu_categories` /
  `menu_items` tablolarından `is_active = true` satırları `sort_order`'a göre çeker. Supabase
  yapılandırılmamışsa veya sorgu hata verirse [src/content/menu-data.ts](../src/content/menu-data.ts)
  içindeki local veriye düşer. Yani menüyü bir yerden güncellersen her iki sayfa da senkron kalır.
- **TR-only (v1).** Şu an yalnızca Türkçe. Çok dilli destek ek iş gerektirir.
- **Şarap menüsü** kaynakta liste olarak yok; zarif bir "ekibe danışın" notu gösterilir
  (`WINE_MENU_NOTICE`).
- **SEO:** Layout `robots: { index: false }` ile `/qr`'ı indeksten dışlar (`/menu` ile duplicate
  içerik olmasın diye). Bu **bilinçli** — değiştirme.

---

## 2. Eksikler / Dikkat Edilecekler

1. **Fiziksel QR kod görseli repoda YOK.** `/qr` adresine yönlendiren bir PNG/SVG üretilmemiş.
   Kodda hiçbir QR-üretim bağımlılığı (`qrcode` vb.) yok. Masalara basılacak görseli ayrıca
   oluşturmak gerekiyor (bkz. Bölüm 4).
2. **Domain.** Site şu an geçici `notyetbro.club` üzerinde. QR kodunu **canlı domaine
   (`cineocucina.com`) geçtikten sonra** üret — yoksa basılı kodlar yanlış adresi gösterir.
3. **Menü düzenleme arayüzü henüz yok.** Menü ya Supabase'den (manuel SQL / Supabase Studio) ya da
   local dosyadan değişiyor. Admin panelinden düzenleme = yeni iş (bkz. Bölüm 3).

---

## 3. Admin Panele Bağlama Planı

Hedef: admin panelinden (a) QR menüye kolay erişim/önizleme ve QR kod indirme, (b) ileride menü
içeriğini panelden düzenleme.

### Mevcut admin yapısı (uyulacak desen)

- Panel sayfaları: `src/app/admin/(panel)/<bölüm>/page.tsx`
  ([reservations](../src/app/admin/(panel)/reservations/page.tsx),
  [revisions](../src/app/admin/(panel)/revisions/page.tsx),
  [updates](../src/app/admin/(panel)/updates/page.tsx) örnek alınabilir)
- Sol menü: [src/components/admin/AdminSidebar.tsx](../src/components/admin/AdminSidebar.tsx) →
  `NAV` dizisine yeni item eklenir (her item inline SVG icon kullanır, ikon kütüphanesi yok)
- Yetki: [src/app/admin/(panel)/layout.tsx](../src/app/admin/(panel)/layout.tsx) içindeki
  `requireAdmin()` her panel sayfasını korur — yeni sayfa otomatik korunur, ek iş yok
- UI primitifleri: `AdminPageHeader`, `AdminSurface`
  ([src/components/admin/primitives.tsx](../src/components/admin/primitives.tsx))
- Server action'lar: ilgili bölümün klasöründe `actions.ts`

### Aşama A — "QR Menü" bölümü (görüntüleme + QR indirme) · küçük iş

Salt-okunur bir tanıtım/araç sayfası. Menü düzenleme yok; sadece erişim, önizleme ve QR kod indirme.

1. **Sidebar'a item ekle** — [AdminSidebar.tsx](../src/components/admin/AdminSidebar.tsx) `NAV`
   dizisine:
   ```ts
   { href: '/admin/qr', label: 'QR Menü', icon: (/* inline SVG */) }
   ```
2. **Yeni sayfa** — `src/app/admin/(panel)/qr/page.tsx`:
   - `AdminPageHeader` + `AdminSurface` ile başlık
   - `/qr` adresine "Yeni sekmede aç" linki (canlı önizleme)
   - QR kod görselini göster + "PNG indir" / "SVG indir" düğmeleri
   - Tabela/masa için baskıya uygun ölçü notu
3. **QR kod üretimi** — iki seçenek:
   - **Build-time (önerilen, basit):** bir script (`scripts/generate-qr.ts`) `qrcode` paketiyle
     `public/qr/menu.svg` üretsin; sayfada statik göster. Domain'i tek yerden (`siteConfig` ya da
     env) alsın.
   - **Runtime:** sayfa içinde QR'ı dinamik üret. Domain değişince otomatik güncellenir ama bağımlılık
     client'a taşar.

### Aşama B — Panelden menü düzenleme (CRUD) · orta/büyük iş

Supabase `menu_categories` / `menu_items` tablolarını panelden yönetmek.

> Tablolar `001_initial_schema.sql` içinde tanımlı. **RLS policy'leri kontrol et:** admin tarafı
> [002_admin.sql](../supabase/migrations/002_admin.sql) desenindeki gibi `is_admin()` ile yazma
> yetkisi alır. Menü tablolarına admin INSERT/UPDATE/DELETE policy'si eklemek gerekebilir
> (rezervasyon tablosunda yapıldığı gibi).

Adımlar:

1. **Veri erişimi** — [src/lib/db/menu.ts](../src/lib/db/menu.ts) yanına admin-tarafı modül:
   `src/lib/db/admin/menu.ts` (reservations/revisions desenindeki gibi). Kategori + item okuma
   (aktif olmayanlar dahil), yazma fonksiyonları.
2. **Migration** — gerekirse menü tablolarına admin RLS policy'leri (`is_admin()` ile `for all`).
3. **Server actions** — `src/app/admin/(panel)/menu/actions.ts`: create/update/delete + Zod
   doğrulama (proje kuralı: sınırda doğrulama). Mutasyon sonrası `revalidatePath('/menu')` ve
   `revalidatePath('/qr')` — iki sayfa da güncel kalsın.
4. **UI** — `src/app/admin/(panel)/menu/page.tsx` (+ client bileşeni): kategoriler, item listesi,
   düzenleme formu, sürükle-sırala / `sort_order`, `is_active` toggle.
5. **Görseller** — item `image_url` için Supabase Storage yükleme (opsiyonel, ileri faz).

### Önerilen sıralama

```
Aşama A (QR Menü bölümü + QR indirme)   →  hızlı kazanım, az risk
        ↓
Domain canlıya alınır (cineocucina.com)  →  QR kodu KESİNLEŞTİR ve bas
        ↓
Aşama B (panelden menü CRUD)             →  asıl yönetim değeri
```

---

## 4. QR Kod Üretimi — Pratik Notlar

- **Hedef URL:** `https://cineocucina.com/qr` (canlı). Test için geçici domain kullanılabilir ama
  basılı kod canlı domaini göstermeli.
- **Paket:** `qrcode` (Node) veya `qrcode.react` (React). PNG hem de SVG çıktısı verebilir.
- **Baskı:** SVG tercih et (ölçeklenince bozulmaz). Yüksek hata düzeltme seviyesi (`errorCorrectionLevel: 'H'`)
  ortada logo koyacaksan işe yarar.
- **Domain'i tek kaynaktan al** (`siteConfig` / env) ki domain değişince QR'ı tek yerden
  yeniden üretebilesin.

---

## 5. İlgili Dosyalar (Hızlı Referans)

```
src/app/(qr)/qr/page.tsx          # QR menü sayfası
src/app/(qr)/layout.tsx           # chrome-free layout, noindex
src/app/(site)/menu/page.tsx      # pazarlama menü sayfası (aynı veri)
src/lib/db/menu.ts                # getMenu() — Supabase + fallback
src/content/menu-data.ts          # local fallback + servis/şarap notları
src/components/menu/MenuCategory.tsx
src/components/menu/MenuItemCard.tsx
src/components/admin/AdminSidebar.tsx   # NAV dizisine QR Menü eklenecek
src/app/admin/(panel)/layout.tsx        # requireAdmin() koruması
src/components/admin/primitives.tsx     # AdminPageHeader, AdminSurface
supabase/migrations/002_admin.sql       # is_admin() + admin RLS deseni
```
