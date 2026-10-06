# SEO + GEO Denetimi — 2026-10-06

Kapsam: canlı site `https://www.cineocucina.com` (/, /en, /menu, /kas-sef-restorani, robots.txt, sitemap.xml, llms.txt).
Yöntem: HTML'den elle çıkarım. Core Web Vitals ve platform bazlı AI görünürlüğü **ölçülmedi**; skorlar gözleme dayalı değerlendirmedir.

## Skor

**SEO sayfa skoru: ~84/100**

| Alan | Skor | Kanıt |
|---|---|---|
| On-page | 88 | Başlık/açıklama locale başına benzersiz ve "Kaş" anahtar kelimesini içeriyor; sayfa başına tek H1; canonical doğru; `x-default` EN'e gidiyor. |
| İçerik | 72 | Anasayfa ~520–630 kelime, `/kas-sef-restorani` ~1.330, `/menu` HTML'inde yalnızca ~140 kelime (yemekler büyük olasılıkla sunucu HTML'inde yok; JSON-LD'de var). |
| Teknik | 85 | SSR, hreflang'li sitemap, doğru 404. Tüm sayfalar `Cache-Control: private, no-store`. Apex→www ve http→https yönlendirmesi yok (aşağıya bak). |
| Schema | 85 | Restaurant, Menu, ReserveAction, Person, BreadcrumbList, FAQPage, Article var. Restaurant grafiği her sayfada tekrarlanıyor; `sameAs` içinde isim tutarsızlığı. |
| Görseller | 80 | Alt'ı boş 2 görsel dekoratif (`aria-hidden`), sorun değil. Dosya boyutları kontrol edilmedi. |

**GEO hazırlığı: ~71/100**

| Alan | Skor |
|---|---|
| Alıntılanabilirlik | 70 |
| Yapısal okunabilirlik | 72 |
| Çoklu ortam | 60 |
| Otorite / marka | 62 |
| Teknik erişim | 90 |

AI tarayıcı erişimi (her biri ayrı):
- Arama alıntılanabilirliği: `OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot` izinli.
- Kullanıcı tetikli: `ChatGPT-User`, `Perplexity-User`, `Claude-User` izinli.
- Model eğitimi: `GPTBot`, `ClaudeBot`, `Google-Extended`, `CCBot` robots.txt'te adı geçmiyor → varsayılan olarak izinli. Lisans tercihi; görünürlükle ilgisi yok.
- `llms.txt` mevcut. Google için etkisi yok; skora ağırlık verilmedi.

## Bulgular (öncelik sırasıyla)

### Yüksek
1. **Apex domain yönlendirmesi yok.** `https://cineocucina.com/` 200 dönüyor ve `www` ile aynı içeriği sunuyor (canonical `www`'ya işaret ediyor ama 301 yok).
2. **`http://` her iki hostta 404.** HTTP→HTTPS yönlendirmesi görünmüyor (kontrol: `curl`, 2026-10-06). Coolify/Traefik veya Cloudflare ayarı.
3. **Varlık adı tutarsızlığı.** `sameAs` içinde RestaurantGuru (`Muskat-Meze-Bar-Kas`) ve Wanderlog (`by miskin`) kayıtları marka adıyla uyuşmuyor. Restorandan teyit gerekli.
4. **`no-store` önbellek politikası.** Herkese açık sayfalar CDN'de önbelleğe alınamıyor (anasayfa TTFB'si ~0,8 sn).

### Orta
5. Restaurant JSON-LD her sayfada tam olarak tekrarlanıyor (anasayfada 6, `/kas-sef-restorani`'de 8 blok). Diğer sayfalarda `@id` referansı yeterli.
6. İçerik sayfalarında görünür güncelleme tarihi ve yazar/şef künyesi yok.
7. `/kas-sef-restorani` Türkçe-only olduğu halde HTML'de hreflang görünüyor; kaynağı doğrulanacak.
8. `/menu` yemek metni sunucu HTML'inde zayıf (front end değişmeyeceği için yalnızca schema tarafı güçlendirilebilir).

### Düşük
9. Soru-başlıklı bölümler yalnızca `/kas-sef-restorani`'de var; About/Experiences'a eklenebilir.
10. Video / Instagram-YouTube içeriği sayfalara bağlı değil.

## Eski domain (notyetbro.club) izleri

- Canlı sitede iz **yok**: canonical, sitemap, robots, llms.txt hepsi `www.cineocucina.com`. `notyetbro.club` artık yanıt vermiyor.
- Kodda iz yok: `src/lib/site-config.ts` fallback'i `www.cineocucina.com`.
- Kalan izler yalnızca dokümantasyonda: `docs/archive/handovers/01–05`, `docs/guides/deployment-coolify.md` (geçmiş kayıt olarak kalabilir).
- Bayat kopya: `.kilo/worktrees/real-zenith/` içinde eski `site-config.ts` ve eski docs var. Repo içinde ve git takibinde değil ama diskte duruyor; temizlenebilir.
- Doğrulanmamış panel kontrolleri: Coolify `NEXT_PUBLIC_SITE_URL`, Supabase Auth yönlendirme URL'leri, Resend gönderen domaini.

## Sonraki adımlar

Bkz. oturumdaki plan: (1) yönlendirme ve önbellek düzeltmeleri, (2) schema tekilleştirme, (3) clean-code refactor (front end'e dokunmadan), (4) `docs/` yeniden düzeni.
