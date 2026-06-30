/**
 * Restaurant Guru "Recommended 2026" award badge.
 *
 * Reimplemented from the awards.infcdn.net embed as a self-contained SVG so we
 * don't load a render-blocking third-party stylesheet or rely on an inline
 * onclick handler. The circular text paths (restaurant name on the bottom arc,
 * "Recommended" on the top arc) mirror the original; colors are tuned for the
 * dark footer (ivory/terracotta) instead of the embed's black-on-white.
 *
 * Links out to the venue's Restaurant Guru page (kept verbatim from the embed).
 */

const GURU_URL = 'https://restaurantguru.com/Muskat-Meze-Bar-Kas';
const VENUE_NAME = 'Çi neo cucina by mezetaryen';
const AWARD_YEAR = '2026';

export function RestaurantGuruBadge({ className }: { className?: string }) {
  return (
    <a
      href={GURU_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${VENUE_NAME} — Restaurant Guru ${AWARD_YEAR} Recommended`}
      className={`group inline-flex shrink-0 transition-opacity hover:opacity-90 ${className ?? ''}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width="120"
        height="120"
        role="img"
        aria-hidden="true"
      >
        <defs>
          {/* Bottom arc — venue name */}
          <path id="guru-name-arc" d="M 23 100 a 77 77 0 0 0 154 0" />
          {/* Top arc — "Recommended" */}
          <path id="guru-nom-arc" d="M 30 100 a 70 70 0 1 1 140 0" />
        </defs>

        {/* Outer + inner rings */}
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ivory/30" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" className="text-ivory/20" />

        {/* Curved labels */}
        <text fill="currentColor" textAnchor="middle" className="fill-ivory" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
          <textPath href="#guru-name-arc" startOffset="50%">
            {VENUE_NAME}
          </textPath>
        </text>
        <text fill="currentColor" textAnchor="middle" className="fill-ivory/80" style={{ fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          <textPath href="#guru-nom-arc" startOffset="50%">
            Recommended
          </textPath>
        </text>

        {/* Center: year + laurel-style stars */}
        <text x="100" y="96" textAnchor="middle" className="fill-terracotta" style={{ fontSize: '28px', fontWeight: 700 }}>
          {AWARD_YEAR}
        </text>
        <text x="100" y="118" textAnchor="middle" className="fill-ivory/70" style={{ fontSize: '14px', letterSpacing: '3px' }}>
          ★★★
        </text>
        <text x="100" y="138" textAnchor="middle" className="fill-ivory/50" style={{ fontSize: '8px', letterSpacing: '1px' }}>
          RESTAURANT GURU
        </text>
      </svg>
    </a>
  );
}

export default RestaurantGuruBadge;
