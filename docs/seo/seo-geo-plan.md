# SEO + GEO (Yerel & Üretken Arama) Planı — Çi Neo Cucina

## Uygulama Durumu

Commit `9b09368` (2026-10-02) ile uygulanan maddeler:

| Madde                                                  | Durum          | Not                                                                                                                                                         |
| ------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Faz 0.1 — robots.txt noindex/disallow ayrımı           | ✅ Uygulandı   | `/impressum`, `/datenschutz` disallow'dan çıkarıldı; `/admin/` eklendi                                                                                      |
| Faz 0.2 — Kök layout `alternates.canonical` kaldırıldı | ✅ Uygulandı   | buildMetadata tek canonical sahibi                                                                                                                          |
| Faz 0.3 — Anasayfa `<title>` konum anahtar kelimesi    | ✅ Uygulandı   | `absoluteTitle` + 5 dilde per-locale başlık tablosu (`src/lib/seo/titles.ts`)                                                                               |
| Faz 0.4 — `x-default` hreflang → EN                    | ✅ Uygulandı   | `metadata.ts` + `sitemap.ts` güncellendi                                                                                                                    |
| Faz 0.5 — Varlık adı tutarsızlığı                      | ⏳ Bekliyor    | Restoran teyidi gerekli                                                                                                                                     |
| Faz 1.1 — Schema locale-aware                          | ✅ Uygulandı   | `restaurantSchema`/`websiteSchema`/`menuSchema` locale alıyor                                                                                               |
| Faz 1.2 — Restaurant düğümü zenginleştirme             | ✅ Kısmen      | `hasMenu`, `ReserveAction`, `logo`, şef `founder`/`employee` eklendi; `priceRange`, `paymentAccepted`, `amenityFeature`, `knowsLanguage` doğrulama bekliyor |
| Faz 1.3 — Menu schema tekilleştirme                    | ⏳ Yapılmadı   |                                                                                                                                                             |
| Faz 2.1–2.2 — GBP ve dizin kayıtları                   | ⏳ Operasyonel | Kod değil, panel işi                                                                                                                                        |
| Faz 2.3 — Search Console doğrulama meta                | ✅ Uygulandı   | `GOOGLE_SITE_VERIFICATION`, `YANDEX_VERIFICATION`, `BING_SITE_VERIFICATION` env'den                                                                         |
| Faz 2.4 — Eski Wix URL yönlendirmeleri                 | ⏳ Yapılmadı   |                                                                                                                                                             |
| Faz 3.1 — AI tarayıcı politikası                       | ✅ Uygulandı   | Arama botları açık, eğitim botları `*` kuralında                                                                                                            |
| Faz 3.2 — `/llms.txt`                                  | ✅ Uygulandı   | `siteConfig`'ten üretilen route                                                                                                                             |
| Faz 3.3 — Alıntılanabilir içerik                       | ⏳ Yapılmadı   |                                                                                                                                                             |
| Faz 3.4 — `/kas-sef-restorani` çok dilli               | ⏳ Yapılmadı   |                                                                                                                                                             |
| Faz 3.5 — Görsel alt metinleri locale                  | ⏳ Yapılmadı   |                                                                                                                                                             |
| Faz 3.6 — Site dışı otorite                            | ⏳ Sürekli     |                                                                                                                                                             |
| Faz 4 — http→https, cineocucina.com→www 301            | ⏳ Panel işi   | Coolify/Traefik                                                                                                                                             |

## Özet

Altyapı zaten sağlam: SSR, locale-aware canonical + hreflang, sitemap, `Restaurant` / `Menu` / `BreadcrumbList` / `FAQPage` / `Article` JSON-LD, geo meta etiketleri, `/kas-sef-restorani` AEO sayfası, admin ve `/qr` için noindex. Bu plan sıfırdan kurulum değil; **mevcut hataları düzeltip** iki alanda derinleşiyor:

- **Yerel SEO (geo):** Google Haritalar / "Kaş restoran" aramaları, işletme profilleri, NAP tutarlılığı.
- **GEO (Generative Engine Optimization):** ChatGPT, Perplexity, Google AI Overviews, Claude gibi asistanların restoranı doğru tanıyıp önermesi.

