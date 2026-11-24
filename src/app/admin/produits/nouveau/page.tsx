import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { createProduct } from "../actions";

export const instant = false;

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-ksmile-ink">Nouveau produit</h1>
      <ProductForm
        action={createProduct}
        submitLabel="Créer le produit"
        categories={categories.map((c) => ({ slug: c.slug, label: c.name }))}
      />
    </div>
  );
}
