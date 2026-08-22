/*
  Server-rendered structured data. One <script> per page holding a single
  @graph, so the nodes can cross-reference each other by @id.
*/
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // trusted, build-time content — no user input reaches this string
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
