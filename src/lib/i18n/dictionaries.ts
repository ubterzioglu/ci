/**
 * i18n/dictionaries.ts — UI-string dictionaries for Çi Neo Cucina
 *
 * Turkish (`tr`) is the canonical source. EN/DE are built by deep-merging the
 * generated overlays from `src/lib/i18n/generated/ui.{en,de,ru}.json` (written by
 * `pnpm i18n:translate`, DeepL) over the TR base, so any string not yet
 * translated falls back to Turkish rather than shipping wrong or empty text.
 */

import type { Locale } from './config';
import { defaultLocale } from './config';
import uiEn from './generated/ui.en.json';
import uiDe from './generated/ui.de.json';
import uiRu from './generated/ui.ru.json';

// ---------------------------------------------------------------------------
// Dictionary shape
// ---------------------------------------------------------------------------

export interface Dictionary {
  nav: {
    home: string;
    menu: string;
    about: string;
    experiences: string;
    reservations: string;
    contact: string;
  };
  cta: {
    reserve: string;
  };
  common: {
    phone: string;
    email: string;
  };
  home: {
    storyEyebrow: string;
    readFullStory: string;
    experienceEyebrow: string;
    experienceTitle: string;
    discoverExperience: string;
    menuEyebrow: string;
    menuTitle: string;
    goToPage: string;
    viewFullMenu: string;
    reservationTitle: string;
    galleryTitle: string;
  };
  pages: {
    menu: {
      eyebrow: string;
      intro: string;
      tabAria: string;
      mainTab: string;
      wineTab: string;
      allergens: string;
    };
    contact: { eyebrow: string; title: string; intro: string };
    reservations: {
      eyebrow: string;
      title: string;
      intro: string;
      largeGroupsPrefix: string;
      largeGroupsSuffix: string;
    };
    experiences: {
      title: string;
      intro: string;
      cardTitle: string;
      contactText: string;
      contactCta: string;
    };
  };
  contactSection: {
    eyebrow: string;
    title: string;
    contact: string;
    location: string;
    addressFallback: string;
    hoursFallback: string;
    openingDays: string;
    reservation: string;
  };
  forms: {
    contact: {
      successTitle: string;
      successBody: string;
      fullName: string;
      subject: string;
      message: string;
      pending: string;
      submit: string;
      validationError: string;
      submitError: string;
    };
    reservation: {
      successTitle: string;
      successBody: string;
      fullName: string;
      partySize: string;
      largePartyTitle: string;
      largePartyBody: string;
      date: string;
      time: string;
      selectTime: string;
      sundayTitle: string;
      sundayBody: string;
      noteLabel: string;
      notePlaceholder: string;
      pending: string;
      submit: string;
      validationError: string;
      submitError: string;
    };
  };
  a11y: {
    languageSelection: string;
    mainNavigation: string;
    mobileNavigation: string;
    openMenu: string;
    closeMenu: string;
    footerNavigation: string;
    skipToContent: string;
    backToTop: string;
  };
  footer: {
    tagline: string;
    rights: string;
    impressum: string;
    privacy: string;
  };
}

// ---------------------------------------------------------------------------
// Dictionaries
// ---------------------------------------------------------------------------

