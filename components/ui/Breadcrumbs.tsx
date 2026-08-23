import Link from "next/link";

/*
  Visible breadcrumb trail for the pages below the top level. It exists for
  two readers: it tells a visitor arriving from search where in the site they
  landed, and it gives the crawler the parent path in the markup as well as in
  BreadcrumbList (emitted alongside it by the page).

  The final crumb is the current page — rendered as text, not a link.
*/
export default function Breadcrumbs({
  crumbs,
  label,
  className = "",
}: {
  crumbs: Array<{ label: string; href: string }>;
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-2">
              {last ? (
                <span className="mono-label text-steel" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  /* -my-2 py-2 grows the hit area to 40px without moving the
                     crumb off the baseline it shares with the separator */
                  className="mono-label -my-3 inline-flex items-center py-3 text-mist transition-colors hover:text-cerulean-soft"
                >
                  {crumb.label}
                </Link>
              )}
              {!last && (
                <span aria-hidden="true" className="mono-label text-line-dark">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
