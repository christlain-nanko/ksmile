"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { importProductsExcel } from "../actions";
import { Button } from "@/components/ui/Button";

export default function ImportProductsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setWarnings([]);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        const result = await importProductsExcel(formData);
        setMessage(
          `Import terminé : ${result.created} créé(s), ${result.updated} mis à jour.`,
        );
        if (result.errors.length) setWarnings(result.errors);
        if (inputRef.current) inputRef.current.value = "";
        setFileName(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import impossible");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ksmile-ink">
          Importer des produits
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ksmile-muted">
          Remplissez un fichier Excel, puis importez-le ici. Les produits déjà
          présents (même slug) sont mis à jour.
        </p>
      </div>

      <section className="border border-ksmile-line bg-white p-4 sm:p-5">
        <h2 className="font-bold text-ksmile-ink">1. Télécharger le modèle</h2>
        <p className="mt-1 text-sm text-ksmile-muted">
          Le fichier contient un exemple et la liste des catégories autorisées
          (onglet « Categories »).
        </p>
        <div className="mt-4">
          <Button href="/admin/produits/import/template" variant="secondary">
            Télécharger le modèle Excel
          </Button>
        </div>
      </section>

      <section className="border border-ksmile-line bg-white p-4 sm:p-5">
        <h2 className="font-bold text-ksmile-ink">2. Importer votre fichier</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ksmile-muted">
          <li>Ouvrez le modèle dans Excel ou Google Sheets.</li>
          <li>Ajoutez une ligne par produit (gardez la ligne d’en-tête).</li>
          <li>
            Colonnes utiles : Marque, Nom, Format, Prix_FCFA, Stock, Categorie.
          </li>
          <li>
            Nouveau / Pack / Populaire / Publie : écrivez <strong>oui</strong>{" "}
            ou <strong>non</strong>.
          </li>
          <li>Enregistrez en .xlsx puis choisissez le fichier ci-dessous.</li>
        </ol>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Fichier Excel (.xlsx)
            </label>
            <input
              ref={inputRef}
              type="file"
              name="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              required
              className="block w-full text-sm text-ksmile-muted file:mr-3 file:rounded-md file:border-0 file:bg-ksmile-green file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-ksmile-green-dark"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
            {fileName ? (
              <p className="mt-1 text-xs text-ksmile-muted">Sélectionné : {fileName}</p>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm text-ksmile-danger" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="text-sm font-semibold text-ksmile-green">{message}</p>
          ) : null}
          {warnings.length > 0 ? (
            <div className="border border-ksmile-warning/40 bg-ksmile-surface p-3 text-sm">
              <p className="font-semibold text-ksmile-warning">
                Avertissements ({warnings.length})
              </p>
              <ul className="mt-2 max-h-40 list-disc space-y-1 overflow-y-auto pl-5 text-ksmile-muted">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Import en cours…" : "Importer le fichier"}
          </Button>
        </form>
      </section>
    </div>
  );
}
