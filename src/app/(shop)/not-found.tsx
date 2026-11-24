import { ErrorState } from "@/components/ui/States";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <ErrorState
        title="Page introuvable"
        description="Cette page n’existe pas ou le produit demandé n’est plus dans le catalogue de démonstration."
        actionLabel="Retour à l’accueil"
        actionHref="/"
      />
    </div>
  );
}
