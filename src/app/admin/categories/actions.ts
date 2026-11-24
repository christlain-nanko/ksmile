"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidateCatalog } from "@/lib/revalidate-catalog";
import { slugify } from "@/lib/slug";

export type CategoryActionState = { error?: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");
  return session.user;
}

const categorySchema = z.object({
  name: z.string().min(1, "Nom requis"),
  shortName: z.string().min(1, "Nom court requis"),
  description: z.string().min(1, "Description requise"),
  slug: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  inNav: z.boolean(),
});

function readCategory(formData: FormData) {
  return categorySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    shortName: String(formData.get("shortName") ?? ""),
    description: String(formData.get("description") ?? ""),
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    sortOrder: formData.get("sortOrder") ?? 0,
    inNav: formData.get("inNav") === "on",
  });
}

export async function createCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    await requireAdmin();
    const parsed = readCategory(formData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
    }

    const slug = parsed.data.slug
      ? slugify(parsed.data.slug)
      : slugify(parsed.data.name);
    if (!slug) return { error: "Slug invalide" };

    const exists = await prisma.category.findUnique({ where: { slug } });
    if (exists) return { error: `La catégorie « ${slug} » existe déjà.` };

    await prisma.category.create({
      data: {
        slug,
        name: parsed.data.name,
        shortName: parsed.data.shortName,
        description: parsed.data.description,
        sortOrder: parsed.data.sortOrder,
        inNav: parsed.data.inNav,
      },
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Création impossible",
    };
  }

  revalidateCatalog();
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/catalogue");
  redirect("/admin/categories");
}

export async function updateCategory(
  categoryId: string,
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  try {
    await requireAdmin();
    const parsed = readCategory(formData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
    }

    const current = await prisma.category.findUniqueOrThrow({
      where: { id: categoryId },
    });

    const slug = parsed.data.slug
      ? slugify(parsed.data.slug)
      : current.slug;
    if (!slug) return { error: "Slug invalide" };

    if (slug !== current.slug) {
      const clash = await prisma.category.findUnique({ where: { slug } });
      if (clash) return { error: `La catégorie « ${slug} » existe déjà.` };
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: {
        slug,
        name: parsed.data.name,
        shortName: parsed.data.shortName,
        description: parsed.data.description,
        sortOrder: parsed.data.sortOrder,
        inNav: parsed.data.inNav,
      },
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Enregistrement impossible",
    };
  }

  revalidateCatalog();
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/");
  revalidatePath("/catalogue");
  redirect("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  const count = await prisma.product.count({ where: { categoryId } });
  if (count > 0) {
    throw new Error(
      `Impossible de supprimer : ${count} produit(s) utilisent cette catégorie. Déplacez-les d’abord.`,
    );
  }
  await prisma.category.delete({ where: { id: categoryId } });
  revalidateCatalog();
  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}