Kural (repo felsefesiyle aynı): **doğrulanmamış hiçbir bilgi uydurulmaz.** Restorandan gelmesi gereken veriler `docs/backlog/panel-exports-todo.md`'ye eklenir, alan `null` kalır.

---

## Faz 0 — Hatalar ve hızlı düzeltmeler (öncelik: yüksek, efor: düşük)

### 0.1 `robots.ts` — noindex sayfaları disallow edilmemeli

`/impressum` ve `/datenschutz` hem `noindex` hem `Disallow`. Disallow edilen sayfa taranamadığı için Google `noindex`'i hiç göremez; URL dışarıdan link alırsa "açıklamasız sonuç" olarak indekslenebilir.

- Bu iki yolu `disallow`'dan çıkar; `noindex` meta'sı işini yapsın.
- `disallow`: yalnızca `/api/` ve `/admin/` kalsın.

### 0.2 Kök layout'taki `alternates: { canonical: '/' }` kaldırılmalı

`src/app/layout.tsx` içindeki canonical, kendi metadata'sı olmayan her route'a miras kalıyor (`not-found`, `/qr`, admin). Sonuç: 404 sayfaları anasayfaya canonical veriyor. Satırı sil; canonical'ın tek sahibi `buildMetadata` olsun.

### 0.3 Anasayfa `<title>` konum anahtar kelimesi içermiyor

Şu an TR anasayfa başlığı yalnızca `Çi Neo Cucina`. "Kaş restoran" aramasında başlık en güçlü sinyal.

- `buildMetadata`'ya `absoluteTitle?: string` ekle (marka soneki eklenmeden kullanılır).
- Öneri (≤60 karakter, her dilde ayrı):
  - TR: `Çi Neo Cucina — Kaş'ta Akdeniz & Anadolu Mutfağı`
  - EN: `Çi Neo Cucina — Chef-led Mediterranean Restaurant in Kaş`
  - DE: `Çi Neo Cucina — Mediterranes Restaurant in Kaş`
  - RU / FR: DeepL + insan kontrolü
- Alt sayfalar: `Menü` → `Menü — Kaş'ta Akdeniz Mutfağı`, `Rezervasyonlar` → `Kaş'ta Masa Rezervasyonu` gibi. Locale başlıkları `pages.*.json` içindeki `seoTitle` alanından gelsin (şu an `[lang]` sayfaları `page.title` kullanıyor, `seoTitle` kullanılmıyor).

### 0.4 `x-default` hreflang → İngilizce

`x-default` "dili eşleşmeyen ziyaretçi" içindir (İtalyan, Hollandalı, İngiliz turist). Bu kitle Türkçe değil İngilizce sayfayı görmeli.

- `metadata.ts` → `buildLanguageAlternates` ve `sitemap.ts` → `languageAlternates`: `x-default` = `localePath(path, 'en')`.
- TR-only sayfalar (`/kas-sef-restorani`) etkilenmez (hreflang zaten yok).

### 0.5 Varlık (entity) adı tutarsızlığı — **restorandan teyit gerekli**

`sameAs` içindeki profiller farklı isimlerle kayıtlı:

- Tripadvisor: _Ci Neo Cucina By Mezetaryen_
- Wanderlog: _çi neo cucina by miskin_
- RestaurantGuru: _Muskat-Meze-Bar-Kas_

Google ve LLM'ler varlığı bu profillerden birleştirir; isim farkı hem harita sonucunu hem asistan cevabını bölebilir.

- [ ] RestaurantGuru kaydı gerçekten bu restoran mı? Değilse `sameAs`'tan **çıkar**.
- [ ] Eski/alternatif isimler meşruysa `restaurantSchema`'ya `alternateName: [...]` ekle.
- [ ] Tripadvisor ve Google Business Profile adlarını tek bir resmî isimde birleştir (sahiplik talebi + isim düzeltme).

---

## Faz 1 — Yapılandırılmış veri (JSON-LD) iyileştirmeleri

Dosyalar: `src/lib/seo/schema.ts`, `src/app/layout.tsx`, `src/components/pages/*PageBody.tsx`

### 1.1 Schema'ları locale-aware yap

`restaurantSchema()` her dilde TR `description` basıyor; `websiteSchema()` her dilde `inLanguage: 'tr-TR'`.

