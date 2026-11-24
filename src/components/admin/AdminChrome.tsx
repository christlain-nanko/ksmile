"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const bottomNav = [
  { href: "/admin", label: "Accueil", match: (p: string) => p === "/admin" },
  {
    href: "/admin/produits",
    label: "Produits",
    match: (p: string) => p.startsWith("/admin/produits"),
  },
  {
    href: "/admin/demandes",
    label: "Demandes",
    match: (p: string) => p.startsWith("/admin/demandes"),
  },
  {
    href: "/admin/categories",
    label: "Catégories",
    match: (p: string) => p.startsWith("/admin/categories"),
  },
] as const;

export function AdminChrome({
  email,
  signOutAction,
  children,
}: {
  email: string;
  signOutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="admin-touch min-h-dvh bg-ksmile-surface pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="sticky top-0 z-40 border-b border-ksmile-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:px-6 sm:py-3">
          <Link
            href="/admin"
            className="min-h-11 min-w-11 inline-flex items-center font-extrabold text-ksmile-green"
          >
            Ksmile Admin
          </Link>

          <nav className="ml-2 hidden flex-wrap gap-1 text-sm md:flex">
            <DesktopNav href="/admin" active={pathname === "/admin"}>
              Tableau de bord
            </DesktopNav>
            <DesktopNav
              href="/admin/produits"
              active={pathname.startsWith("/admin/produits")}
            >
              Produits
            </DesktopNav>
            <DesktopNav
              href="/admin/categories"
              active={pathname.startsWith("/admin/categories")}
            >
              Catégories
            </DesktopNav>
            <DesktopNav
              href="/admin/produits/import"
              active={pathname.includes("/import")}
            >
              Import
            </DesktopNav>
            <DesktopNav
              href="/admin/demandes"
              active={pathname.startsWith("/admin/demandes")}
            >
              Demandes
            </DesktopNav>
          </nav>

          <div className="ml-auto flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-md border border-ksmile-line bg-white px-3 font-semibold text-ksmile-green active:bg-ksmile-green-soft"
            >
              Boutique
            </Link>
            <span className="hidden max-w-[10rem] truncate text-ksmile-muted lg:inline">
              {email}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-md border border-ksmile-line px-3 font-medium active:bg-ksmile-surface"
              >
                Sortir
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6">{children}</div>

      {/* Bottom nav — thumb zone (mobile / PWA) */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ksmile-line bg-white/95 backdrop-blur md:hidden pb-[env(safe-area-inset-bottom)]"
        aria-label="Navigation admin"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4">
          {bottomNav.map((item) => {
            const active = item.match(pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-semibold active:bg-ksmile-green-soft",
                    active ? "text-ksmile-green" : "text-ksmile-muted",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "h-1 w-6 rounded-full",
                      active ? "bg-ksmile-green" : "bg-transparent",
                    ].join(" ")}
                    aria-hidden
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function DesktopNav({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-md px-3 py-2",
        active
          ? "bg-ksmile-green-soft font-semibold text-ksmile-green"
          : "text-ksmile-ink hover:bg-ksmile-green-soft hover:text-ksmile-green",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
