"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import type { CategoryActionState } from "@/app/admin/categories/actions";

export type CategoryFormValues = {
  name: string;
  shortName: string;
  slug: string;
  description: string;
  sortOrder: number;
  inNav: boolean;
};

export function CategoryForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (
    prev: CategoryActionState,
    formData: FormData,
  ) => Promise<CategoryActionState>;
  defaults?: Partial<CategoryFormValues>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="max-w-xl space-y-4 border border-ksmile-line bg-white p-4 sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" name="name" defaultValue={defaults?.name} required />
        <Field
          label="Nom court (menu)"
          name="shortName"
          defaultValue={defaults?.shortName}
          required
          hint="Affiché dans les raccourcis"
        />
      </div>
      <Field
        label="Slug (URL)"
        name="slug"
        defaultValue={defaults?.slug}
        hint="ex. hygiene-quotidienne — laisser vide à la création pour le générer"
      />
      <div>
        <label className="mb-1.5 block text-sm font-semibold">Description</label>
        <textarea
          name="description"
          required
          rows={3}
          defaultValue={defaults?.description}
          className="min-h-12 w-full rounded-md border border-ksmile-line px-3 py-3 text-base outline-none focus:border-ksmile-green"
        />
      </div>
      <Field
        label="Ordre d’affichage"
        name="sortOrder"
        type="number"
        defaultValue={String(defaults?.sortOrder ?? 0)}
      />
      <div>
        <label className="flex min-h-12 items-center gap-3 rounded-md border border-ksmile-line bg-ksmile-surface/50 px-3 text-base">
          <input
            type="checkbox"
            name="inNav"
            defaultChecked={defaults?.inNav ?? true}
            className="size-5 shrink-0 accent-ksmile-green"
          />
          Afficher dans le menu / raccourcis
        </label>
      </div>

      {state.error ? (
        <p className="text-base text-ksmile-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="border-t border-ksmile-line pt-4">
        <Button type="submit" disabled={pending} className="min-h-12 w-full sm:w-auto">
          {pending ? "Enregistrement…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="min-h-12 w-full rounded-md border border-ksmile-line px-3 py-3 text-base outline-none focus:border-ksmile-green"
      />
      {hint ? <p className="mt-1 text-sm text-ksmile-muted">{hint}</p> : null}
    </div>
  );
}
