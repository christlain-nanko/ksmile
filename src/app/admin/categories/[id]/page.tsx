import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/States";
import { prisma } from "@/lib/prisma";
import { deleteCategory, updateCategory } from "../actions";

export const instant = false;

type Params = Promise<{ id: string }>;

export default function EditCategoryPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<LoadingState label="Chargement…" />}>
      <EditCategory params={params} />
    </Suspense>
  );
}

async function EditCategory({ params }: { params: Params }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) notFound();

  const update = updateCategory.bind(null, category.id);
  const remove = deleteCategory.bind(null, category.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ksmile-ink">
            Modifier · {category.name}
          </h1>
          <p className="mt-1 text-sm text-ksmile-muted">
            {category._count.products} produit
            {category._count.products > 1 ? "s" : ""} dans cette catégorie
          </p>
        </div>
        {category._count.products === 0 ? (
          <form action={remove}>
            <Button type="submit" variant="secondary">
              Supprimer
            </Button>
          </form>
        ) : null}
      </div>
      <CategoryForm
        action={update}
        submitLabel="Enregistrer"
        defaults={{
          name: category.name,
          shortName: category.shortName,
          slug: category.slug,
          description: category.description,
          sortOrder: category.sortOrder,
          inNav: category.inNav,
        }}
      />
    </div>
  );
}
