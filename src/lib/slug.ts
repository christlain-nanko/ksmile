/** Slug URL (kebab-case) pour catégories et produits. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Compat : anciennes valeurs enum Prisma (underscores) → slug app. */
export function normalizeCategorySlug(slug: string): string {
  return slug.includes("_") && !slug.includes("-")
    ? slug.replaceAll("_", "-")
    : slug;
}

export function availableStock(physical: number, reserved: number): number {
  return Math.max(0, physical - reserved);
}
