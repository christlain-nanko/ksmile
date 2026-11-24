import Link from "next/link";

export function HowItWorksStrip() {
  return (
    <div className="border-b border-ksmile-line bg-ksmile-green-soft">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-2.5 text-sm text-ksmile-ink sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold text-ksmile-green">Comment ça marche :</span>{" "}
          vous préparez votre panier, vous envoyez une demande. Ksmile confirme
          disponibilité, montant et remise. Pas de paiement en ligne.
        </p>
        <Link
          href="/contact"
          className="shrink-0 font-semibold text-ksmile-green underline-offset-2 hover:underline"
        >
          En savoir plus
        </Link>
      </div>
    </div>
  );
}
