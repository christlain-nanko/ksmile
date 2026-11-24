import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d’Ariane" className="text-sm text-ksmile-muted">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <li>
          <Link href="/" className="hover:text-ksmile-green">
            Accueil
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-ksmile-green">
                {item.label}
              </Link>
            ) : (
              <span className="text-ksmile-ink">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
