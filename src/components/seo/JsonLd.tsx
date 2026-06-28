/**
 * Renders a JSON-LD structured-data block. Server-safe; the payload is
 * serialised once on the server. Used for Restaurant / WebSite / Menu /
 * Breadcrumb schemas (see src/lib/seo/schema.ts).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is trusted, server-generated content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default JsonLd;
