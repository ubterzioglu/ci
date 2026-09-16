/**
 * Admin panel kullanım kılavuzu içeriği.
 *
 * Her giriş, /admin/guide sayfasında bir akordeon kartı olarak gösterilir.
 * İçerik buradan düzenlenir — sayfa kodu (page.tsx) yalnızca bu listeyi okur.
 * `body` satırları kısa paragraflar; `steps` numaralı adımlar; `tips` ipuçları.
 */

export interface GuideSection {
  /** Akordeon başlığı (sidebar bölüm adıyla aynı tutulur). */
  title: string;
  /** Başlığın altındaki tek satırlık özet. */
  summary: string;
  /** Açılış paragraf(lar)ı. */
  body?: string[];
  /** Sıralı kullanım adımları. */
  steps?: string[];
  /** Ek ipuçları / uyarılar. */
  tips?: string[];
  /** İlk kart açık başlasın mı (yalnızca "Başlarken" için). */
  defaultOpen?: boolean;
}

export const GUIDE_INTRO =
  'Bu sayfa yönetim panelinin nasıl kullanılacağını anlatır. Soldaki menüden ' +
  'her bölüme geçebilir, aşağıdaki başlıklara tıklayarak ilgili adımları ' +
  'görebilirsiniz. Bir şeyden emin değilseniz buraya geri dönün.';

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    title: 'Başlarken',
    summary: 'Panele giriş, genel düzen ve temel mantık.',
    defaultOpen: true,
    body: [
      'Yönetim paneline tek bir ortak parola ile giriş yaparsınız. Çıkış yapmak ' +
        'için sol menünün en altındaki “Çıkış Yap” düğmesini kullanın.',
      'Sol taraftaki menü tüm bölümlere erişim sağlar. Üstteki başlık alanı, o an ' +
        'hangi bölümde olduğunuzu gösterir. Yaptığınız değişiklikler kaydedildiğinde ' +
        'sağ alttan kısa bir bildirim (toast) belirir.',
    ],
    tips: [
      'Değişiklikler anında siteye yansır; kaydetmeden sayfadan ayrılmayın.',
      'Bir işlemden emin değilseniz, kalıcı silme gibi adımlarda onay penceresi çıkar.',
    ],
  },
  {
    title: 'Panel (Genel Bakış)',
    summary: 'Ana ekrandaki canlı sayılar ve özet kartları.',
    body: [
      'Giriş yaptığınızda ilk gördüğünüz ekrandır. Bekleyen rezervasyon sayısı, ' +
        'menü ve galeri durumu gibi canlı özetleri tek bakışta sunar.',
    ],
    steps: [
      'Sol menüden “Panel” bölümüne tıklayın.',
      'Kartlardaki sayılar gerçek zamanlıdır; ayrıntı için ilgili bölüme geçin.',
    ],
  },
  {
    title: 'Rezervasyonlar',
    summary: 'Siteden gelen rezervasyon taleplerini görüntüleme ve yönetme.',
    body: [
      'Müşteriler siteden rezervasyon talebi gönderdiğinde burada listelenir. ' +
        'Her talebin durumunu (bekliyor, onaylandı vb.) güncelleyebilirsiniz.',
    ],
    steps: [
      'Sol menüden “Rezervasyonlar” bölümüne girin.',
      'Üstteki durum filtrelerinden listeyi daraltın (ör. yalnızca bekleyenler).',
      'Bir talebin durumunu güncellemek için ilgili kayıttaki seçimi değiştirin.',
    ],
    tips: ['Yeni talepler en üstte görünür; düzenli olarak kontrol edin.'],
  },
  {
    title: 'Ana Menü',
    summary: 'Kategoriler ve yemekler — ekleme, düzenleme, sıralama.',
    body: [
      'Sitedeki yemek menüsü buradan yönetilir. Önce kategoriler (ör. Başlangıçlar, ' +
        'Ana Yemekler), sonra her kategorinin altındaki yemekler düzenlenir.',
    ],
    steps: [
      'Sol menüden “Ana Menü” bölümüne girin.',
      'Yeni kategori eklemek için kategori formunu kullanın; ad ve sıra verin.',
      'Bir kategoriye yemek eklemek için yemek formunu doldurun: ad, açıklama, fiyat.',
      'Var olan bir kaydı düzenlemek için üzerindeki düzenle seçeneğini kullanın.',
      'Sıralamayı değiştirerek yemeklerin menüde görünme düzenini ayarlayın.',
    ],
    tips: [
      'Fiyatları güncel tutun; değişiklik anında sitedeki menüye yansır.',
      'Bir yemeği geçici olarak gizlemek için pasif yapın, silmek zorunda değilsiniz.',
    ],
  },
  {
    title: 'Şarap Menüsü',
    summary: 'Şarap listesini kategori ve şaraplarla yönetme.',
    body: [
      'Şarap listesi ana menüden ayrı bir bölümdedir ama aynı şekilde çalışır: önce ' +
        'kategori (örn. Beyaz, Kırmızı, Rosé), sonra o kategoriye şarapları eklersiniz.',
      'Siz şarap eklemeden önce sitedeki “Şarap Menüsü” sekmesinde “ekibimize danışın” ' +
        'notu görünür. İlk şarabı eklediğinizde not kalkar, liste görünmeye başlar.',
    ],
    steps: [
      'Sol menüden “Şarap Menüsü” bölümüne girin.',
      'Önce bir kategori ekleyin (örn. “Beyaz Şaraplar”).',
      'Kategoriye şarapları ekleyin: ad, açıklama ve fiyat.',
      'Dört dilde de görünmesi için “Türkçeden Tümünü Çevir” butonunu kullanın.',
      'Çeviriler makine çevirisidir — kaydetmeden önce gözden geçirin.',
    ],
    tips: [
      'Bir şarabı geçici olarak listeden çıkarmak için gizleyin, silmeniz gerekmez.',
      'Fiyatı boş bırakırsanız sitede fiyat yerine “sorunuz” görünür.',
    ],
  },
  {
    title: 'Ana Sayfa Görselleri',
    summary: 'Ana sayfadaki “Atmosfer” galerisi ve sabit görseller.',
    body: [
      'Görsel bölümleri, fotoğrafın türüne göre değil sitedeki SAYFAYA göre ayrılmıştır. ' +
        'Bu bölümdeki her şey ana sayfada görünür.',
      'İki kısım vardır: “Sayfa Görselleri” sayfanın sabit görselleridir (en üstteki büyük ' +
        'görsel, rezervasyon bölümünün arka planı) ve her biri değiştirilir — eklenmez. ' +
        '“Galeri Fotoğrafları” ise sayfanın alt kısmındaki “Atmosfer” bölümüdür; buraya ' +
        'istediğiniz kadar fotoğraf ekleyebilirsiniz.',
    ],
    steps: [
      'Sol menüden “Ana Sayfa Görselleri” bölümüne girin.',
      'Sabit bir görseli değiştirmek için ilgili kartta yeni dosyayı seçip “Görseli Değiştir” deyin.',
      'Galeriye eklemek için yükleme alanından fotoğraf seçin (JPG, PNG, WebP veya AVIF; en çok 8 MB).',
      'Görsele bir alternatif metin (alt) yazın — erişilebilirlik ve SEO için önemli.',
      'İsterseniz sol alta görünecek kısa bir başlık (en çok 40 karakter) ekleyin.',
      'Fotoğrafların görünme sırasını sıralama oklarıyla ayarlayın.',
    ],
    tips: [
      'Her kartın altında o görselin sitede tam olarak nerede çıktığı yazar — değiştirmeden önce okuyun.',
      'En üstteki büyük görsel aynı zamanda “Deneyim” bölümünün arka planıdır; değiştirince ikisi birden değişir.',
      'Hiç dokunmadığınız sabit görsellerde “Kurulum görseli” etiketi görünür.',
      'Yatay (geniş) ve net fotoğraflar grid düzeninde en iyi görünür.',
      'Bir galeri fotoğrafını sildiğinizde hem kayıt hem de dosya kalıcı olarak silinir.',
    ],
  },
  {
    title: 'Hakkımızda Görselleri',
    summary: 'Hakkımızda sayfasındaki ekip fotoğrafları ve şef portresi.',
    body: [
      'Hakkımızda sayfasında görünen her şey buradadır: “Ekibimiz” bölümündeki fotoğraflar ' +
        've şef portresi. Çalışma mantığı Ana Sayfa Görselleri ile aynıdır.',
    ],
    steps: [
      'Sol menüden “Hakkımızda Görselleri” bölümüne girin.',
      'Şef portresini değiştirmek için kartta yeni dosyayı seçip “Görseli Değiştir” deyin.',
      '“Ekibimiz” bölümüne fotoğraf eklemek için yükleme alanını kullanın ve alternatif metnini yazın.',
      'Sıralamayı ayarlayarak fotoğrafların düzenini belirleyin.',
    ],
    tips: [
      'Şef portresi ana sayfadaki şef ve hikâye bölümlerinde de kullanılır; değiştirince orada da değişir.',
    ],
  },
  {
    title: 'Revizyonlar',
    summary: 'Sitede istenen değişiklik/düzeltme taleplerini takip etme.',
    body: [
      'Sitede yapılmasını istediğiniz değişiklikleri buraya kaydedebilir, durumlarını ' +
        'takip edebilir ve üzerine not (yorum) ekleyebilirsiniz. Ekiple iletişim ' +
        'için ortak bir liste gibi çalışır.',
    ],
    steps: [
      'Sol menüden “Revizyonlar” bölümüne girin.',
      'Yeni bir istek için formu açıp talebi yazın.',
      'Var olan bir isteğin altına yorum ekleyerek durumu netleştirin.',
      'İş tamamlandığında talebin durumunu güncelleyin.',
    ],
  },
  {
    title: 'Güncellemeler',
    summary: 'Sitede tamamlanan işler ve sırada bekleyenlerin listesi.',
    body: [
      'Bu bölüm yalnızca okunurdur. “Neler bitti, neler sırada?” sorusuna tek bakışta ' +
        'cevap verir. İçerik geliştirici tarafından güncellenir.',
    ],
  },
];
