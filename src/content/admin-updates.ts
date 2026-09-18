/**
 * "Güncellemeler" changelog shown read-only inside /admin so the team can
 * follow what has shipped and what is still pending. Edit ENTRIES / PENDING as
 * work lands — newest entry first.
 */

export interface UpdateGroup {
  date: string;
  title: string;
  items: string[];
}

export const UPDATE_ENTRIES: UpdateGroup[] = [
  {
    date: '18 Eylül 2026',
    title: 'Onay maillerinin kopyası gmail adresine düşüyor',
    items: [
      'Misafire “Onayla” dediğinizde giden rezervasyon onay mailinin birebir bir kopyası artık cineo.cucina@gmail.com adresine de geliyor. Misafire ne yazıldığını görmek için panele girmeniz gerekmiyor.',
      'Kopya gizli gönderiliyor (BCC): misafir bu adresi görmüyor ve “Tümünü yanıtla” dediğinde oraya yazamıyor.',
      'Kopyanın gideceği adres sunucu ayarından değiştirilebiliyor; birden fazla adres de yazılabiliyor. Boş bırakılırsa kopya gönderilmiyor.',
      'Zoho gönderim ayarları (hesap, şifre, gönderen adresi) değişmedi.',
    ],
  },
  {
    date: '17 Eylül 2026',
    title: 'Sitedeki iletişim adresi gmail adresine döndü',
    items: [
      'Alt bilgi, iletişim bölümü, künye ve gizlilik sayfasında görünen e-posta adresi cineo.cucina@gmail.com olarak değiştirildi.',
      'Bildirim ve gönderim ayarları (Zoho) olduğu gibi kaldı; sadece sitede yazan adres değişti.',
    ],
  },
  {
    date: '16 Eylül 2026',
    title: 'Rezervasyon kuralları siteye işlendi',
    items: [
      'Rezervasyon saatleri 18:00 – 22:00 arasına alındı. Misafir artık serbest saat yazamıyor; yarım saat aralıklarla hazır saatlerden seçiyor.',
      'Rezervasyonlar en az 2 saat önceden alınıyor. Servis sırasında son dakika gelen ve gözden kaçabilecek talepler böylece engelleniyor.',
      '6 kişi ve üzeri gruplarda form kapanıyor; yerine telefon ve WhatsApp bağlantısı çıkıyor. Masa düzenini birlikte planlayabilmeniz için.',
      'Pazar günleri seçilemiyor; seçilirse “Pazar kapalıyız, özel günler için arayın” mesajı ve iletişim bilgileri görünüyor.',
      'Bu kurallar iletişim sayfasında da, çalışma saatlerinin hemen yanında yazıyor.',
      'Kurallar sunucu tarafında da denetleniyor — formu atlatarak uygun olmayan bir saate rezervasyon yapılamıyor.',
    ],
  },
  {
    date: '16 Eylül 2026',
    title: 'Rezervasyon e-postaları devreye alındı',
    items: [
      'Yeni bir rezervasyon talebi geldiğinde bildirim maili gidiyor. Mailde misafirin adı, tarihi, saati, kişi sayısı, e-postası, telefonu ve notu yer alıyor — geri dönmek için panele girmeniz gerekmiyor.',
      'Maildeki “Yanıtla” düğmesi doğrudan misafire gidiyor.',
      'Bir rezervasyonu “Onayla” dediğinizde misafire otomatik bilgilendirme maili gidiyor (tarih, saat, kişi sayısı ve iletişim bilgileriniz).',
      'Bildirimler hem info@cineocucina.com hem cineo.cucina@gmail.com adresine düşüyor.',
      'Misafirin e-posta adresi yoksa ya da mail gönderilemezse panel bunu açıkça söylüyor — “gitti” sanıp beklemiyorsunuz. Böyle bir durumda rezervasyon yine onaylanmış oluyor.',
      'Aynı rezervasyonu tekrar onaylamak misafire ikinci bir mail göndermiyor.',
      'Sitedeki iletişim adresi info@cineocucina.com olarak güncellendi (alt bilgi, künye ve gizlilik sayfası).',
    ],
  },
  {
    date: '16 Eylül 2026',
    title: 'Şarap menüsü panelden yönetilebiliyor',
    items: [
      'Sol menüye “Şarap Menüsü” bölümü eklendi. Ana menüyle aynı şekilde çalışıyor: önce kategori (örn. Beyaz, Kırmızı, Rosé), sonra şaraplar.',
      'Şaraplar da dört dilde girilebiliyor ve “Türkçeden Tümünü Çevir” butonu burada da çalışıyor.',
      'Siz şarap eklemeden önce sitede eski “ekibimize danışın” notu görünmeye devam ediyor; ilk şarabı eklediğinizde not kalkıp liste görünüyor.',
      'Mevcut yemek menüsü bundan etkilenmedi; iki liste tamamen ayrı yönetiliyor.',
    ],
  },
  {
    date: '16 Eylül 2026',
    title: 'Menü artık dört dilde panelden yönetiliyor',
    items: [
      'Siteye Rusça eklendi: dil menüsünde “Русский” seçeneği ve /ru adresleri yayında. Menü, sayfa içerikleri ve gezinme yazıları Rusçaya çevrildi.',
      'ÖNEMLİ DÜZELTME: Panelden eklediğiniz veya değiştirdiğiniz menü verileri İngilizce, Almanca ve Rusça menülerde görünmüyordu — o diller eski sabit listeyi gösteriyordu. Artık dört dil de panelden besleniyor.',
      'Menüde her ürün adı ve açıklaması için dört ayrı dil kutusu var. Boş bıraktığınız dil Türkçe metni kullanıyor, yani yarım bıraksanız da menü eksiksiz görünüyor.',
      'Her alanın yanında “TR’den çevir”, satır başında da “Türkçeden Tümünü Çevir” butonu var. Çeviri kaydetmede otomatik yapılmıyor; kutuları doldurup size gösteriyor, siz onaylayıp kaydediyorsunuz.',
      'Çeviriler makine çevirisidir — özellikle yemek adlarını kaydetmeden önce gözden geçirin.',
      'Menüdeki “Hesaba %10 servis bedeli eklenecektir” ibaresi kaldırıldı; artık servis bedeli alınmıyor. Yıldızlı (*) ürünlerin ana yemek porsiyonu olduğu notu duruyor. Dört dilde birden kaldırıldı.',
      'Arama motorlarına Rusça sayfalar da bildiriliyor (site haritası ve hreflang etiketleri güncellendi).',
    ],
  },
  {
    date: '16 Eylül 2026',
    title: 'Fotoğraf bölümleri sadeleşti, sabit görseller açıldı',
    items: [
      'Fotoğraf bölümleri artık fotoğrafın türüne göre değil, SAYFAYA göre ayrılıyor: “Ana Sayfa Görselleri” ve “Hakkımızda Görselleri”. Hangisinin nereye gittiği karışmıyor.',
      'Her bölümün başında o sayfaya giden bir önizleme bağlantısı, her fotoğraf kartının altında da o görselin sitede tam olarak nerede çıktığı yazıyor.',
      'Daha önce hiç değiştirilemeyen sabit görseller artık panelden değiştirilebiliyor: ana sayfanın en üstündeki büyük görsel, rezervasyon bölümünün arka planı ve şef portresi.',
      'Bazı görseller birden fazla yerde kullanılıyor (üstteki büyük görsel “Deneyim” bölümünün de arka planı; şef portresi ana sayfada da var). Kartlarda bu yazıyor, değiştirince ikisi birden değişiyor.',
      'Hiç dokunmadığınız bir görselde “Kurulum görseli” etiketi görünüyor, böylece neyin değiştirildiği belli oluyor.',
      'Kullanım kılavuzu (sol menüdeki “Kullanım Kılavuzu”) bütün bu yeni bölümlere göre güncellendi.',
    ],
  },
  {
    date: '30 Haziran 2026',
    title: 'Çok dilli site (Türkçe / İngilizce / Almanca)',
    items: [
      'Site Türkçe’nin yanında İngilizce ve Almanca dillerinde de yayında; her sayfanın dile özel adresi (örn. /en, /de) ve dil değiştirme menüsü eklendi.',
      'Menü ve sayfa içerikleri çeviri dosyalarından besleniyor; aynı içerik üç dilde tek kaynaktan yönetiliyor.',
      'Arama motorları için dile özel hreflang etiketleri eklendi, böylece her ziyaretçi doğru dildeki sayfaya yönlendiriliyor.',
      'Sayfa içerikleri ortak gövde bileşenlerine taşındı; Türkçe ve diğer dillerdeki sayfalar artık aynı düzeni paylaşıyor (bakım kolaylığı).',
    ],
  },
  {
    date: '30 Haziran 2026',
    title: 'Marka görselleri, paylaşım kartı ve galeri iyileştirmeleri',
    items: [
      'Sosyal medyada paylaşımlar için markaya özel paylaşım görseli (1200×630 “ciog.jpg”) eklendi; link paylaşıldığında düzgün önizleme çıkıyor.',
      'Tarayıcı sekmesi simgesi (favicon) yenilendi.',
      'Instagram, Tripadvisor, Wanderlog ve Restaurant Guru profilleri site ayarlarına eklendi (footer ikonlarını besliyor).',
      'Galeri görselleri optimize edildi (WebP’ye dönüştürme script’i) ve yeni galeri fotoğrafları eklendi — daha hızlı yükleme.',
    ],
  },
  {
    date: '30 Haziran 2026',
    title: 'Footer (alt bilgi) yeniden düzenlendi',
    items: [
      'Tüm iletişim ve profil ikonları (telefon, e-posta, konum, Instagram, Tripadvisor, Wanderlog, Restaurant Guru) eşit boyutta tek satır halinde footer’ın üstünde ortalandı.',
      'Restaurant Guru “Recommended 2026” büyük rozeti kaldırıldı; Restaurant Guru artık diğerleriyle aynı boyutta tek bir ikon olarak gösteriliyor.',
      'Menü bağlantıları (Ana Sayfa, Menü, Hakkımızda, Deneyimler, Rezervasyon, İletişim) ikonların altında yan yana, aralarında dikey ayraçlarla dizildi.',
      'İletişim bilgileri (telefon, e-posta, adres) ve çalışma saatleri tek satırda, aralarında dikey ayraçlarla birleştirildi.',
    ],
  },
  {
    date: '29 Haziran 2026',
    title: 'Yönetim paneli (/admin) yayında',
    items: [
      'Supabase Auth ile güvenli giriş (e-posta + şifre) ve yetkili e-posta allowlist koruması.',
      'Rezervasyon talepleri yönetimi: durum akışı (Yeni / Onaylandı / Reddedildi / İptal), sayaç kartlarıyla filtreleme, tıklanabilir telefon ve WhatsApp bağlantıları.',
      'Revizyon istekleri: ekip içi değişiklik talepleri (Kimsin / İstek / Aciliyet 1-10 / Durum), durum akışı ve her isteğin altına yorum yazma.',
      'Bu "Güncellemeler" bölümü: tamamlananlar ve sırada bekleyenler tek bakışta.',
    ],
  },
];

export const UPDATE_PENDING: string[] = [
  'Rusça çevirilerin anadili Rusça biri tarafından gözden geçirilmesi — özellikle yemek adları.',
  'Şarap listesinin panelden girilmesi (sistem hazır, içerik bekleniyor).',
  'Sayfa metinlerinin (Hakkımızda, Deneyimler vb.) panelden düzenlenebilmesi — sonraki faz.',
  'Yönetim paneli şifresinin daha güçlü bir şifreyle değiştirilmesi.',
];
