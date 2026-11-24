"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { AvailabilityLabel } from "@/components/ui/States";
import { QuantitySelector } from "@/components/product/QuantitySelector";
import { useCart } from "@/lib/cart";
import { formatFcfa, stockStatus } from "@/lib/format";
import type { Product } from "@/types";

export function AddToCartPanel({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = useMemo(() => {
    if (!product.variants?.length) {
      return {
        id: undefined as string | undefined,
        priceFcfa: product.priceFcfa,
        format: product.format,
        stockAvailable: product.stockAvailable,
        label: product.format,
      };
    }
    const v =
      product.variants.find((x) => x.id === variantId) ?? product.variants[0];
    return {
      id: v.id,
      priceFcfa: v.priceFcfa,
      format: v.format,
      stockAvailable: v.stockAvailable,
      label: v.label,
    };
  }, [product, variantId]);

  const status = stockStatus(selected.stockAvailable);
  const unavailable = status === "out_of_stock";
  const maxQty = Math.max(1, selected.stockAvailable);

  function handleAdd() {
    if (unavailable) return;
    addItem(product, qty, selected.id);
    setAdded(true);
  }

  return (
    <div className="space-y-4 border border-ksmile-line bg-white p-4 sm:p-5">
      <div>
        <p className="text-2xl font-extrabold tabular-nums text-ksmile-ink sm:text-3xl">
          {formatFcfa(selected.priceFcfa)}
        </p>
        <p className="mt-1 text-sm text-ksmile-muted">Format : {selected.format}</p>
        <div className="mt-2">
          <AvailabilityLabel stockAvailable={selected.stockAvailable} />
        </div>
      </div>

      {product.variants && product.variants.length > 1 ? (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ksmile-ink">
            Variante
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const active = selected.id === v.id;
              const out = v.stockAvailable <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setVariantId(v.id);
                    setQty(1);
                    setAdded(false);
                  }}
                  className={[
                    "rounded-md border px-3 py-2 text-sm font-medium",
                    active
                      ? "border-ksmile-green bg-ksmile-green text-white"
                      : "border-ksmile-line bg-white text-ksmile-ink",
                    out ? "opacity-40" : "",
                  ].join(" ")}
                >
                  {v.label}
                  {out ? " · rupture" : ""}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {unavailable ? (
        <div className="border border-ksmile-coral/30 bg-ksmile-coral-soft px-3 py-3 text-sm text-ksmile-ink">
          Ce produit est en rupture de stock. Contactez Ksmile pour une
          alternative éventuelle.
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <QuantitySelector
            value={qty}
            max={maxQty}
            onChange={(v) => {
              setQty(v);
              setAdded(false);
            }}
          />
          <Button onClick={handleAdd} variant="cart" className="flex-1 sm:flex-none">
            Ajouter au panier
          </Button>
        </div>
      )}

      {added ? (
        <div className="flex flex-wrap items-center gap-3 border border-ksmile-green/20 bg-ksmile-green-soft px-3 py-3 text-sm text-ksmile-green-dark">
          <span>Ajouté au panier (démo locale).</span>
          <button
            type="button"
            onClick={() => router.push("/panier")}
            className="font-semibold underline"
          >
            Voir le panier
          </button>
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-ksmile-muted">
        Aucun paiement en ligne. Après envoi de votre demande, l’équipe
        confirme la disponibilité avant toute réservation.
      </p>
    </div>
  );
}
