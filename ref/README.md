# Çi Neo Cucina — Wix Content Export Pack

Kaynak site: https://www.cineocucina.com/

Bu paket, public Wix sitesinden çıkarılan içeriklerin AI ile yeni site üretimine uygun hale getirilmiş halidir.

## Klasörler

- `content/pages/` — Sayfa bazlı Markdown içerikler
- `content/data/` — Menü, iletişim, navigasyon ve SEO verileri
- `content/assets/image-assets.json` — Görsel asset URL manifesti
- `assets/images/` — Görseller için hedef klasör; public site görselleri bu pakette binary olarak gömülü değil, URL manifesti ve indirme scripti verildi
- `prompts/` — Claude Code / Cursor / v0 / Lovable gibi araçlara verilecek rebuild promptları
- `audit/` — Yeni siteye geçmeden önce düzeltilmesi önerilen maddeler
- `scripts/` — Görselleri URL manifestinden indirmek için yardımcı dosyalar

## Hızlı kullanım

1. `content/pages` ve `content/data` klasörlerini yeni projeye content kaynağı olarak ekle.
2. Görselleri indirmek için terminalde `bash scripts/download-assets.sh` çalıştır.
3. Yeni siteyi AI ile üretmek için `prompts/claude-code-rebuild-prompt.md` dosyasını kullan.
4. Yayına almadan önce `audit/fix-list.md` içindeki maddeleri kontrol et.

## Not

Wix siteleri doğrudan proje/HTML export olarak taşınmadığı için burada taşınabilir içerik, veri modeli, görsel URL manifesti ve rebuild brief hazırlanmıştır.
