import Link from "next/link";
import { getNavCategories } from "@/lib/catalog";

export async function CategoryShortcuts({
  activeSlug,
}: {
  activeSlug?: string;
}) {
  const cats = await getNavCategories();

  return (
    <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
      <div className="flex gap-2 pb-1">
        <Chip href="/catalogue" active={!activeSlug}>
          Tous
        </Chip>
        {cats.map((c) => {
          const href =
            c.slug === "nouveautes" ? "/nouveautes" : `/categories/${c.slug}`;
          return (
            <Chip key={c.slug} href={href} active={activeSlug === c.slug}>
              {c.shortName}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium",
        active
          ? "border-ksmile-green bg-ksmile-green text-white"
          : "border-ksmile-line bg-white text-ksmile-ink hover:border-ksmile-green",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
