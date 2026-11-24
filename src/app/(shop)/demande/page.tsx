"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { EmptyState, LoadingState } from "@/components/ui/States";
import { useCart } from "@/lib/cart";
import { formatFcfa } from "@/lib/format";

export default function RequestPage() {
  const router = useRouter();
  const { items, ready, subtotalFcfa, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [quartier, setQuartier] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <LoadingState />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <EmptyState
          title="Panier vide"
          description="Ajoutez des produits avant d’envoyer une demande."
          actionLabel="Voir le catalogue"
          actionHref="/catalogue"
        />
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !city.trim() || !quartier.trim()) {
      setError("Merci de renseigner nom, téléphone, ville et quartier.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
          quartier: quartier.trim(),
          note: note.trim(),
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = (await res.json()) as { reference?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Envoi impossible");
      sessionStorage.setItem(
        "ksmile-demo-request",
        JSON.stringify({
          ref: data.reference,
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
          quartier: quartier.trim(),
          subtotalFcfa,
          itemCount: items.reduce((n, i) => n + i.quantity, 0),
          demo: false,
        }),
      );
      clear();
      router.push("/demande/confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d’envoi");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-5 sm:px-6 sm:py-6">
      <Breadcrumb items={[{ label: "Panier", href: "/panier" }, { label: "Demande" }]} />
      <h1 className="mt-4 text-2xl font-extrabold text-ksmile-ink">Envoyer ma demande</h1>
      <p className="mt-2 text-sm text-ksmile-muted">
        Pas de paiement en ligne. Nous vous contactons pour confirmer.
      </p>

      <div className="mt-5 border border-ksmile-line bg-white p-4">
        <p className="text-sm font-semibold">Récapitulatif</p>
        <ul className="mt-3 space-y-2 text-sm text-ksmile-muted">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.variantId}`}
              className="flex justify-between gap-3"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="tabular-nums text-ksmile-ink">
                {formatFcfa(item.priceFcfa * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-ksmile-line pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ksmile-muted">Total des articles</span>
            <span className="font-bold tabular-nums">{formatFcfa(subtotalFcfa)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ksmile-muted">Frais de livraison</span>
            <span className="text-ksmile-warning">Frais de livraison à confirmer</span>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <Field label="Nom complet" id="name" value={name} onChange={setName} required />
        <Field label="Téléphone WhatsApp" id="phone" type="tel" value={phone} onChange={setPhone} required />
        <Field label="Ville" id="city" value={city} onChange={setCity} required />
        <Field label="Quartier" id="quartier" value={quartier} onChange={setQuartier} required />
        <div>
          <label htmlFor="note" className="mb-1.5 block text-sm font-semibold">
            Note (optionnel)
          </label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-md border border-ksmile-line px-3 py-2.5 text-sm outline-none focus:border-ksmile-green"
          />
        </div>
        {error ? (
          <p className="text-sm text-ksmile-danger" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? "Envoi…" : "Envoyer ma demande"}
        </Button>
      </form>
    </div>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-md border border-ksmile-line px-3 py-2.5 text-sm outline-none focus:border-ksmile-green"
      />
    </div>
  );
}
