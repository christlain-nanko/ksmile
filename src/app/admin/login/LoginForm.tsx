"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push(params.get("callbackUrl") || "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ksmile-surface px-4">
      <div className="w-full max-w-md border border-ksmile-line bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold text-ksmile-ink">Admin Ksmile</h1>
        <p className="mt-2 text-sm text-ksmile-muted">
          Espace sécurisé pour gérer le catalogue et les demandes.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-ksmile-line px-3 py-2.5 text-sm outline-none focus:border-ksmile-green"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-ksmile-line px-3 py-2.5 text-sm outline-none focus:border-ksmile-green"
            />
          </div>
          {error ? (
            <p className="text-sm text-ksmile-danger" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </Button>
          <Button href="/" variant="secondary" fullWidth>
            Retour à la boutique
          </Button>
        </form>
      </div>
    </div>
  );
}
