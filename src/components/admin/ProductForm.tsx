"use client";

import { useActionState } from "react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import type { ProductActionState } from "@/app/admin/produits/actions";

export type ProductFormCategoryOption = { slug: string; label: string };

export type ProductFormValues = {
  brand: string;
  name: string;
  slug: string;
  description: string;
  format: string;
  priceFcfa: number;
  physicalStock: number;
  categorySlug: string;
  isNew: boolean;
  pack: boolean;
  popular: boolean;
  published: boolean;
  imageUrl?: string | null;
};

export function ProductForm({
  action,
  defaults,
  submitLabel,
  categories,
}: {
  action: (
    prev: ProductActionState,
    formData: FormData,
  ) => Promise<ProductActionState>;
  defaults?: Partial<ProductFormValues>;
  submitLabel: string;
  categories: ProductFormCategoryOption[];
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const defaultCategory = defaults?.categorySlug ?? categories[0]?.slug ?? "";

  return (
    <form
      action={formAction}
      className="max-w-2xl space-y-4 border border-ksmile-line bg-white p-4 sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Marque" name="brand" defaultValue={defaults?.brand} required />
        <Field label="Nom" name="name" defaultValue={defaults?.name} required />
      </div>
      <Field
        label="Slug (URL)"
        name="slug"
        defaultValue={defaults?.slug}
        required
        hint="ex. savon-doux-karite"
      />
      <div>
        <label className="mb-1.5 block text-sm font-semibold">Description</label>
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={defaults?.description}
          className="min-h-12 w-full rounded-md border border-ksmile-line px-3 py-3 text-base outline-none focus:border-ksmile-green"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Format" name="format" defaultValue={defaults?.format ?? "1 u"} required />
        <Field
          label="Prix (FCFA)"
          name="priceFcfa"
          type="number"
          defaultValue={String(defaults?.priceFcfa ?? 0)}
          required
        />
        <Field
          label="Stock physique"
          name="physicalStock"
          type="number"
          defaultValue={String(defaults?.physicalStock ?? 0)}
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold">Catégorie</label>
        <select
          name="categorySlug"
          defaultValue={defaultCategory}
          required
          className="min-h-12 w-full rounded-md border border-ksmile-line px-3 py-3 text-base outline-none focus:border-ksmile-green"
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <ImageUploadField defaultUrl={defaults?.imageUrl} />
      <div className="grid grid-cols-2 gap-2 text-base sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-3">
        <label className="flex min-h-12 items-center gap-3 rounded-md border border-ksmile-line bg-ksmile-surface/50 px-3">
          <input
            type="checkbox"
            name="isNew"
            defaultChecked={defaults?.isNew}
            className="size-5 shrink-0 accent-ksmile-green"
          />
          Nouveau
        </label>
        <label className="flex min-h-12 items-center gap-3 rounded-md border border-ksmile-line bg-ksmile-surface/50 px-3">
          <input
            type="checkbox"
            name="pack"
            defaultChecked={defaults?.pack}
            className="size-5 shrink-0 accent-ksmile-green"
          />
          Pack
        </label>
        <label className="flex min-h-12 items-center gap-3 rounded-md border border-ksmile-line bg-ksmile-surface/50 px-3">
          <input
            type="checkbox"
            name="popular"
            defaultChecked={defaults?.popular}
            className="size-5 shrink-0 accent-ksmile-green"
          />
          Populaire
        </label>
        <label className="flex min-h-12 items-center gap-3 rounded-md border border-ksmile-line bg-ksmile-surface/50 px-3">
          <input
            type="checkbox"
            name="published"
            defaultChecked={defaults?.published ?? true}
            className="size-5 shrink-0 accent-ksmile-green"
          />
          Publié
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
