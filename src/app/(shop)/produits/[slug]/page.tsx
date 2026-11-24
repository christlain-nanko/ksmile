import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AddToCartPanel } from "@/components/product/AddToCartPanel";
import { ProductGrid } from "@/components/product/ProductCard";
import { ProductImage } from "@/components/product/ProductImage";
import { LoadingState } from "@/components/ui/States";
import {
  getCategory,
  getProductBySlug,
  getProductsByCategory,
} from "@/lib/catalog";
import { products as staticProducts } from "@/data/demo";
import type { Metadata } from "next";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return staticProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? `${product.brand} ${product.name}` : "Produit" };
}

export default function ProductPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<LoadingState label="Chargement du produit…" />}>
      <ProductDetails params={params} />
    </Suspense>
  );
}

async function ProductDetails({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = await getCategory(product.category);
  const related = (await getProductsByCategory(product.category))
    .filter((p) => p.id !== product.id)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
      <Breadcrumb
        items={[
          { label: "Catalogue", href: "/catalogue" },
          category
            ? { label: category.name, href: `/categories/${category.slug}` }
            : { label: "Produit" },
          { label: product.name },
        ]}
      />

      <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="relative aspect-square border border-ksmile-line bg-white p-6 sm:p-10">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-ksmile-surface">
            <ProductImage
              src={product.imageUrl}
              brand={product.brand}
              name={product.name}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {(product.isNew || product.pack) && (
            <div className="absolute left-3 top-3 flex gap-1">
              {product.isNew ? (
                <span className="bg-ksmile-coral px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Nouveau
                </span>
              ) : null}
              {product.pack ? (
                <span className="bg-ksmile-green px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Pack
                </span>
              ) : null}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-ksmile-muted">
            {product.brand}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-ksmile-ink sm:text-3xl">
            {product.name}
            <span className="font-semibold text-ksmile-muted">
              , {product.format}
            </span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ksmile-muted sm:text-base">
            {product.description}
          </p>
          <div className="mt-6">
            <AddToCartPanel product={product} />
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-12">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-bold text-ksmile-ink">Dans le même univers</h2>
            {category ? (
              <Link
                href={`/categories/${category.slug}`}
                className="text-sm font-semibold text-ksmile-green hover:underline"
              >
                Voir plus
              </Link>
            ) : null}
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
