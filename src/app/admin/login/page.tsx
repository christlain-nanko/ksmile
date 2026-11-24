import { Suspense } from "react";
import { AdminLoginForm } from "./LoginForm";

export const instant = false;

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ksmile-surface text-sm text-ksmile-muted">
          Chargement…
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
