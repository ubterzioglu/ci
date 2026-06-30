import { siteConfig } from '@/lib/site-config';

/**
 * Horizontal set of contact + listing links rendered as labelled icon buttons.
 *
 * Each entry pairs an inline SVG symbol with the destination: phone, email and
 * address (intrinsic contact channels) plus the venue's external profiles
 * (Instagram, TripAdvisor, Wanderlog, Restaurant Guru). Icons inherit the
 * footer's ivory tone via `currentColor`; links render only when their source
 * value is present in `siteConfig`, so an unset profile never produces a dead
 * link. Tuned for the dark footer.
 */

interface ContactLink {
  href: string;
  label: string;
  /** External profiles open in a new tab; tel/mailto stay in-page. */
  external?: boolean;
  icon: React.ReactNode;
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': true as const,
};

/** Shared stroke style for the line icons. */
const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const PhoneIcon = (
  <svg {...iconProps}>
    <path
      d="M6.5 4h3l1.2 4-2 1.4a12 12 0 0 0 5.4 5.4l1.4-2 4 1.2v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z"
      {...stroke}
    />
  </svg>
);

const MailIcon = (
  <svg {...iconProps}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2" {...stroke} />
    <path d="m4.5 7 7.5 5.5L19.5 7" {...stroke} />
  </svg>
);

const PinIcon = (
  <svg {...iconProps}>
    <path d="M12 21s6.5-5.4 6.5-10a6.5 6.5 0 0 0-13 0c0 4.6 6.5 10 6.5 10Z" {...stroke} />
    <circle cx="12" cy="11" r="2.3" {...stroke} />
  </svg>
);

const InstagramIcon = (
  <svg {...iconProps}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" {...stroke} />
    <circle cx="12" cy="12" r="3.8" {...stroke} />
    <circle cx="17" cy="7" r="1" fill="currentColor" />
  </svg>
);

const TripAdvisorIcon = (
  <svg {...iconProps}>
    {/* Owl-eyes mark: two ringed circles linked by a beak, on a smile arc. */}
    <circle cx="8" cy="12" r="3.6" {...stroke} />
    <circle cx="16" cy="12" r="3.6" {...stroke} />
    <circle cx="8" cy="12" r="1.1" fill="currentColor" />
    <circle cx="16" cy="12" r="1.1" fill="currentColor" />
    <path d="M9.7 8.7 12 7l2.3 1.7M5 16.5a9 9 0 0 0 14 0" {...stroke} />
  </svg>
);

const WanderlogIcon = (
  <svg {...iconProps}>
    {/* Pin + route dot: a map marker with a travel waypoint. */}
    <path d="M12 21s6-5 6-9.5A6 6 0 0 0 6 11.5C6 16 12 21 12 21Z" {...stroke} />
    <circle cx="12" cy="11.5" r="2" {...stroke} />
  </svg>
);

const GuruIcon = (
  <svg {...iconProps}>
    {/* Award star inside a rosette ring. */}
    <circle cx="12" cy="12" r="8.5" {...stroke} />
    <path d="M12 7.5l1.4 2.9 3.1.4-2.3 2.1.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.1 3.1-.4Z" {...stroke} />
  </svg>
);

export function FooterContactLinks({ className }: { className?: string }) {
  const { contact, social } = siteConfig;

  const links: ContactLink[] = [
    { href: `tel:${contact.phoneE164}`, label: contact.phoneDisplay, icon: PhoneIcon },
    { href: `mailto:${contact.email}`, label: contact.email, icon: MailIcon },
  ];

  if (contact.mapsUrl) {
    links.push({
      href: contact.mapsUrl,
      label: contact.address ?? 'Konum',
      external: true,
      icon: PinIcon,
    });
  }

  if (social.instagram) {
    links.push({ href: social.instagram, label: 'Instagram', external: true, icon: InstagramIcon });
  }
  if (social.tripadvisor) {
    links.push({
      href: social.tripadvisor,
      label: 'Tripadvisor',
      external: true,
      icon: TripAdvisorIcon,
    });
  }
  if (social.wanderlog) {
    links.push({ href: social.wanderlog, label: 'Wanderlog', external: true, icon: WanderlogIcon });
  }
  if (social.restaurantGuru) {
    links.push({
      href: social.restaurantGuru,
      label: 'Restaurant Guru',
      external: true,
      icon: GuruIcon,
    });
  }

  return (
    <ul className={`flex flex-wrap items-center gap-3 ${className ?? ''}`}>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            aria-label={link.label}
            title={link.label}
            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="border-ivory/15 text-ivory/70 hover:text-ivory hover:border-ivory/40 hover:bg-ivory/5 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
          >
            {link.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default FooterContactLinks;
