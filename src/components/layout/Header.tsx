"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { Category } from "@/types";
import { SearchBar } from "./SearchBar";

export function Header({ universes }: { universes: Category[] }) {
  const pathname = usePathname();
  const { itemCount, ready } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ksmile-line bg-white">
      {/* Ligne principale : logo | recherche | panier */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:gap-6">
        <Link href="/" className="shrink-0" aria-label="Ksmile, Accueil">
          <Image
            src="/brand/logo-mark-tight.png"
            alt="Ksmile"
            width={88}
            height={104}
            priority
            unoptimized
            className="h-16 w-auto object-contain object-left sm:h-[4.5rem]"
          />
        </Link>

        <div className="mx-auto hidden min-w-0 flex-1 md:block md:max-w-2xl lg:max-w-3xl">
          <SearchBar large />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/panier"
            className="relative inline-flex h-11 items-center gap-2 rounded-md border border-ksmile-line px-3 text-sm font-semibold text-ksmile-ink hover:border-ksmile-green hover:text-ksmile-green"
            aria-label={`Panier${ready && itemCount ? `, ${itemCount} articles` : ""}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 7h12l-1 12H7L6 7Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M9 7a3 3 0 0 1 6 0"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden sm:inline">Panier</span>
            {ready && itemCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ksmile-coral px-1 text-[10px] font-bold text-white">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-ksmile-line text-ksmile-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Recherche mobile */}
      <div className="border-t border-ksmile-line px-4 py-2 md:hidden">
        <SearchBar />
      </div>

      {/* Univers horizontaux */}
      <nav
        aria-label="Univers Ksmile"
        className="hidden border-t border-ksmile-line lg:block"
      >
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 scrollbar-none sm:px-6">
          <NavLink href="/catalogue" active={pathname === "/catalogue"}>
            Tout le catalogue
          </NavLink>
          {universes.map((u) => {
            const href =
              u.slug === "nouveautes"
                ? "/nouveautes"
                : u.slug === "packs-offres"
                  ? "/categories/packs-offres"
                  : `/categories/${u.slug}`;
            const active =
              pathname === href || pathname.startsWith(`/categories/${u.slug}`);
            return (
              <NavLink key={u.slug} href={href} active={active}>
                {u.shortName}
              </NavLink>
            );
          })}
          <NavLink href="/contact" active={pathname === "/contact"}>
            Contact
          </NavLink>
        </div>
      </nav>

      {/* Menu mobile */}
      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-ksmile-line bg-white px-4 py-3 lg:hidden"
        >
          <div className="flex flex-col">
            <Link
              href="/catalogue"
              onClick={() => setOpen(false)}
              className="border-b border-ksmile-line py-3 text-sm font-medium text-ksmile-ink"
            >
              Tout le catalogue
            </Link>
            {universes.map((u) => {
              const href =
                u.slug === "nouveautes"
                  ? "/nouveautes"
                  : `/categories/${u.slug}`;
              return (
                <Link
                  key={u.slug}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="border-b border-ksmile-line py-3 text-sm font-medium text-ksmile-ink"
                >
                  {u.name}
                </Link>
              );
            })}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="py-3 text-sm font-medium text-ksmile-ink"
            >
              Contact
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function NavLink({
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
        "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
        active
          ? "border-ksmile-green text-ksmile-green"
          : "border-transparent text-ksmile-ink hover:text-ksmile-green",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
