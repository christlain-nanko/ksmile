import Image from "next/image";
import Link from "next/link";
import { getNavCategories } from "@/lib/catalog";

export async function Footer() {
  const universes = await getNavCategories();

  return (
    <footer className="mt-auto border-t border-ksmile-line bg-ksmile-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <Image
            src="/brand/logo-wordmark.png"
            alt="Ksmile"
            width={130}
            height={48}
            className="h-9 w-auto object-contain object-left"
          />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ksmile-muted">
            Catalogue de droguerie en ligne pour le Cameroun. Hygiène, beauté,
            cheveux, bébé et maison. Vous demandez, nous confirmons.
          </p>
        </div>

        <div>
          <p className="text-sm font-bold text-ksmile-ink">Univers</p>
          <ul className="mt-3 space-y-2 text-sm text-ksmile-muted">
            {universes.map((c) => (
              <li key={c.slug}>
                <Link
                  href={
                    c.slug === "nouveautes"
                      ? "/nouveautes"
                      : `/categories/${c.slug}`
                  }
                  className="hover:text-ksmile-green"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold text-ksmile-ink">Aide</p>
          <ul className="mt-3 space-y-2 text-sm text-ksmile-muted">
            <li>
              <Link href="/contact" className="hover:text-ksmile-green">
                Comment ça marche
              </Link>
            </li>
            <li>
              <Link href="/panier" className="hover:text-ksmile-green">
                Mon panier
              </Link>
            </li>
            <li>
              <Link href="/catalogue" className="hover:text-ksmile-green">
                Catalogue
              </Link>
            </li>
            <li>
              <Link
                href="/admin/login"
                className="inline-flex items-center rounded-md border border-ksmile-line bg-white px-3 py-1.5 text-sm font-semibold text-ksmile-green hover:border-ksmile-green"
              >
                Espace admin
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-ksmile-muted">
            Pas de paiement en ligne. Pas de magasin physique pour le moment.
            Disponibilité et livraison confirmées par l’équipe Ksmile.
          </p>
        </div>
      </div>
      <div className="border-t border-ksmile-line px-4 py-3 text-center text-xs text-ksmile-muted">
        © 2026 Ksmile · Odza et environs
      </div>
    </footer>
  );
}
