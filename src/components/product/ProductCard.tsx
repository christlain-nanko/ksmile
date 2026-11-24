"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { AvailabilityLabel } from "@/components/ui/States";
import { useCart } from "@/lib/cart";
import { formatFcfa, stockStatus } from "@/lib/format";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const status = stockStatus(product.stockAvailable);
  const unavailable = status === "out_of_stock";

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (unavailable) return;
    addItem(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className="flex h-full flex-col border border-ksmile-line bg-white">
      <Link href={`/produits/${product.slug}`} className="group flex flex-1 flex-col">
        <div className="relative aspect-square bg-white p-3 sm:p-4">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-ksmile-surface">
            <ProductImage
              src={product.imageUrl}
              brand={product.brand}
              name={product.name}
            />
          </div>
          {(product.isNew || product.pack) && (
            <div className="absolute left-2 top-2 flex flex-col gap-1">
              {product.isNew ? (
                <span className="bg-ksmile-coral px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Nouveau
                </span>
              ) : null}
              {product.pack ? (
                <span className="bg-ksmile-green px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Pack
                </span>
              ) : null}
            </div>
          )}
          {unavailable ? (
            <div className="absolute inset-x-0 bottom-0 bg-ksmile-ink/75 px-2 py-1 text-center text-[11px] font-semibold text-white">
              Indisponible
            </div>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2 pt-2 sm:px-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ksmile-muted">
            {product.brand}
          </p>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ksmile-ink group-hover:text-ksmile-green">
            {product.name}
            <span className="font-normal text-ksmile-muted">, {product.format}</span>
          </h3>
          <p className="mt-1 text-base font-bold tabular-nums text-ksmile-ink sm:text-lg">
            {formatFcfa(product.priceFcfa)}
          </p>
          <div className="mt-1">
            <AvailabilityLabel stockAvailable={product.stockAvailable} />
          </div>
        </div>
      </Link>

      <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3">
        <button
          type="button"
          disabled={unavailable}
          onClick={handleAdd}
          className="flex h-10 w-full items-center justify-center rounded-md bg-ksmile-green text-xs font-semibold text-white hover:bg-ksmile-green-dark disabled:cursor-not-allowed disabled:bg-ksmile-line disabled:text-ksmile-muted sm:text-sm"
        >
          {added ? "Ajouté" : "Ajouter au panier"}
        </button>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
