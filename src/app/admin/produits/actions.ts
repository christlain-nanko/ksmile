"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { uploadProductImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { revalidateCatalog } from "@/lib/revalidate-catalog";
import { slugify as makeSlug } from "@/lib/slug";

export type ProductActionState = {
  error?: string;
  ok?: boolean;
};

async function resolveImageUrl(formData: FormData): Promise<string | null> {
  const file = formData.get("image");
  if (
    file instanceof File &&
    file.size > 0 &&
    file.name &&
    file.type.startsWith("image/")
  ) {
    return uploadProductImage(file);
  }
  const existing = formData.get("imageUrl");
  if (typeof existing === "string" && existing.trim()) {
    return existing.trim();
  }
  return null;
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorisé");
  return session.user;
}

const productSchema = z.object({
  brand: z.string().min(1, "Marque requise"),
  name: z.string().min(1, "Nom requis"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (ex. savon-doux)"),
  description: z.string().min(1, "Description requise"),
  format: z.string().min(1),
  priceFcfa: z.coerce.number().int().min(0),
  physicalStock: z.coerce.number().int().min(0),
  categorySlug: z.string().min(1),
});

function readFlags(formData: FormData) {
  return {
    isNew: formData.get("isNew") === "on",
    pack: formData.get("pack") === "on",
    popular: formData.get("popular") === "on",
    published: formData.get("published") === "on",
  };
}

function parseProduct(formData: FormData) {
  const parsed = productSchema.safeParse({
    brand: String(formData.get("brand") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    format: String(formData.get("format") ?? ""),
    priceFcfa: formData.get("priceFcfa"),
    physicalStock: formData.get("physicalStock"),
    categorySlug: String(formData.get("categorySlug") ?? ""),
  });
  return parsed;
}

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  try {
    await requireAdmin();
    const parsed = parseProduct(formData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
    }
    const flags = readFlags(formData);
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: parsed.data.categorySlug },
    });
    const imageUrl = await resolveImageUrl(formData);

    await prisma.product.create({
      data: {
        brand: parsed.data.brand,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        format: parsed.data.format,
        priceFcfa: parsed.data.priceFcfa,
        physicalStock: parsed.data.physicalStock,
        reservedStock: 0,
        isNew: flags.isNew,
        pack: flags.pack,
        popular: flags.popular,
        published: flags.published,
        imageUrl,
        categoryId: category.id,
      },
    });

    revalidateCatalog();
    revalidatePath("/");
    revalidatePath("/catalogue");
    revalidatePath("/admin/produits");
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Création impossible",
    };
  }
  redirect("/admin/produits");
}

export async function updateProduct(
  productId: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  try {
    await requireAdmin();
    const parsed = parseProduct(formData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
    }
    const flags = readFlags(formData);
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: parsed.data.categorySlug },
    });
    const imageUrl = await resolveImageUrl(formData);

    await prisma.product.update({
      where: { id: productId },
      data: {
        brand: parsed.data.brand,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        format: parsed.data.format,
        priceFcfa: parsed.data.priceFcfa,
        physicalStock: parsed.data.physicalStock,
        isNew: flags.isNew,
        pack: flags.pack,
        popular: flags.popular,
        published: flags.published,
        imageUrl,
        categoryId: category.id,
      },
    });

    revalidateCatalog();
    revalidatePath("/");
    revalidatePath("/catalogue");
    revalidatePath("/admin/produits");
    revalidatePath(`/admin/produits/${productId}`);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Enregistrement impossible",
    };
  }
  redirect("/admin/produits");
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: productId } });
  revalidateCatalog();
  revalidatePath("/admin/produits");
  revalidatePath("/");
  redirect("/admin/produits");
}

export async function importProductsExcel(
  formData: FormData,
): Promise<{ created: number; updated: number; errors: string[] }> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choisissez un fichier Excel (.xlsx) à importer.");
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".xlsx") && !name.endsWith(".xls") && !name.endsWith(".csv")) {
    throw new Error("Format non supporté. Utilisez un fichier .xlsx (Excel).");
  }

  const { workbookFromBuffer, rowsFromWorkbook, parseImportRows } =
    await import("@/lib/product-import");

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = workbookFromBuffer(buffer);
  const rawRows = rowsFromWorkbook(workbook);
  if (rawRows.length === 0) {
    throw new Error("Aucune ligne de produit trouvée dans le fichier.");
  }

  const dbCategories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const { rows, errors } = parseImportRows(
    rawRows,
    dbCategories.map((c) => ({ label: c.name, slug: c.slug })),
  );
  if (rows.length === 0) {
    throw new Error(
      errors[0] ||
        "Aucun produit valide. Vérifiez les colonnes du modèle Excel.",
    );
  }

  let created = 0;
  let updated = 0;
  const rowErrors = [...errors];

  for (const [index, parsed] of rows.entries()) {
    try {
      const slug =
        parsed.slug?.trim() || makeSlug(`${parsed.brand}-${parsed.name}`);
      const category = await prisma.category.findUnique({
        where: { slug: parsed.categorySlug },
      });
      if (!category) {
        rowErrors.push(
          `Produit « ${parsed.name} » : catégorie introuvable en base.`,
        );
        continue;
      }

      const existing = await prisma.product.findUnique({ where: { slug } });
      const payload = {
        brand: parsed.brand,
        name: parsed.name,
        description: parsed.description || parsed.name,
        format: parsed.format,
        priceFcfa: parsed.priceFcfa,
        physicalStock: parsed.physicalStock,
        isNew: parsed.isNew,
        pack: parsed.pack,
        popular: parsed.popular,
        published: parsed.published,
        imageUrl: parsed.imageUrl || null,
        categoryId: category.id,
      };

      if (existing) {
        await prisma.product.update({ where: { slug }, data: payload });
        updated += 1;
      } else {
        await prisma.product.create({
          data: { slug, reservedStock: 0, ...payload },
        });
        created += 1;
      }
    } catch (err) {
      rowErrors.push(
        `Ligne ${index + 2} (« ${parsed.name} ») : ${
          err instanceof Error ? err.message : "erreur"
        }`,
      );
    }
  }

  revalidateCatalog();
  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath("/admin/produits");
  return { created, updated, errors: rowErrors };
}
