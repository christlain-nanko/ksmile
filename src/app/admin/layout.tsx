import { Suspense } from "react";
import { connection } from "next/server";
import { auth, signOut } from "@/auth";
import { AdminChrome } from "@/components/admin/AdminChrome";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-ksmile-surface p-6 text-base text-ksmile-muted">
          Chargement…
        </div>
      }
    >
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

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <AdminChrome email={session.user.email ?? ""} signOutAction={signOutAction}>
      {children}
    </AdminChrome>
  );
}
