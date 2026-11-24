import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { availableStock } from "@/lib/slug";
import { formatFcfa } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";

export const instant = false;

export default function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ stock?: string; q?: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState label="Chargement des produits…" />}>
      <ProductsList searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductsList({
  searchParams,
}: {
  searchParams: Promise<{ stock?: string; q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim();

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  const list =
    params.stock === "low"
      ? products.filter(
          (p) => availableStock(p.physicalStock, p.reservedStock) <= 5,
        )
      : products;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ksmile-ink">Produits</h1>
          <p className="mt-1 text-base text-ksmile-muted">
            {list.length} produit{list.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button
            href="/admin/produits/import"
            variant="secondary"
            className="min-h-12"
          >
            Importer
          </Button>
          <Button href="/admin/produits/nouveau" className="min-h-12">
            Nouveau
          </Button>
        </div>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher…"
          className="min-h-12 flex-1 rounded-md border border-ksmile-line bg-white px-3 text-base outline-none focus:border-ksmile-green"
        />
        <Button type="submit" variant="secondary" className="min-h-12 shrink-0">
          Chercher
        </Button>
      </form>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {list.map((p) => {
          const avail = availableStock(p.physicalStock, p.reservedStock);
          return (
            <li key={p.id}>
              <Link
                href={`/admin/produits/${p.id}`}
                className="block border border-ksmile-line bg-white p-4 active:bg-ksmile-green-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-ksmile-ink">
                      {p.brand} · {p.name}
                    </p>
                    <p className="mt-0.5 text-sm text-ksmile-muted">
                      {p.category.name} · {p.format}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatFcfa(p.priceFcfa)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <span
                    className={
                      avail <= 0
                        ? "font-semibold text-ksmile-danger"
                        : avail <= 5
                          ? "font-semibold text-ksmile-warning"
                          : "font-semibold text-ksmile-green"
                    }
                  >
                    {avail} dispo
                  </span>
                  <span className="text-ksmile-muted">
                    · phys. {p.physicalStock} · rés. {p.reservedStock}
                  </span>
                  <span className="ml-auto text-ksmile-muted">
                    {p.published ? "Publié" : "Masqué"}
                    {p.imageUrl ? " · Image" : ""}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto border border-ksmile-line bg-white md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ksmile-line bg-ksmile-surface text-ksmile-muted">
            <tr>
              <th className="px-3 py-2 font-semibold">Produit</th>
              <th className="px-3 py-2 font-semibold">Catégorie</th>
              <th className="px-3 py-2 font-semibold">Prix</th>
              <th className="px-3 py-2 font-semibold">Stock</th>
              <th className="px-3 py-2 font-semibold">Image</th>
              <th className="px-3 py-2 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ksmile-line">
            {list.map((p) => {
              const avail = availableStock(p.physicalStock, p.reservedStock);
              return (
                <tr key={p.id} className="hover:bg-ksmile-surface/60">
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/produits/${p.id}`}
                      className="font-semibold text-ksmile-ink hover:text-ksmile-green"
                    >
                      {p.brand} · {p.name}
                    </Link>
                    <p className="text-xs text-ksmile-muted">{p.format}</p>
                  </td>
                  <td className="px-3 py-2 text-ksmile-muted">
                    {p.category.name}
                  </td>
                  <td className="px-3 py-2 tabular-nums">
                    {formatFcfa(p.priceFcfa)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        avail <= 0
                          ? "text-ksmile-danger"
                          : avail <= 5
                            ? "text-ksmile-warning"
                            : "text-ksmile-green"
                      }
                    >
                      {avail} dispo
                    </span>
                    <p className="text-xs text-ksmile-muted">
                      phys. {p.physicalStock} · rés. {p.reservedStock}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-xs text-ksmile-muted">
                    {p.imageUrl ? "Oui" : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {p.published ? "Publié" : "Masqué"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
