# Çi Neo Cucina — SEO, Clean Code ve Docs Planı

Tarih: 2026-10-06 · Repo: `C:\temp_private\ci` · Hedef okuyucu: bu planı uygulayacak kodlama ajanı (Qwen).

Görünür çıktıyı değiştirmeden SEO/GEO açıklarını kapatmayı, kodu temizlemeyi ve dokümanları düzenlemeyi anlatır. İş küçük batch'lere bölünmüştür:

- **Bölüm 1 (onay gerektirmez):** Batch 1–6'yı ajan tek başına, sırayla yapar.
- **Bölüm 2 (onay gerekir):** Batch 7–12 için ajan her batch'ten önce kullanıcıya sorar, cevap gelmeden başlamaz.
- **Bölüm 3:** Ajan hiçbir test çalıştırmaz. Testleri kullanıcı en sonda kendisi çalıştırır; ajan yalnızca komutları verir.

## Değişmez kurallar

Front end hiçbir koşulda değişmez: `src/components/**`, `src/app/globals.css` ve tüm sayfa/admin JSX–markup dondurulmuştur. Admin paneli arayüzü de bu kapsamdadır; admin bileşenlerinde yalnızca JSX dışı mantık (state, handler, yardımcı fonksiyon) başka dosyaya taşınabilir.

1. **Test çalıştırma yasak.** Ajan `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build`, `pnpm start`, `pnpm dev` komutlarını **çalıştırmaz**. Kodu dikkatle okuyarak değiştirir; emin olamadığı değişikliği yapmaz ve rapora yazar.
2. Başlamadan önce `git status` temiz olmalı. `git switch -c chore/seo-cleanup-docs` ile yeni dal aç. `main`'e doğrudan commit yok.
3. Her batch ayrı commit. Commit biçimi: `<type>: <açıklama>` (feat, fix, refactor, docs, test, chore, perf, ci). `git push` yapma; önce kullanıcıya sor.
4. Refactor batch'lerinde (3, 4, 5) çıktı birebir aynı kalmalıdır: üretilen `<title>`, `<meta>`, canonical, hreflang, JSON-LD ve görünür HTML. Davranış değişikliği gerektiren bir şey görürsen yapma, rapora yaz.
5. **Uydurma bilgi yok.** Restorandan gelmesi gereken veri doğrulanmadan schema'ya eklenmez; `docs/backlog/panel-exports-todo.md` dosyasına yazılır. `aggregateRating` / `review` eklenmez.
6. `.env.local` dosyasını okuma, commit'leme veya çıktıya yazma.
7. Tabloda/batch'te yazmayan dosyayı silme veya taşıma.

---

# Bölüm 1 — Onay gerektirmeyen batch'ler

## Batch 1 — Docs yeniden düzeni

Hedef ağaç:

```
docs/
  README.md           indeks (yeniden yazılır)
  architecture/       kod haritası, i18n akışı, içerik/DB akışı, SEO modülü (yeni)
  guides/             deployment-coolify.md, qr-menu.md
  seo/                seo-geo-plan.md, seo-geo-audit-2026-10-06.md
  plans/              seo-cleanup-docs-plan.md (bu dosya)
  backlog/            panel-exports-todo.md
  archive/            handovers/, ref/ (Wix göçü), migration-notes.md
```

| Mevcut yol                   | Yeni yol                             | Not                                                          |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------------ |
| `docs/deployment-coolify.md` | `docs/guides/deployment-coolify.md`  | Geçici domain notunu güncel tut                              |
| `docs/qr-menu.md`            | `docs/guides/qr-menu.md`             |                                                              |
| `docs/panel-exports-todo.md` | `docs/backlog/panel-exports-todo.md` |                                                              |
| `docs/handovers/01–05`       | `docs/archive/handovers/`            | `notyetbro.club` geçen yerlerin başına "tarihsel kayıt" notu |
| `docs/ref/**`                | `docs/archive/ref/`                  | Wix göçü referansı                                           |
| `docs/migration-notes.md`    | `docs/archive/migration-notes.md`    |                                                              |

`git mv` kullan (geçmiş korunur). Taşıdıktan sonra tüm iç bağlantıları tara ve güncelle: `grep -rn "docs/" README.md docs`. `docs/README.md` yeni ağacı gösteren bir indeks olarak yeniden yazılır.

## Batch 2 — SEO dokümanlarını yerleştir ve eski kalıntıları temizle