- Kök layout zaten `x-locale` header'ını okuyor → `restaurantSchema(lang)` / `websiteSchema(lang)` olarak geçir.
- `description` ve `inLanguage` locale'e göre; `@id` (`#restaurant`) tüm dillerde **aynı** kalsın (tek varlık).

### 1.2 Restaurant düğümünü zenginleştir

Eklenecek alanlar (yalnızca doğrulananlar):

- `hasMenu`: `${base}/menu` (Menu düğümünün `@id`'si ile)
- `potentialAction`: `ReserveAction` → `EntryPoint` (`urlTemplate: ${base}/reservations`, `inLanguage`, `actionPlatform`)
- `logo` ve `image` dizisi: 1:1, 4:3, 16:9 oranlarında en az birer gerçek fotoğraf (`public/images/imported/`)
- `founder` / `employee`: `Person` — Şef Simge Manacıoğlu (`@id: ${base}#chef-simge`, `jobTitle`, varsa `sameAs` Instagram)
- `knowsLanguage`: `['tr','en', ...]` — **personelin gerçekten konuştuğu diller** (teyit)
- `paymentAccepted`, `amenityFeature` (bahçe/açık hava oturma vb.) — **teyit**
- `priceRange`: `₺₺₺` yerine gerçek aralık metni daha faydalı (ör. kişi başı ortalama) — **teyit**

Eklenmeyecek: `aggregateRating` / `review`. İşletmenin kendi sitesindeki yorumlar Google'ın yerel işletme rich result'ı için uygun değil (self-serving review) ve manuel işlem riski taşır.

### 1.3 Menu schema'yı tekilleştir

- `menuSchema`'ya `@id: ${base}{localePath('/menu')}#menu`, `inLanguage`, `url` ekle.
- Anasayfadaki `menuSchema` çağrısını kaldır (aynı menü iki URL'de ayrı varlık olarak görünüyor); anasayfa yalnızca Restaurant'tan `hasMenu` referansı taşısın.
- Şarap menüsü: ayrı `MenuSection` olarak aynı Menu'ye ekle (şu an schema'da yok).
- `suitableForDiet` (ör. `VegetarianDiet`) — menü taksonomisinde `Vejetaryen` etiketi var, eşlenebilir.

### 1.4 Doğrulama

- [ ] https://search.google.com/test/rich-results — `/`, `/menu`, `/en/menu`, `/kas-sef-restorani`
- [ ] https://validator.schema.org — tüm düğümler hatasız, tek `#restaurant` varlığı

---

## Faz 2 — Yerel SEO (site dışı)

Bu fazın büyük kısmı kod değil; ama sıralamaya etkisi koddan büyük.

### 2.1 Google Business Profile

- [ ] Sahiplik doğrulaması; isim = sitedeki `siteConfig.name`
- [ ] Birincil kategori: _Akdeniz restoranı_; ikincil: _Türk restoranı_, _Deniz ürünleri restoranı_ (servesCuisine ile uyumlu)
- [ ] Saatler: Pzt–Cmt 17:00–02:00, Pazar kapalı (site ile birebir); sezon kapanışlarında "özel saat"
- [ ] Menü linki → `/menu`, rezervasyon linki → `/reservations`, web sitesi → `https://www.cineocucina.com`
- [ ] Düzenli fotoğraf + gönderi; yorumlara (TR/EN/DE/RU) yanıt

### 2.2 Diğer harita ve dizinler (turist kitlesine göre)

- [ ] **Apple Business Connect** — iPhone kullanan turistler Apple Haritalar'dan arıyor
- [ ] **Yandex Business + Yandex Webmaster** — RU locale'i var, Rus ziyaretçi için kritik (`robots.ts`'deki `host` direktifi zaten Yandex'e yönelik)
- [ ] **Bing Places + Bing Webmaster Tools** — ChatGPT arama sonuçları büyük ölçüde Bing indeksine dayanıyor
- [ ] Tripadvisor sahiplik talebi ve isim düzeltmesi (bkz. 0.5)

### 2.3 Search Console doğrulamaları

`buildMetadata` / kök layout'a `verification` alanı ekle, değerleri env'den oku:

```ts
verification: {
  google: process.env.GOOGLE_SITE_VERIFICATION,
  yandex: process.env.YANDEX_VERIFICATION,
  other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION ?? '' },
},
```

`.env.example` ve README env tablosuna ekle. Sitemap'i üç konsola da gönder.

### 2.4 Eski Wix URL'leri

- [ ] Search Console → "Bulunamadı (404)" raporunda Wix dönemi URL'lerini topla
- [ ] `src/proxy.ts` → `REDIRECTS` haritasına 301 olarak ekle (`/about-1` hem `next.config.ts` hem proxy'de; tek yerde tutulabilir)

---

## Faz 3 — GEO (üretken arama motorları)

### 3.1 AI tarayıcı politikası (`robots.ts`)

Arama/erişim botları ile eğitim botlarını ayır. **Arama botları mutlaka açık olmalı**; eğitim botları işletme kararı.

```ts
rules: [
  { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] },
  // Asistanların canlı arama/alıntı için kullandığı botlar — açık
  { userAgent: ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User',
                'Claude-SearchBot', 'Claude-User'], allow: '/' },
  // Model eğitimi — karar restoranda (varsayılan: açık)
  // { userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'], disallow: '/' },
],
```

- [ ] Coolify önünde Cloudflare varsa: Cloudflare'in "AI botlarını engelle" ayarı arama botlarını da kesebilir — kontrol et.

### 3.2 `/llms.txt`

Benimsenme oranı belirsiz ama maliyeti çok düşük. Elle yazılmış dosya yerine **`siteConfig`'ten üretilen route** olsun ki NAP asla sapmasın:

- `src/app/llms.txt/route.ts` → `text/plain`, `revalidate` ile statik
- İçerik: tek paragraf kimlik (kim, ne, nerede, şef), adres/telefon/saatler, mutfak, rezervasyon politikası, ana sayfaların linkleri (TR + EN), `/kas-sef-restorani`
- `robots.ts`'ye gerek yok; sitemap'e eklenmez

### 3.3 "Alıntılanabilir" içerik

Asistanlar sayfadan kendi başına anlamlı paragrafları çeker.

- Her ana sayfanın **ilk paragrafı** tek başına cevap olsun: "Çi Neo Cucina, Kaş'ın Andifli Mahallesi'nde, Şef Simge Manacıoğlu'nun yönettiği, Akdeniz ve Anadolu mutfağı sunan bir restorandır…" (EN/DE/RU karşılıklarıyla)
- **Pratik bilgiler bloğu** (İletişim veya Rezervasyon sayfasında): saatler, rezervasyon gerekli mi, vejetaryen seçenek, alerjen bilgisi, çocuk, otopark, kıyafet — **yalnızca teyitli olanlar**. Turistlerin asistana sorduğu sorular bunlar.
- Bu blok için `FAQPage` schema (sayfa başına tek FAQPage kuralı korunarak). Not: Google 2023'ten beri FAQ rich result'ı çoğu site için göstermiyor; değeri SERP görünümünden değil, asistanların soru-cevap çiftlerini doğrudan alabilmesinden geliyor.

### 3.4 `/kas-sef-restorani` sayfasını çok dilli yap

En güçlü GEO varlığı şu an yalnızca Türkçe. Kaş'ta arama yapan turistlerin büyük kısmı EN/DE/RU soruyor ("chef restaurant Kaş", "Restaurant Kaş Empfehlung").

- EN ve DE (sonra RU) versiyonları: DeepL taslak + **insan editörlüğü** (ham makine çevirisi AEO metninde zayıf kalır)
- Her dilde yerel arama ifadesine göre slug (ör. `/en/chef-restaurant-kas`, `/de/chefkoch-restaurant-kas`); `TR_ONLY_ROUTES`'tan çıkar, hreflang ile bağla
- `articleSchema` `inLanguage` parametresi zaten var

### 3.5 Görsel alt metinleri

`media-data.ts` alt metinleri yalnızca TR. Görsel arama ve çok modlu asistanlar için alt metinleri locale overlay'e taşı (`pages.*.json` modeli gibi).

### 3.6 Site dışı otorite (GEO'nun asıl kaldıracı)

LLM'ler bir restoranı önerirken büyük ölçüde üçüncü taraf kaynaklara dayanıyor.

- [ ] Kaş/Likya rehberleri, seyahat blogları, yerel basında bahsedilme (DE ve RU seyahat blogları dahil)
- [ ] Google ve Tripadvisor'da yorum hacmi + yanıt oranı
- [ ] Şefin isimle geçtiği röportaj/içerikler → `Person` düğümüne `sameAs` olarak eklenir

---

## Faz 4 — Teknik kontroller

- [ ] `http → https` ve `cineocucina.com → www.cineocucina.com` tek adımlı 301 (Coolify/Traefik). `siteConfig.url` ile aynı host
- [ ] OG: sayfa başına özel görsel opsiyonu (menü sayfası için yemek fotoğrafı) + `og:locale:alternate`
- [ ] OG görsel `alt`'ı locale'e göre (şu an her dilde marka adı)
- [ ] Lighthouse mobil: LCP < 2.5 s (Hero zaten `priority` + `sizes="100vw"`; AVIF/WebP aktif), CLS < 0.1
- [ ] `sitemap.ts`: `/kas-sef-restorani` için `lastModified` olarak `CHEF_RESTAURANT_DATES.modified` kullan (build tarihi yerine)

---

## Restorandan istenecek bilgiler (`docs/backlog/panel-exports-todo.md`'ye ekle)

- RestaurantGuru / Tripadvisor / Wanderlog kayıtlarındaki isimlerin durumu ve resmî isim
- Google Business Profile, Apple Business Connect, Yandex, Bing erişimleri
- Gerçek fiyat aralığı, ödeme yöntemleri, olanaklar (bahçe, otopark vb.), personelin konuştuğu diller
- Sezon açılış/kapanış tarihleri
- Şefin kamuya açık profilleri
- AI eğitim botlarına izin verilip verilmeyeceği kararı

---

## Uygulama sırası

| Sıra | İş                              | Tür         | Efor                                  |
| ---- | ------------------------------- | ----------- | ------------------------------------- |
| 1    | Faz 0.1, 0.2, 0.4               | Kod         | 1 saat                                |
| 2    | Faz 0.3 başlıklar (5 dil)       | Kod + metin | yarım gün                             |
| 3    | Faz 2.1–2.3 profil ve konsollar | Operasyon   | 1–2 gün (doğrulama beklemeleri hariç) |
| 4    | Faz 1 schema                    | Kod         | 1 gün                                 |
| 5    | Faz 3.1, 3.2 robots + llms.txt  | Kod         | 2 saat                                |
| 6    | Faz 0.5 entity temizliği        | Operasyon   | restorana bağlı                       |
| 7    | Faz 3.3–3.5 içerik              | Metin + kod | 2–3 gün                               |
| 8    | Faz 3.6 site dışı               | Sürekli     | —                                     |

---

## Doğrulama

1. `pnpm typecheck && pnpm lint && pnpm build`
2. `curl https://www.cineocucina.com/robots.txt` — `/impressum` disallow'da yok, AI arama botları açık
3. `curl -s https://www.cineocucina.com/en/menu | grep -E 'hreflang|canonical'` — `x-default` → `/en/menu`
4. Bilinmeyen bir URL'de (`/xyz`) `<link rel="canonical">` **yok**
5. Rich Results Test + schema.org validator: tüm sayfalarda tek `#restaurant`, `hasMenu`, `ReserveAction`
6. `curl https://www.cineocucina.com/llms.txt` — adres/telefon `siteConfig` ile birebir

## Ölçüm (aylık)

- Search Console: "Kaş restoran", "Kaş şef restoranı", "restaurant Kaş" sorgularında gösterim / tıklama / ortalama pozisyon (ülke kırılımıyla: TR, DE, GB, RU)
- GBP Insights: harita görüntüleme, yol tarifi, arama tıklaması
- Analitikte `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com`, `gemini.google.com` referral trafiği
- **Prompt testi:** ChatGPT, Perplexity, Gemini, Claude'a aynı 6 soruyu sor ve sonucu kaydet — ör. "Kaş'ta şef restoranı önerir misin?", "Best dinner restaurant in Kaş", "Gutes Restaurant in Kaş mit regionaler Küche". Çi Neo Cucina geçiyor mu, bilgiler (adres, saat, şef) doğru mu?
