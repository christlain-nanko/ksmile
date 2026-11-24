import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { availableStock, normalizeCategorySlug } from "@/lib/slug";
import type { Category, Product, ProductVariant, SortOption } from "@/types";

export const CATALOG_CACHE_TAG = "catalog";

function mapCategory(c: {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  inNav: boolean;
  sortOrder: number;
}): Category {
  return {
    id: c.id,
    slug: normalizeCategorySlug(c.slug),
    name: c.name,
    shortName: c.shortName,
    description: c.description,
    inNav: c.inNav,
    sortOrder: c.sortOrder,
  };
}

function mapProduct(p: {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description: string;
  format: string;
  priceFcfa: number;
  isNew: boolean;
  pack: boolean;
  popular: boolean;
  physicalStock: number;
  reservedStock: number;
  imageUrl?: string | null;
  category: { slug: string };
  variants: Array<{
    id: string;
    label: string;
    format: string;
    priceFcfa: number;
    physicalStock: number;
    reservedStock: number;
  }>;
}): Product {
  const stockAvailable = availableStock(p.physicalStock, p.reservedStock);
  const variants: ProductVariant[] | undefined = p.variants.length
    ? p.variants.map((v) => ({
        id: v.id,
        label: v.label,
        format: v.format,
        priceFcfa: v.priceFcfa,
        stockAvailable: availableStock(v.physicalStock, v.reservedStock),
      }))
    : undefined;

  return {
    id: p.id,
    slug: p.slug,
    brand: p.brand,
    name: p.name,
    category: normalizeCategorySlug(p.category.slug),
    description: p.description,
    format: p.format,
    priceFcfa: p.priceFcfa,
    isNew: p.isNew,
    pack: p.pack,
    popular: p.popular,
    stockAvailable,
    imageUrl: p.imageUrl ?? null,
    variants,
  };
}

const productInclude = {
  category: true,
  variants: true,
} as const;

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(CATALOG_CACHE_TAG);
  const rows = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(mapCategory);
}

export async function getNavCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(CATALOG_CACHE_TAG);
  const rows = await prisma.category.findMany({
    where: { inNav: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapCategory);
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  "use cache";
  cacheTag(CATALOG_CACHE_TAG);
  const normalized = normalizeCategorySlug(slug);
  const row = await prisma.category.findFirst({
    where: {
      OR: [{ slug: normalized }, { slug: normalized.replaceAll("-", "_") }],
    },
  });
  return row ? mapCategory(row) : undefined;
}

export async function getAllProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG_CACHE_TAG);
  const rows = await prisma.product.findMany({
    where: { published: true },
    include: productInclude,
    orderBy: { name: "asc" },
  });
  return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(CATALOG_CACHE_TAG);
  const row = await prisma.product.findFirst({
    where: { slug, published: true },
    include: productInclude,
  });
  return row ? mapProduct(row) : undefined;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(CATALOG_CACHE_TAG);
  const row = await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
  return row ? mapProduct(row) : undefined;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG_CACHE_TAG);
  const normalized = normalizeCategorySlug(slug);

  if (normalized === "nouveautes") {
    const rows = await prisma.product.findMany({
      where: { published: true, isNew: true },
      include: productInclude,
      orderBy: { updatedAt: "desc" },
    });
    return rows.map(mapProduct);
  }
  if (normalized === "packs-offres") {
    const rows = await prisma.product.findMany({
      where: { published: true, pack: true },
      include: productInclude,
      orderBy: { name: "asc" },
    });
    return rows.map(mapProduct);
  }

  const rows = await prisma.product.findMany({
    where: {
      published: true,
      category: {
        OR: [
          { slug: normalized },
          { slug: normalized.replaceAll("-", "_") },
        ],
      },
    },
    include: productInclude,
    orderBy: { name: "asc" },
  });
  return rows.map(mapProduct);
}

export async function getPopularProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG_CACHE_TAG);
  const rows = await prisma.product.findMany({
    where: { published: true, popular: true },
    include: productInclude,
    take: 12,
  });
  return rows.map(mapProduct);
}

export async function getNewProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG_CACHE_TAG);
  const rows = await prisma.product.findMany({
    where: { published: true, isNew: true },
    include: productInclude,
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapProduct);
}

export async function getPacks(): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG_CACHE_TAG);
  const rows = await prisma.product.findMany({
    where: { published: true, pack: true },
    include: productInclude,
  });
  return rows.map(mapProduct);
}

export async function searchProducts(query: string): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG_CACHE_TAG);
  const q = query.trim();
  if (!q) {
    const rows = await prisma.product.findMany({
      where: { published: true },
      include: productInclude,
      orderBy: { name: "asc" },
    });
    return rows.map(mapProduct);
  }
  const rows = await prisma.product.findMany({
    where: {
      published: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    include: productInclude,
  });
  return rows.map(mapProduct);
}

export function sortProducts(list: Product[], tri: SortOption): Product[] {
  const copy = [...list];
  switch (tri) {
    case "prix-asc":
      return copy.sort((a, b) => a.priceFcfa - b.priceFcfa);
    case "prix-desc":
      return copy.sort((a, b) => b.priceFcfa - a.priceFcfa);
    case "nom":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    default:
      return copy;
  }
}
