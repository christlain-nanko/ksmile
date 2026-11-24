import { Button } from "./Button";

export function LoadingState({ label = "Chargement…" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 text-ksmile-muted"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-ksmile-line border-t-ksmile-green"
        aria-hidden
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="mx-auto max-w-md border border-dashed border-ksmile-line bg-ksmile-surface/50 px-6 py-12 text-center">
      <h2 className="text-base font-bold text-ksmile-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ksmile-muted">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <div className="mt-5">
          <Button href={actionHref}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title = "Une erreur est survenue",
  description = "Impossible d’afficher cette page pour le moment.",
  actionLabel = "Retour à l’accueil",
  actionHref = "/",
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="mx-auto max-w-md border border-ksmile-coral/40 bg-ksmile-coral-soft/50 px-6 py-12 text-center">
      <h2 className="text-base font-bold text-ksmile-ink">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ksmile-muted">
        {description}
      </p>
      <div className="mt-5">
        <Button href={actionHref} variant="secondary">
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

export function AvailabilityLabel({
  stockAvailable,
}: {
  stockAvailable: number;
}) {
  if (stockAvailable <= 0) {
    return (
      <span className="text-xs font-medium text-ksmile-danger">
        Rupture de stock
      </span>
    );
  }
  if (stockAvailable <= 5) {
    return (
      <span className="text-xs font-medium text-ksmile-warning">
        Stock limité · à confirmer
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-ksmile-green">
      Disponible · à confirmer
    </span>
  );
}
