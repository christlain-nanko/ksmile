import { Suspense } from "react";
import { CatalogueToolbar } from "@/components/catalogue/CatalogueToolbar";
import { CategoryShortcuts } from "@/components/catalogue/CategoryShortcuts";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductGrid } from "@/components/product/ProductCard";
import { EmptyState, LoadingState } from "@/components/ui/States";
import {
  getCategories,
  searchProducts,
  sortProducts,
} from "@/lib/catalog";
import type { CategorySlug, SortOption } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Catalogue" };

type SearchParams = Promise<{
  q?: string;
  categorie?: string;
  tri?: string;
}>;

export default function CataloguePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
      <Breadcrumb items={[{ label: "Catalogue" }]} />
      <div className="mt-4 mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-ksmile-ink sm:text-3xl">
          Tout le catalogue
        </h1>
      </div>
      <div className="mb-4">
        <CategoryShortcuts />
      </div>
      <Suspense fallback={<LoadingState label="Chargement du catalogue…" />}>
        <CatalogueResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CatalogueResults({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q ?? "";
  const categorie = params.categorie as CategorySlug | undefined;
  const tri = (params.tri as SortOption) || "pertinence";
  const categories = await getCategories();

  let list = await searchProducts(q);
  if (categorie) {
    if (categorie === "nouveautes") list = list.filter((p) => p.isNew);
    else if (categorie === "packs-offres") list = list.filter((p) => p.pack);
    else list = list.filter((p) => p.category === categorie);
  }
  list = sortProducts(list, tri);

  return (
    <>
      <CatalogueToolbar
        resultCount={list.length}
        categories={categories}
        currentCategory={categorie}
        currentSort={tri}
        query={q}
      />
      <div className="mt-4">
        {list.length === 0 ? (
          <EmptyState
            title="Aucun produit trouvé"
            description="Essayez un autre mot-clé ou retirez les filtres."
            actionLabel="Voir tout le catalogue"
            actionHref="/catalogue"
          />
        ) : (
          <ProductGrid products={list} />
        )}
      </div>
    </>
  );
}
