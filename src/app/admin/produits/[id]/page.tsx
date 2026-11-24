import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { LoadingState } from "@/components/ui/States";
import { prisma } from "@/lib/prisma";
import { deleteProduct, updateProduct } from "../actions";
import { Button } from "@/components/ui/Button";

export const instant = false;

type Params = Promise<{ id: string }>;

export default function EditProductPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<LoadingState label="Chargement du produit…" />}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: { params: Params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  const update = updateProduct.bind(null, product.id);
  const remove = deleteProduct.bind(null, product.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ksmile-ink">
          Modifier · {product.name}
        </h1>
        <form action={remove}>
          <Button type="submit" variant="secondary">
            Supprimer
          </Button>
        </form>
      </div>
      <ProductForm
        action={update}
        submitLabel="Enregistrer"
        categories={categories.map((c) => ({ slug: c.slug, label: c.name }))}
        defaults={{
          brand: product.brand,
          name: product.name,
          slug: product.slug,
          description: product.description,
          format: product.format,
          priceFcfa: product.priceFcfa,
          physicalStock: product.physicalStock,
          categorySlug: product.category.slug,
          isNew: product.isNew,
          pack: product.pack,
          popular: product.popular,
          published: product.published,
          imageUrl: product.imageUrl,
        }}
      />
    </div>
  );
}
