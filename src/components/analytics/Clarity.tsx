import Script from 'next/script';

/**
 * Microsoft Clarity (session recordings + heatmaps).
 *
 * The project ID is not a secret — it ships in the page source of every site
 * that uses Clarity — so it is kept as a default here and only overridden via
 * env when a second Clarity project is needed (e.g. a staging domain).
 *
 * Uses `||`, not `??`: an env var that is present but empty (as in
 * .env.example) must fall back to the real ID rather than silently disabling
 * analytics.
 */
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'yrg5gd7yzi';

export function Clarity() {
  // Local/dev sessions would otherwise show up as real guest traffic.
  if (process.env.NODE_ENV !== 'production' || !CLARITY_PROJECT_ID) {
    return null;
  }

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`}
    </Script>
  );
}

export default Clarity;
