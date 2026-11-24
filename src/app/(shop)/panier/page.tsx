"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { Button } from "@/components/ui/Button";
import {
  AvailabilityLabel,
  EmptyState,
  LoadingState,
} from "@/components/ui/States";
import { useCart } from "@/lib/cart";
import { formatFcfa } from "@/lib/format";

export default function CartPage() {
  const { items, ready, setQuantity, removeItem, subtotalFcfa, itemCount } =
    useCart();

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <LoadingState label="Chargement du panier…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-6">
      <Breadcrumb items={[{ label: "Panier" }]} />
      <h1 className="mt-4 text-2xl font-extrabold text-ksmile-ink sm:text-3xl">
        Panier
      </h1>
      <p className="mt-1 text-sm text-ksmile-muted">
        {itemCount} article{itemCount > 1 ? "s" : ""}
      </p>

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Votre panier est vide"
            description="Parcourez le catalogue et ajoutez des produits pour préparer une demande."
            actionLabel="Voir le catalogue"
            actionHref="/catalogue"
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <ul className="divide-y divide-ksmile-line border border-ksmile-line bg-white">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId ?? "d"}`}
                className="flex gap-3 p-3 sm:p-4"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-ksmile-surface text-sm font-bold text-ksmile-green/50">
                  {item.brand.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium uppercase text-ksmile-muted">
                    {item.brand}
                  </p>
                  <Link
                    href={`/produits/${item.slug}`}
                    className="text-sm font-semibold text-ksmile-ink hover:text-ksmile-green"
                  >
                    {item.name}, {item.format}
                  </Link>
                  <div className="mt-1">
                    <AvailabilityLabel stockAvailable={item.stockAvailable} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <QuantitySelector
                      value={item.quantity}
                      min={0}
                      max={Math.max(1, item.stockAvailable)}
                      onChange={(q) =>
                        setQuantity(item.productId, q, item.variantId)
                      }
                    />
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums text-ksmile-ink">
                        {formatFcfa(item.priceFcfa * item.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.productId, item.variantId)
                        }
                        className="mt-1 text-xs text-ksmile-muted underline hover:text-ksmile-danger"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="border border-ksmile-line bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ksmile-muted">Total des articles</span>
              <span className="font-bold tabular-nums text-ksmile-ink">
                {formatFcfa(subtotalFcfa)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-ksmile-muted">Frais de livraison</span>
              <span className="font-medium text-ksmile-warning">
                Frais de livraison à confirmer
              </span>
            </div>
            <div className="mt-5">
              <Button href="/demande" fullWidth>
                Continuer vers la demande
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
