"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchBar({
  initialQuery = "",
  large = false,
}: {
  initialQuery?: string;
  large?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/catalogue?q=${encodeURIComponent(q)}` : "/catalogue");
  }

  return (
    <form onSubmit={onSubmit} className="w-full" role="search">
      <label htmlFor="site-search" className="sr-only">
        Rechercher un produit
      </label>
      <div
        className={[
          "flex items-stretch overflow-hidden rounded-md border border-ksmile-line bg-white focus-within:border-ksmile-green",
          large ? "h-12" : "h-11",
        ].join(" ")}
      >
        <div className="flex flex-1 items-center gap-2 px-3">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0 text-ksmile-muted"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M20 20l-3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            id="site-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit, une marque…"
            className="w-full bg-transparent text-sm text-ksmile-ink placeholder:text-ksmile-muted/80 outline-none"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 bg-ksmile-green px-4 text-sm font-semibold text-white hover:bg-ksmile-green-dark"
        >
          Chercher
        </button>
      </div>
    </form>
  );
}
