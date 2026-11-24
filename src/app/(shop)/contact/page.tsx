import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact & fonctionnement",
};

const steps = [
  {
    title: "Parcourir et préparer",
    text: "Consultez le catalogue, choisissez vos produits et ajustez les quantités. Aucun compte n’est requis.",
  },
  {
    title: "Envoyer votre demande",
    text: "Indiquez nom, téléphone, ville et quartier, puis cliquez sur « Envoyer ma demande ».",
  },
  {
    title: "Confirmation par l’équipe",
    text: "Ksmile vous contacte pour confirmer disponibilité, montant, paiement et remise des produits.",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-6">
      <Breadcrumb items={[{ label: "Contact" }]} />

      <h1 className="mt-4 text-2xl font-extrabold text-ksmile-ink sm:text-3xl">
        Comment ça marche
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ksmile-muted sm:text-base">
        Ksmile est un catalogue de droguerie en ligne pour le Cameroun. Il n’y
        a pas encore de magasin physique. Les commandes se préparent sur le
        site, puis se finalisent avec l’équipe.
      </p>

      <ol className="mt-7 space-y-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="flex gap-4 border border-ksmile-line bg-white p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-ksmile-green text-sm font-bold text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="text-base font-bold text-ksmile-ink">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ksmile-muted">
                {step.text}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-7 border border-ksmile-line bg-ksmile-surface p-4 sm:p-5">
        <h2 className="text-lg font-bold text-ksmile-ink">
          Disponibilité et livraison
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ksmile-muted">
          <li>
            La disponibilité est confirmée par l’équipe avant toute réservation
            de stock.
          </li>
          <li>
            Le total des articles et les frais de livraison sont séparés. Les
            frais restent à confirmer.
          </li>
          <li>
            Aucun paiement en ligne : le règlement se convient au moment de la
            confirmation.
          </li>
          <li>
            Pas de recherche de magasin ni de retrait en boutique pour le
            moment.
          </li>
        </ul>
      </section>

      <section className="mt-7 border border-ksmile-line bg-white p-4 sm:p-5">
        <h2 className="text-lg font-bold text-ksmile-ink">Contact</h2>
        <p className="mt-2 text-sm text-ksmile-muted">
          Pour une question avant commande, laissez un message WhatsApp
          (coordonnées définitives à brancher).
        </p>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="font-semibold text-ksmile-ink">WhatsApp</dt>
            <dd className="text-ksmile-muted">À confirmer</dd>
          </div>
          <div>
            <dt className="font-semibold text-ksmile-ink">Zone</dt>
            <dd className="text-ksmile-muted">Odza et environs</dd>
          </div>
          <div>
            <dt className="font-semibold text-ksmile-ink">Horaires</dt>
            <dd className="text-ksmile-muted">
              Réponse sous 24 h en jours ouvrés (indicatif)
            </dd>
          </div>
        </dl>
        <div className="mt-5">
          <Button href="/catalogue">Voir le catalogue</Button>
        </div>
      </section>
    </div>
  );
}
