import { Suspense } from "react";
import { CatalogueToolbar } from "@/components/catalogue/CatalogueToolbar";
import { CategoryShortcuts } from "@/components/catalogue/CategoryShortcuts";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductGrid } from "@/components/product/ProductCard";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { getCategories, getNewProducts, sortProducts } from "@/lib/catalog";
import type { SortOption } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Nouveautés" };

type SearchParams = Promise<{ tri?: string }>;

export default function NouveautesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
      <Breadcrumb
        items={[
          { label: "Catalogue", href: "/catalogue" },
          { label: "Nouveautés" },
        ]}
      />
      <div className="mt-4 mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-ksmile-ink sm:text-3xl">
          Nouveautés chez Ksmile
        </h1>
        <p className="mt-1 text-sm text-ksmile-muted sm:text-base">
          Les derniers arrivages. Disponibilité confirmée après votre demande.
        </p>
      </div>
      <div className="mb-4">
        <CategoryShortcuts activeSlug="nouveautes" />
      </div>
      <Suspense fallback={<LoadingState label="Chargement des nouveautés…" />}>
        <NouveautesResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function NouveautesResults({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const tri = (params.tri as SortOption) || "pertinence";
  const [categories, products] = await Promise.all([
    getCategories(),
    getNewProducts(),
  ]);
  const list = sortProducts(products, tri);

  return (
    <>
      <CatalogueToolbar
        resultCount={list.length}
        categories={categories}
        currentSort={tri}
        query=""
        basePath="/nouveautes"
      />
      <div className="mt-4">
        {list.length === 0 ? (
          <EmptyState
            title="Aucune nouveauté pour le moment"
            description="Revenez bientôt ou parcourez le catalogue."
            actionLabel="Voir le catalogue"
            actionHref="/catalogue"
          />
        ) : (
          <ProductGrid products={list} />
        )}
      </div>
    </>
  );
}
