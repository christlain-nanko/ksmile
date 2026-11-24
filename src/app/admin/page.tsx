import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { availableStock } from "@/lib/slug";
import { formatFcfa } from "@/lib/format";
import { LoadingState } from "@/components/ui/States";

export const instant = false;

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<LoadingState label="Chargement du tableau de bord…" />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  await auth();

  const [productCount, requestCount, lowStock, recentRequests] =
    await Promise.all([
      prisma.product.count(),
      prisma.orderRequest.count({ where: { status: "RECEIVED" } }),
      prisma.product.findMany({
        where: { published: true },
        orderBy: { physicalStock: "asc" },
        take: 50,
      }),
      prisma.orderRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const low = lowStock.filter(
    (p) => availableStock(p.physicalStock, p.reservedStock) <= 5,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-ksmile-ink">Tableau de bord</h1>
        <p className="mt-1 text-sm text-ksmile-muted">
          Vue d’ensemble du catalogue et des demandes.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Produits" value={String(productCount)} href="/admin/produits" />
        <Stat
          label="Nouvelles demandes"
          value={String(requestCount)}
          href="/admin/demandes"
        />
        <Stat
          label="Stocks faibles"
          value={String(low.length)}
          href="/admin/produits?stock=low"
        />
      </div>

      <section className="border border-ksmile-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-ksmile-ink">Stocks faibles</h2>
          <Link href="/admin/produits" className="text-sm font-semibold text-ksmile-green">
            Voir les produits
          </Link>
        </div>
        {low.length === 0 ? (
          <p className="text-sm text-ksmile-muted">Aucun stock faible pour le moment.</p>
        ) : (
          <ul className="divide-y divide-ksmile-line text-sm">
            {low.slice(0, 8).map((p) => {
              const avail = availableStock(p.physicalStock, p.reservedStock);
              return (
                <li key={p.id} className="flex justify-between gap-3 py-2">
                  <Link href={`/admin/produits/${p.id}`} className="hover:text-ksmile-green">
                    {p.brand} · {p.name}
                  </Link>
                  <span className={avail <= 0 ? "text-ksmile-danger" : "text-ksmile-warning"}>
                    {avail} dispo
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="border border-ksmile-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-ksmile-ink">Dernières demandes</h2>
          <Link href="/admin/demandes" className="text-sm font-semibold text-ksmile-green">
            Tout voir
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <p className="text-sm text-ksmile-muted">
            Aucune demande pour le moment. Les demandes du site arriveront ici.
          </p>
        ) : (
          <ul className="divide-y divide-ksmile-line text-sm">
            {recentRequests.map((r) => (
              <li key={r.id} className="flex justify-between gap-3 py-2">
                <span>
                  {r.reference} · {r.customerName}
                </span>
                <span className="tabular-nums">{formatFcfa(r.subtotalFcfa)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href} className="border border-ksmile-line bg-white p-4 hover:border-ksmile-green">
      <p className="text-sm text-ksmile-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ksmile-ink">{value}</p>
    </Link>
  );
}
