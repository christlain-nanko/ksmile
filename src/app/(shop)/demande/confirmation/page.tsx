"use client";

import { useEffect, useState } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { formatFcfa } from "@/lib/format";

type DemoRequest = {
  ref: string;
  name: string;
  phone: string;
  city: string;
  quartier: string;
  subtotalFcfa: number;
  itemCount: number;
  demo: boolean;
};

export default function ConfirmationPage() {
  const [data, setData] = useState<DemoRequest | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("ksmile-demo-request");
      if (raw) setData(JSON.parse(raw) as DemoRequest);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-10">
      <Breadcrumb
        items={[
          { label: "Demande", href: "/demande" },
          { label: "Confirmation" },
        ]}
      />

      <div className="mt-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ksmile-green-soft text-ksmile-green">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="mt-4 text-2xl font-extrabold text-ksmile-ink sm:text-3xl">
          Demande reçue
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ksmile-muted">
          Notre équipe vous contactera pour confirmer la disponibilité, le
          montant et les modalités de remise.
        </p>
      </div>

      <div className="mt-6 border border-ksmile-line bg-white px-4 py-5 text-left text-sm">
        {data?.ref ? (
          <p className="mb-3">
            <span className="text-ksmile-muted">Référence</span>
            <br />
            <span className="text-lg font-extrabold tracking-wide text-ksmile-green">
              {data.ref}
            </span>
          </p>
        ) : null}

        <p className="font-semibold text-ksmile-ink">Prochaines étapes</p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-ksmile-muted">
          <li>Vérification de la disponibilité</li>
          <li>Confirmation du montant et des frais de livraison</li>
          <li>Accord sur le paiement et la remise</li>
        </ol>

        {data ? (
          <div className="mt-4 space-y-1 border-t border-ksmile-line pt-4 text-ksmile-muted">
            <p>
              <span className="text-ksmile-ink">{data.name}</span> · {data.phone}
            </p>
            <p>
              {data.city}, {data.quartier}
            </p>
            <p>
              {data.itemCount} article{data.itemCount > 1 ? "s" : ""} · Total
              articles {formatFcfa(data.subtotalFcfa)}
            </p>
            <p className="text-xs text-ksmile-warning">
              Simulation locale : aucune demande n’a été transmise au serveur.
            </p>
          </div>
        ) : (
          <p className="mt-4 text-xs text-ksmile-muted">
            En production, la référence et le récapitulatif s’afficheront ici.
          </p>
        )}
      </div>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button href="/catalogue">Continuer vos achats</Button>
        <Button href="/contact" variant="secondary">
          Nous contacter
        </Button>
      </div>
    </div>
  );
}