/** Canonical Turkish UI strings — the source for translation. */
const tr: Dictionary = {
  nav: {
    home: 'Ana Sayfa',
    menu: 'Menü',
    about: 'Hakkımızda',
    experiences: 'Deneyimler',
    reservations: 'Rezervasyon',
    contact: 'İletişim',
  },
  cta: {
    reserve: 'Rezervasyon Talep Et',
  },
  common: {
    phone: 'Telefon',
    email: 'E-posta',
  },
  home: {
    storyEyebrow: 'Hikâyemiz',
    readFullStory: 'Hikâyenin tamamını okuyun →',
    experienceEyebrow: 'Deneyim',
    experienceTitle: 'Sofranın Ötesinde',
    discoverExperience: 'Deneyimi Keşfet →',
    menuEyebrow: 'Soframız',
    menuTitle: 'Menümüzden Bir Tat',
    goToPage: 'Sayfaya Git →',
    viewFullMenu: 'Tüm Menüyü Görüntüle',
    reservationTitle: 'Masamızda yeriniz hazır',
    galleryTitle: 'Atmosfer',
  },
  pages: {
    menu: {
      eyebrow: 'Soframız',
      intro:
        'Mevsiminde malzemeyle, sade ama derin tatlar. Üç başlıkta toplanan menümüz topraktan, denizden ve otlaktan ilham alır.',
      tabAria: 'Menü seçimi',
      mainTab: 'Ana Menü',
      wineTab: 'Şarap Menüsü',
      allergens: 'Alerjenler',
    },
    contact: {
      eyebrow: 'Bize Yazın',
      title: 'İletişim',
      intro:
        'Sorularınız, özel etkinlik talepleriniz veya geri bildirimleriniz için bize mesaj bırakın.',
    },
    reservations: {
      eyebrow: 'Masanızı Ayırtın',
      title: 'Rezervasyon Talep Edin',
      intro:
        'Ayrıntıları paylaşın; sizin için en uygun yeri bulmaya çalışalım. Talebinizi aldıktan sonra en kısa sürede sizinle iletişime geçeceğiz.',
      largeGroupsPrefix: 'Büyük gruplar ve özel etkinlikler için',
      largeGroupsSuffix: 'numarasından bize ulaşabilirsiniz.',
    },
    experiences: {
      title: 'Deneyimler',
      intro:
        'Şu an için takvimimizde yayında olan özel bir deneyim bulunmuyor. Chef’s Table ve özel etkinlikleri talebe göre hazırlıyoruz.',
      cardTitle: 'Sizin için özel bir akşam tasarlayalım',
      contactText:
        'Chef’s Table, özel menüler ve kapalı etkinlikler için ekibimizle iletişime geçin.',
      contactCta: 'İletişime Geç',
    },
  },
  contactSection: {
    eyebrow: 'Bize Ulaşın',
    title: 'İletişim & Konum',
    contact: 'İletişim',
    location: 'Konum',
    addressFallback: 'Tam adres ve yol tarifi için lütfen bizi arayın.',
    hoursFallback: 'Güncel çalışma saatlerimiz için bizimle iletişime geçebilirsiniz.',
    openingDays: 'Pazartesi – Cumartesi',
    reservation: 'Rezervasyon',
  },
  forms: {
    contact: {
      successTitle: 'Mesajınız gönderildi',
      successBody: 'Mesajınız bize ulaştı. En kısa sürede yanıt vereceğiz.',
      fullName: 'Ad Soyad',
      subject: 'Konu',
      message: 'Mesaj',
      pending: 'Gönderiliyor…',
      submit: 'Mesaj Gönder',
      validationError: 'Lütfen formdaki hataları düzeltin.',
      submitError: 'Mesajınız gönderilemedi. Lütfen telefonla iletişime geçin.',
    },
    reservation: {
      successTitle: 'Talebiniz alındı',
      successBody:
        'Rezervasyon talebinizi aldık. En kısa sürede sizinle iletişime geçeceğiz.',
      fullName: 'Ad Soyad',
      partySize: 'Kişi Sayısı',
      largePartyTitle: 'Kalabalık gruplar için sizi arayalım',
      largePartyBody:
        '{count} kişi ve üzeri gruplarda masa düzenini birlikte planlamamız gerekiyor. Lütfen bizimle iletişime geçin.',
      date: 'Tarih',
      time: 'Saat',
      selectTime: 'Saat seçin',
      sundayTitle: 'Pazar günleri kapalıyız',
      sundayBody:
        'Özel günlerde duruma göre açıyoruz. Pazar için bir planınız varsa lütfen bizi arayın.',
      noteLabel: 'Notunuz (isteğe bağlı)',
      notePlaceholder: 'Özel istek, alerji bilgisi vb.',
      pending: 'Gönderiliyor…',
      submit: 'Rezervasyon Talep Et',
      validationError: 'Lütfen formdaki hataları düzeltin.',
      submitError: 'Talebiniz kaydedilemedi. Lütfen telefonla iletişime geçin.',
    },
  },
  a11y: {
    languageSelection: 'Dil seçimi',
    mainNavigation: 'Ana menü',
    mobileNavigation: 'Mobil menü',
    openMenu: 'Menüyü aç',
    closeMenu: 'Menüyü kapat',
    footerNavigation: 'Alt menü',
    skipToContent: 'İçeriğe geç',
    backToTop: 'Başa dön',
  },
  footer: {
    tagline: 'Doğal malzemeler, zamansız bir mutfak dili.',
    rights: 'Tüm hakları saklıdır.',
    impressum: 'İmpressum',
    privacy: 'Gizlilik',
  },
};

type DictionaryOverlay = {
  [K in keyof Dictionary]?: Partial<Dictionary[K]>;
};

/** Build a locale dictionary by overlaying translated strings over TR. */
function withOverlay(overlay: DictionaryOverlay): Dictionary {
  return {
    nav: { ...tr.nav, ...overlay.nav },
    cta: { ...tr.cta, ...overlay.cta },
    common: { ...tr.common, ...overlay.common },
    home: { ...tr.home, ...overlay.home },
    pages: {
      menu: { ...tr.pages.menu, ...overlay.pages?.menu },
      contact: { ...tr.pages.contact, ...overlay.pages?.contact },
      reservations: { ...tr.pages.reservations, ...overlay.pages?.reservations },
      experiences: { ...tr.pages.experiences, ...overlay.pages?.experiences },
    },
    contactSection: { ...tr.contactSection, ...overlay.contactSection },
    forms: {
      contact: { ...tr.forms.contact, ...overlay.forms?.contact },
      reservation: { ...tr.forms.reservation, ...overlay.forms?.reservation },
    },
    a11y: { ...tr.a11y, ...overlay.a11y },
    footer: { ...tr.footer, ...overlay.footer },
  };
}

export const dictionaries: Record<Locale, Dictionary> = {
  tr,
  en: withOverlay(uiEn as DictionaryOverlay),
  de: withOverlay(uiDe as DictionaryOverlay),
  ru: withOverlay(uiRu as DictionaryOverlay),
};

// ---------------------------------------------------------------------------
// Accessor
// ---------------------------------------------------------------------------

/**
 * Returns the dictionary for the given locale, falling back to Turkish if
 * the locale is not found (should not happen when callers use `isLocale()`).
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
