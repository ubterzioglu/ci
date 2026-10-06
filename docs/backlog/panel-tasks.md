# Panel Görevleri — SEO ve Domain Yönlendirmeleri

Bu dosya, kod dışındaki panel/işletme işlerini listeler. Ajan yapamaz; kullanıcı veya yetkili kişi tarafından yapılmalıdır.

## A1 — Non-www → www 301 yönlendirmesi

**Durum:** ⏳ Bekliyor

**Sorun:** `cineocucina.com` (www'siz) → `www.cineocucina.com` 301 yönlendirmesi yok.

**Çözüm:** Coolify/Traefik panelinde veya DNS seviyesinde:

- `cineocucina.com` için 301 redirect → `https://www.cineocucina.com`
- Bu, SEO equity'yi tek host'a toplar

**Adımlar:**

1. Coolify paneline gir
2. Domain ayarlarında `cineocucina.com` için redirect kuralı ekle
3. Hedef: `https://www.cineocucina.com`, tip: 301 (permanent)
4. Test et: `curl -I https://cineocucina.com` → 301, Location: `https://www.cineocucina.com/`

---

## A2 — HTTP → HTTPS yönlendirmesi

**Durum:** ⏳ Bekliyor

**Sorun:** `http://www.cineocucina.com` ve `http://cineocucina.com` şu an 404 dönüyor.

**Çözüm:** Her iki host için HTTP → HTTPS 301 yönlendirmesi.

**Adımlar:**

1. Coolify/Traefik panelinde HTTP → HTTPS redirect kuralı ekle
2. Test et:
   - `curl -I http://www.cineocucina.com` → 301 veya 308, Location: `https://www.cineocucina.com/`
   - `curl -I http://cineocucina.com` → 301, Location: `https://www.cineocucina.com/`

---

## A3 — Üçüncü taraf platform isim tutarlılığı

**Durum:** ⏳ Bekliyor (restoran teyidi gerekli)

**Sorun:** Farklı platformlarda farklı isimler kullanılıyor:

- Tripadvisor: _Ci Neo Cucina By Mezetaryen_
- Wanderlog: _çi neo cucina by miskin_
- RestaurantGuru: _Muskat-Meze-Bar-Kas_

**Çözüm:** Tüm platformlarda tek resmî isim: **Çi Neo Cucina**

**Adımlar:**

1. Her platformda sahiplik talebi (claim) gönder
2. İsim düzeltmesi talep et: "Çi Neo Cucina"
3. Alternatif isimler `alternateName` olarak schema'ya eklendi (kod tarafı tamamlandı)

---

## A4 — Coolify environment değişkenleri doğrulaması

**Durum:** ⏳ Bekliyor

**Kontrol edilecekler:**

- `NEXT_PUBLIC_SITE_URL` = `https://www.cineocucina.com` (www ile, trailing slash yok)
- Supabase Auth redirect URLs: `https://www.cineocucina.com/**` eklenmiş mi?
- Resend sender domain: `cineocucina.com` doğrulanmış mı?

**Adımlar:**

1. Coolify panelinde environment variables'ı kontrol et
2. Supabase Dashboard → Authentication → URL Configuration
3. Resend Dashboard → Domains → `cineocucina.com` durumu

---

## Doğrulama

Tüm işlemler tamamlandıktan sonra:

```powershell
# A1 — non-www → www
curl.exe -sI https://cineocucina.com/
# Beklenen: 301, Location: https://www.cineocucina.com/

# A2 — http → https
curl.exe -sI http://www.cineocucina.com/
# Beklenen: 301 veya 308, Location: https://www.cineocucina.com/

# Cache-Control (Batch 8 sonrası)
curl.exe -sI https://www.cineocucina.com/ | Select-String "cache-control"
# Beklenen: no-store yok, public max-age var
```

---

## Notlar

- Bu işlemler kod değişikliği gerektirmez
- Deploy sonrası canlı sitede etkili olur
- `siteConfig.url` zaten `https://www.cineocucina.com` — kod tarafı hazır
