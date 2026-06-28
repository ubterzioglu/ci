# Fix List — Yeni Siteye Geçmeden Önce

## 1. Footer copyright
Mevcut public sayfalarda footer “© 2035 by Michael Bolano. Powered and secured by Wix” görünüyor. Yeni sitede kaldırılmalı/değiştirilmeli.

## 2. Şarap menüsü eksik görünüyor
Public menü sayfasında “ŞARAP MENÜSÜ 18:00 23:00” başlığı var ama ürün listesi görünmüyor. Wix panelindeki gerçek şarap menüsü ayrıca CSV/PDF olarak alınmalı.

## 3. İletişim sayfası ayrı route değil
Menüde “İletişim” var ama public parse içinde bağımsız `/contact` sayfası görünmedi; ana sayfadaki contact section gibi duruyor. Yeni sitede ayrı `/contact` oluşturmak daha iyi olur.

## 4. Adres / harita bilgisi eksik
Public içerikte telefon ve email var; açık adres ve Google Maps linki görünmüyor. Yeni site için eklenmeli.

## 5. Rezervasyon formu
Mevcut Wix rezervasyon formu altyapıya bağlı. Yeni sitede WhatsApp/email formu veya özel backend gerekir.

## 6. Dil yapısı
Site Türkçe ağırlıklı ama ana sayfada HOME / ABOUT / MENUS gibi İngilizce section label'lar da var. Yeni sitede TR/EN çift dil düşünülüyorsa i18n yapısı baştan kurulmalı.

## 7. SEO
Her sayfa için title var; meta açıklamalar yeni site için yeniden yazıldı (`content/data/seo.json`). Yayına almadan önce marka tarafından onaylanmalı.

## 8. Görsel hakları
Public sitedeki Wixstatic görsel URLleri asset manifestine alındı. Kullanım hakları sizdeyse yeni projeye indirip optimize ederek kullanılabilir.
