import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CatalogueToolbar } from "@/components/catalogue/CatalogueToolbar";
import { CategoryShortcuts } from "@/components/catalogue/CategoryShortcuts";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductGrid } from "@/components/product/ProductCard";
import { EmptyState, LoadingState } from "@/components/ui/States";
import {
  getCategories,
  getCategory,
  getProductsByCategory,
  sortProducts,
} from "@/lib/catalog";
import { categories as staticCategories } from "@/data/demo";
import type { SortOption } from "@/types";
import type { Metadata } from "next";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ tri?: string }>;

export function generateStaticParams() {
  return staticCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  return { title: category?.name ?? "Catégorie" };
}

export default function CategoryPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
      <Suspense fallback={<LoadingState label="Chargement de la catégorie…" />}>
        <CategoryDetails params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CategoryDetails({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const tri = (sp.tri as SortOption) || "pertinence";
  const [categories, products] = await Promise.all([
    getCategories(),
    getProductsByCategory(slug),
  ]);
  const list = sortProducts(products, tri);

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Catalogue", href: "/catalogue" },
          { label: category.name },
        ]}
      />
      <div className="mt-4 mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-ksmile-ink sm:text-3xl">
          {category.name}
        </h1>
        <p className="mt-1 text-sm text-ksmile-muted sm:text-base">
          {category.description}
        </p>
      </div>
      <div className="mb-4">
        <CategoryShortcuts activeSlug={slug} />
      </div>
      <CatalogueToolbar
        resultCount={list.length}
        categories={categories}
        currentSort={tri}
        query=""
        basePath={`/categories/${slug}`}
      />
      <div className="mt-4">
        {list.length === 0 ? (
          <EmptyState
            title="Aucun produit dans cet univers"
            description="Parcourez le catalogue ou une autre catégorie."
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
