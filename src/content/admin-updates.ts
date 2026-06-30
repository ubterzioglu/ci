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
  'Sayfa içerikleri ve menü yönetimi (panelden düzenleme) — sonraki faz.',
  'Medya ve site ayarları yönetimi — sonraki faz.',
  'Şifre sıfırlama e-postaları için özel SMTP kurulumu (markalı, Türkçe şablon).',
];
