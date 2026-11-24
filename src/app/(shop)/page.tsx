import { Suspense } from "react";
import Link from "next/link";
import { CategoryShortcuts } from "@/components/catalogue/CategoryShortcuts";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ProductGrid } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";
import {
  getAllProducts,
  getNewProducts,
  getPacks,
  getPopularProducts,
} from "@/lib/catalog";

export default function HomePage() {
  return (
    <div>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-5 sm:px-6 sm:py-6">
        <Breadcrumb items={[{ label: "Catalogue" }]} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ksmile-ink sm:text-3xl">
              Catalogue Ksmile
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-ksmile-muted sm:text-base">
              Hygiène, beauté, cheveux, bébé et maison. Choisissez vos produits,
              envoyez votre demande : l’équipe confirme disponibilité et remise.
            </p>
          </div>
          <Button href="/catalogue" className="shrink-0">
            Voir tout le catalogue
          </Button>
        </div>

        <CategoryShortcuts />

        <Suspense fallback={<LoadingState label="Chargement du catalogue…" />}>
          <HomeSections />
        </Suspense>
      </div>
    </div>
  );
}

async function HomeSections() {
  const [selections, nouveautes, packs, cataloguePreview] = await Promise.all([
    getPopularProducts(),
    getNewProducts(),
    getPacks(),
    getAllProducts(),
  ]);

  return (
    <>
      <section>
        <SectionHeader title="Sélections pour vous" href="/catalogue" linkLabel="Voir plus" />
        <ProductGrid products={selections.slice(0, 10)} />
      </section>

      <section>
        <SectionHeader title="Nouveautés" href="/nouveautes" linkLabel="Toutes les nouveautés" />
        <ProductGrid products={nouveautes.slice(0, 10)} />
      </section>

      <section>
        <SectionHeader title="Packs et offres" href="/categories/packs-offres" linkLabel="Voir les packs" />
        <ProductGrid products={packs} />
      </section>

      <section>
        <SectionHeader title="Dans le catalogue" href="/catalogue" linkLabel="Catalogue complet" />
        <ProductGrid products={cataloguePreview.slice(0, 10)} />
      </section>
    </>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-lg font-bold text-ksmile-ink sm:text-xl">{title}</h2>
      <Link href={href} className="shrink-0 text-sm font-semibold text-ksmile-green hover:underline">
        {linkLabel}
      </Link>
    </div>
  );
}
