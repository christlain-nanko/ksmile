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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ksmile-ink">Produits</h1>
          <p className="mt-1 text-sm text-ksmile-muted">
            {list.length} produit{list.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/admin/produits/import" variant="secondary">
            Importer
          </Button>
          <Button href="/admin/produits/nouveau">Nouveau produit</Button>
        </div>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Rechercher…"
          className="flex-1 rounded-md border border-ksmile-line bg-white px-3 py-2 text-sm outline-none focus:border-ksmile-green"
        />
        <Button type="submit" variant="secondary">
          Chercher
        </Button>
      </form>

      <div className="overflow-x-auto border border-ksmile-line bg-white">
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
                  <td className="px-3 py-2 tabular-nums">{formatFcfa(p.priceFcfa)}</td>
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
