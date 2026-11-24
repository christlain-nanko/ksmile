"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category, SortOption } from "@/types";

export function CatalogueToolbar({
  resultCount,
  categories,
  currentCategory,
  currentSort,
  query,
  basePath = "/catalogue",
}: {
  resultCount: number;
  categories: Category[];
  currentCategory?: string;
  currentSort: SortOption;
  query: string;
  basePath?: string;
}) {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);

  function push(next: { categorie?: string | null; tri?: SortOption }) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    const cat =
      next.categorie === null
        ? undefined
        : (next.categorie ?? currentCategory);
    if (cat && basePath === "/catalogue") params.set("categorie", cat);
    const tri = next.tri ?? currentSort;
    if (tri && tri !== "pertinence") params.set("tri", tri);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
    setFiltersOpen(false);
  }

  return (
    <div className="space-y-3 border-y border-ksmile-line py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ksmile-muted">
          <span className="font-semibold text-ksmile-ink">{resultCount}</span>{" "}
          produit{resultCount > 1 ? "s" : ""}
          {query ? ` pour « ${query} »` : ""}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-md border border-ksmile-line px-3 text-sm font-medium text-ksmile-ink md:hidden"
            onClick={() => setFiltersOpen(true)}
          >
            Filtres
          </button>

          <label className="hidden items-center gap-2 text-sm text-ksmile-muted sm:flex">
            <span>Trier</span>
            <select
              value={currentSort}
              onChange={(e) => push({ tri: e.target.value as SortOption })}
              className="h-10 rounded-md border border-ksmile-line bg-white px-2 text-sm text-ksmile-ink outline-none focus:border-ksmile-green"
            >
              <option value="pertinence">Pertinence</option>
              <option value="prix-asc">Prix croissant</option>
              <option value="prix-desc">Prix décroissant</option>
              <option value="nom">Nom A-Z</option>
            </select>
          </label>
        </div>
      </div>

      {/* Filtres desktop */}
      {basePath === "/catalogue" ? (
        <div className="hidden flex-wrap gap-2 md:flex">
          <FilterBtn
            active={!currentCategory}
            onClick={() => push({ categorie: null })}
          >
            Tous
          </FilterBtn>
          {categories
            .filter((c) => !["nouveautes", "packs-offres"].includes(c.slug))
            .map((c) => (
              <FilterBtn
                key={c.slug}
                active={currentCategory === c.slug}
                onClick={() => push({ categorie: c.slug })}
              >
                {c.shortName}
              </FilterBtn>
            ))}
        </div>
      ) : null}

      {/* Panneau filtres mobile */}
      {filtersOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fermer les filtres"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-xl bg-white p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-bold text-ksmile-ink">Filtres et tri</p>
              <button
                type="button"
                className="text-sm font-semibold text-ksmile-green"
                onClick={() => setFiltersOpen(false)}
              >
                Fermer
              </button>
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ksmile-muted">
              Trier
            </p>
            <div className="mb-5 grid gap-2">
              {(
                [
                  ["pertinence", "Pertinence"],
                  ["prix-asc", "Prix croissant"],
                  ["prix-desc", "Prix décroissant"],
                  ["nom", "Nom A-Z"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => push({ tri: value })}
                  className={[
                    "rounded-md border px-3 py-2.5 text-left text-sm",
                    currentSort === value
                      ? "border-ksmile-green bg-ksmile-green-soft font-semibold text-ksmile-green"
                      : "border-ksmile-line text-ksmile-ink",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            {basePath === "/catalogue" ? (
              <>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ksmile-muted">
                  Catégorie
                </p>
                <div className="grid gap-2">
                  <FilterBtn
                    active={!currentCategory}
                    onClick={() => push({ categorie: null })}
                    block
                  >
                    Tous
                  </FilterBtn>
                  {categories
                    .filter(
                      (c) => !["nouveautes", "packs-offres"].includes(c.slug),
                    )
                    .map((c) => (
                      <FilterBtn
                        key={c.slug}
                        active={currentCategory === c.slug}
                        onClick={() => push({ categorie: c.slug })}
                        block
                      >
                        {c.name}
                      </FilterBtn>
                    ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterBtn({
  children,
  active,
  onClick,
  block,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  block?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1.5 text-sm font-medium",
        block ? "w-full rounded-md py-2.5 text-left" : "",
        active
          ? "border-ksmile-green bg-ksmile-green text-white"
          : "border-ksmile-line bg-white text-ksmile-ink",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
