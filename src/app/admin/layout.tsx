import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { auth, signOut } from "@/auth";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ksmile-surface p-6 text-sm text-ksmile-muted">Chargement…</div>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await auth();

  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-ksmile-surface">
      <header className="border-b border-ksmile-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="font-extrabold text-ksmile-green">
            Ksmile Admin
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            <AdminNav href="/admin">Tableau de bord</AdminNav>
            <AdminNav href="/admin/produits">Produits</AdminNav>
            <AdminNav href="/admin/categories">Catégories</AdminNav>
            <AdminNav href="/admin/produits/import">Import</AdminNav>
            <AdminNav href="/admin/demandes">Demandes</AdminNav>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-ksmile-muted">{session.user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-md border border-ksmile-line px-3 py-1.5 font-medium hover:border-ksmile-green"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}

function AdminNav({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-md px-3 py-1.5 text-ksmile-ink hover:bg-ksmile-green-soft hover:text-ksmile-green"
    >
      {children}
    </Link>
  );
}