1. Kökteki `1790948337026-seo-geo (1).md` (git'e eklenmemiş) → `docs/seo/seo-geo-plan.md`. Başına bir durum tablosu ekle: commit `9b09368` ile hangi maddeler uygulandı (maddeleri `git show 9b09368 --stat` ve koddan doğrula, tahmin etme).
2. `.kilo/plans/…french-locale.md` → `docs/archive/french-locale-plan.md` (`git mv`). `.kilo/` satırını `.gitignore`'a ekle.
3. `.env.example` ve `src/lib/site-config.ts` içinde kalan geçici domain (`notyetbro.club`) yorumlarını kaldır. Kodun davranışı değişmez, yalnızca yorum/örnek metin.

## Batch 3 — Metadata tekrarını kaldır (refactor, çıktı aynı kalır)

`src/app/(site)/*/page.tsx` (TR) ile `src/app/[lang]/(site)/*/page.tsx` aynı metadata kodunu 12 dosyada tekrarlıyor.

1. `src/lib/seo/` altına `buildPageMetadata(slug, locale)` çıkar. Mevcut `buildMetadata` ve `seoTitle` çağrılarını sarmalar.
2. Sayfa dosyaları bu fonksiyonu çağırsın.
3. Türkçe sayfalardaki sabit yazılmış açıklamaları `src/content/` altına **aynı metinle** taşı; hiçbir kelime değişmesin.
4. Üretilen `<title>`, `<meta description>`, canonical ve hreflang birebir aynı kalmalı.

## Batch 4 — `src/lib/seo/schema.ts` bölme (refactor, çıktı aynı kalır)

`schema.ts` 307 satır. Şuna böl: `src/lib/seo/schema/{restaurant,website,menu,faq,article,breadcrumb}.ts` ve bir `index.ts` barrel. Dışarıya import yolu (`@/lib/seo/schema`) değişmesin; export isimleri aynı kalsın. JSON-LD çıktısı bayt bayt aynı kalmalı. İçerik değişikliği (A3/A4) bu batch'te **yapılmaz**.

## Batch 5 — Admin bileşenlerinden mantığı çıkar (JSX'e dokunma)

Dosyalar: `src/app/admin/(panel)/menu/MenuClient.tsx` (648 satır), `src/app/admin/(panel)/revisions/RevisionsClient.tsx` (432), `src/components/admin/PhotoLibrary.tsx` (378).

1. Yalnızca JSX dışı mantığı (saf yardımcı fonksiyonlar, hesaplamalar, sabitler) `src/lib/admin/` altına veya yanındaki `*.helpers.ts` dosyalarına taşı.
2. Hook'a çıkarmak markup'ı veya render sırasını değiştirebilecekse o parçayı **atla** ve rapora yaz.
3. Hiçbir `className`, JSX öğesi veya prop değişmez.

## Batch 6 — Tekrarlı iş mantığı incelemesi

`src/app/actions.ts` ile `src/app/api/contact/route.ts` ve `src/app/api/reservation/route.ts` doğrulama/e-posta mantığını tekrar ediyor mu? Ediyorsa ortak kısmı `src/lib/` altına çıkar (davranış aynı). Etmiyorsa dokunma ve nedenini commit mesajına yaz.

Ek: `CONTRIBUTING.md` ekle (front end dondurma kuralı, doğrulama komutları, commit biçimi). Kök `README.md` içinde Fransızca (FR) eksik (TR, EN, DE, RU yazıyor): ekle; uzun bölümleri `docs/` altına bağla, kökte hızlı başlangıç bırak.

---

# Bölüm 2 — Onay gerektiren batch'ler

Ajan her batch'ten **önce** ne yapacağını bir paragrafta özetler ve kullanıcıdan açık onay alır. Onay gelmeden başlamaz.

## Batch 7 — Schema içerik değişiklikleri (A3 + A4)

Dosyalar: `src/lib/seo/schema/*`, `src/app/layout.tsx`.

- **A3:** Restaurant JSON-LD'yi yalnızca anasayfada tam yayınla; diğer sayfalarda `@id: …#restaurant` ile referans ver. Şu an anasayfada 6, `/kas-sef-restorani`'de 8 JSON-LD bloğu var.
- **A4:** RestaurantGuru (`Muskat-Meze-Bar-Kas`) ve Wanderlog (`by miskin`) kayıtları bu restorana ait (kullanıcı teyit etti); `sameAs`'tan **kaldırılmaz**. Eski/alternatif adlar (`by Mezetaryen`, `by miskin`, `Muskat Meze Bar`) `alternateName` dizisine eklenir.

## Batch 8 — Önbellek stratejisi (A5)

Herkese açık sayfalar `Cache-Control: private, no-store` gönderiyor. `revalidate`/ISR dene; admin işlemlerinde `revalidatePath`/`revalidateTag` ile güncelle. Admin ve `/api` hariç. Bu değişiklik admin'de yapılan içeriğin sitede ne zaman göründüğünü etkiler; kullanıcı kabul edilebilir gecikmeyi (örn. 60 sn) onaylar.

## Batch 9 — hreflang ve robots (A6 + A7)

- **A6:** `/kas-sef-restorani` Türkçe-only ama HTML'de hreflang var. Kaynağı bul (`src/lib/seo/metadata.ts`, sayfa dosyası). Yalnızca gerçekten çevirisi olan sayfalar hreflang yayınlamalı. Kararı kullanıcıya sun, onayla uygula.
- **A7:** Model eğitimi tarayıcıları (`GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot`) için `src/app/robots.ts` politikasını kullanıcı belirler. Şu an adları geçmiyor, yani varsayılan olarak izinli. Cevap gelmeden dosya değişmez.

## Batch 10 — Ölü kod temizliği

Ajan `knip` veya `depcheck` analizinin önerdiği silme listesini **kanıtıyla** kullanıcıya sunar (analiz aracını yalnızca okuma amaçlı çalıştırmak serbest, test sayılmaz). Onaylanan her silme ayrı commit.

## Batch 11 — Disk temizliği (repo dışı)

- `.kilo/worktrees/real-zenith/` (eski site kopyası, git'te izlenmiyor) silinsin mi?
- `wix/` (207 MB) ve `wix-export/` repo dışına (örn. `..\ci-archive\`) taşınsın mı?

## Batch 12 — İçerik ve panel işleri

- About/Experiences sayfalarına soru başlıklı kısa cevap blokları ve görünür "son güncelleme" tarihi (görünür değişiklik; kullanıcı metni onaylar).
- **A1:** `cineocucina.com` → `www.cineocucina.com` 301 yönlendirmesi. Kod değil, Coolify/Traefik veya DNS paneli. Ajan yapamaz; kullanıcıya adım adım talimat yazar.
- **A2:** `http://` → `https://` yönlendirmesi (her iki host). Şu an `http://` 404 dönüyor. Aynı şekilde panel işi.
- Tripadvisor, Google Business Profile, Wanderlog ve RestaurantGuru adını tek resmî ada çekmek (panel/dış iş).
- Coolify `NEXT_PUBLIC_SITE_URL`, Supabase Auth yönlendirme URL'leri ve Resend gönderen domaini panelde doğrulanır.

---

# Bölüm 3 — Testler (EN SON, kullanıcı çalıştırır)

Ajan tüm batch'ler bitince bu bölümü kullanıcıya **komut listesi olarak** verir ve çalıştırmaz. Kullanıcı kendi terminalinde çalıştırıp sonucu ajana yapıştırır.

## 3.1 Kod kapıları

```powershell
cd C:\temp_private\ci
pnpm install
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
```

Hepsi hatasız bitmeli. `format:check` hata verirse `pnpm format` çalıştırılıp diff incelenir.

## 3.2 Çıktı karşılaştırması (refactor sonrası HTML aynı mı?)

Referans olarak canlı site (şu anki üretim) kullanılır; yerel build ile karşılaştırılır. Birinci terminalde sunucuyu başlat: `pnpm start` (port 3000). İkinci terminalde:

```powershell
$base="https://www.cineocucina.com"; $local="http://localhost:3000"
$urls = (Invoke-RestMethod "$base/sitemap.xml").urlset.url.loc
New-Item -ItemType Directory -Force .omc\diff\live,.omc\diff\local | Out-Null
$i=0
foreach($u in $urls){ $i++; $p=([uri]$u).AbsolutePath
  foreach($pair in @(@($base,"live"),@($local,"local"))){
    $h=(curl.exe -s "$($pair[0])$p") -join "`n"
    $h=$h -replace '/_next/[^"'' ]+','/_next/X' -replace 'nonce="[^"]*"','' -replace '"b":"[^"]*"',''
    Set-Content ".omc\diff\$($pair[1])\$i.html" $h -Encoding UTF8 } }
foreach($n in 1..$i){ if((Get-FileHash ".omc\diff\live\$n.html").Hash -ne (Get-FileHash ".omc\diff\local\$n.html").Hash){ "FARK: sayfa $n -> $($urls[$n-1])" } }
```

Beklenen: Batch 1–6 sonrası **fark yok**. Batch 7–9 bilerek `<head>`/JSON-LD'yi değiştirir; fark yalnızca o alanlarda olmalı. Fark çıkarsa `Compare-Object (gc .omc\diff\live\N.html) (gc .omc\diff\local\N.html)` ile incele ve sonucu ajana ilet.

## 3.3 Canlı kontroller (yönlendirme ve önbellek, deploy sonrası)

```powershell
curl.exe -sI https://cineocucina.com/            # beklenen: 301, Location: https://www.cineocucina.com/
curl.exe -sI http://www.cineocucina.com/          # beklenen: 301 veya 308 (şu an 404)
curl.exe -sI https://www.cineocucina.com/ | Select-String "cache-control"   # beklenen: no-store yok
curl.exe -s https://www.cineocucina.com/robots.txt
```

JSON-LD için Rich Results Test (`https://search.google.com/test/rich-results`): `/`, `/menu`, `/en/menu`, `/kas-sef-restorani`.

## Bitiş kriterleri

1. Bölüm 3.1'deki tüm komutlar hatasız.
2. 3.2'de Batch 1–6 için sayfa farkı yok.
3. Her batch ayrı commit; `git status` temiz.
4. Onay beklenen veya yapılamayan işler (Batch 7–12, panel işleri) kullanıcıya açık madde olarak raporlanmış.
5. `git push` yalnızca kullanıcının açık onayıyla.
