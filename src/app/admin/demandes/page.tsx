import { Suspense } from "react";
import Link from "next/link";
import type { RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatFcfa } from "@/lib/format";
import { updateRequestStatus } from "./actions";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";

export const instant = false;

const statusLabel: Record<RequestStatus, string> = {
  RECEIVED: "Reçue",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  FULFILLED: "Livrée",
};

const statusClass: Record<RequestStatus, string> = {
  RECEIVED: "bg-ksmile-coral/15 text-ksmile-coral",
  CONFIRMED: "bg-ksmile-green-soft text-ksmile-green",
  CANCELLED: "bg-ksmile-surface text-ksmile-muted",
  FULFILLED: "bg-ksmile-green text-white",
};

function formatAdminDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} UTC`;
}

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={<LoadingState label="Chargement des demandes…" />}>
      <RequestsList />
    </Suspense>
  );
}

async function RequestsList() {
  const requests = await prisma.orderRequest.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ksmile-ink">Demandes</h1>
        <p className="mt-1 text-sm text-ksmile-muted">
          {requests.length} demande{requests.length > 1 ? "s" : ""}
        </p>
      </div>

      {requests.length === 0 ? (
        <p className="border border-dashed border-ksmile-line bg-white p-6 text-sm text-ksmile-muted">
          Aucune demande reçue pour le moment.
        </p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => {
            const digits = r.phone.replace(/\D/g, "");
            const wa = digits ? `https://wa.me/${digits}` : null;
            const confirm = updateRequestStatus.bind(null, r.id, "CONFIRMED");
            const cancel = updateRequestStatus.bind(null, r.id, "CANCELLED");
            const fulfill = updateRequestStatus.bind(null, r.id, "FULFILLED");

            return (
              <li key={r.id} className="border border-ksmile-line bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-ksmile-ink">{r.reference}</p>
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-semibold ${statusClass[r.status]}`}
                      >
                        {statusLabel[r.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ksmile-muted">
                      {r.customerName} · {r.phone} · {r.city}, {r.quartier}
                    </p>
                    <p className="mt-1 text-xs text-ksmile-muted">
                      {formatAdminDate(r.createdAt)}
                    </p>
                    {r.note ? (
                      <p className="mt-2 text-sm text-ksmile-ink">Note : {r.note}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tabular-nums">
                      {formatFcfa(r.subtotalFcfa)}
                    </p>
                    {wa ? (
                      <Link
                        href={wa}
                        target="_blank"
                        className="mt-2 inline-block text-sm font-semibold text-ksmile-green hover:underline"
                      >
                        WhatsApp
                      </Link>
                    ) : null}
                  </div>
                </div>

                <ul className="mt-3 divide-y divide-ksmile-line border-t border-ksmile-line text-sm">
                  {r.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-3 py-2 text-ksmile-muted"
                    >
                      <span>
                        {item.productName}
                        <span className="text-ksmile-muted"> · {item.format}</span>
                        {" × "}
                        {item.quantity}
                      </span>
                      <span className="tabular-nums text-ksmile-ink">
                        {formatFcfa(item.unitPriceFcfa * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status === "RECEIVED" ? (
                    <>
                      <form action={confirm}>
                        <Button type="submit" size="sm">
                          Confirmer (réserver stock)
                        </Button>
                      </form>
                      <form action={cancel}>
                        <Button type="submit" size="sm" variant="secondary">
                          Annuler
                        </Button>
                      </form>
                    </>
                  ) : null}
                  {r.status === "CONFIRMED" ? (
                    <>
                      <form action={fulfill}>
                        <Button type="submit" size="sm">
                          Marquer livrée
                        </Button>
                      </form>
                      <form action={cancel}>
                        <Button type="submit" size="sm" variant="secondary">
                          Annuler (libérer stock)
                        </Button>
                      </form>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
