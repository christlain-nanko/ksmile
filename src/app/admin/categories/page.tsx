import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";

export const instant = false;

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<LoadingState label="Chargement des catégories…" />}>
      <CategoriesList />
    </Suspense>
  );
}

async function CategoriesList() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ksmile-ink">Catégories</h1>
          <p className="mt-1 text-base text-ksmile-muted">
            {categories.length} catégorie{categories.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button href="/admin/categories/nouveau" className="min-h-12 w-full sm:w-auto">
          Nouvelle catégorie
        </Button>
      </div>

      <ul className="space-y-3 md:hidden">
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/admin/categories/${c.id}`}
              className="block border border-ksmile-line bg-white p-4 active:bg-ksmile-green-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-ksmile-ink">{c.name}</p>
                  <p className="mt-0.5 text-sm text-ksmile-muted">
                    {c.shortName} · /{c.slug}
                  </p>
                </div>
                <span className="text-sm tabular-nums text-ksmile-muted">
                  #{c.sortOrder}
                </span>
              </div>
              <p className="mt-3 text-sm text-ksmile-muted">
                {c._count.products} produit{c._count.products > 1 ? "s" : ""} ·{" "}
                {c.inNav ? "Dans le menu" : "Hors menu"}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto border border-ksmile-line bg-white md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ksmile-line bg-ksmile-surface text-ksmile-muted">
            <tr>
              <th className="px-3 py-2 font-semibold">Ordre</th>
              <th className="px-3 py-2 font-semibold">Nom</th>
              <th className="px-3 py-2 font-semibold">Slug</th>
              <th className="px-3 py-2 font-semibold">Produits</th>
              <th className="px-3 py-2 font-semibold">Menu</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ksmile-line">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-ksmile-surface/60">
                <td className="px-3 py-2 tabular-nums text-ksmile-muted">
                  {c.sortOrder}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/categories/${c.id}`}
                    className="font-semibold text-ksmile-ink hover:text-ksmile-green"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-ksmile-muted">{c.shortName}</p>
                </td>
                <td className="px-3 py-2 font-mono text-xs text-ksmile-muted">
                  {c.slug}
                </td>
                <td className="px-3 py-2 tabular-nums">{c._count.products}</td>
                <td className="px-3 py-2">{c.inNav ? "Oui" : "Non"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
