import * as XLSX from "xlsx";
import type { CategorySlug } from "@/types";
import { slugify } from "@/lib/slug";

/** En-têtes Excel en français (ligne 1 du modèle). */
export const EXCEL_HEADERS = [
  "Marque",
  "Nom",
  "Slug",
  "Description",
  "Format",
  "Prix_FCFA",
  "Stock",
  "Categorie",
  "Nouveau",
  "Pack",
  "Populaire",
  "Image_URL",
  "Publie",
] as const;

export type CategoryOption = { label: string; slug: string };

export type ImportProductRow = {
  brand: string;
  name: string;
  slug?: string;
  description: string;
  format: string;
  priceFcfa: number;
  physicalStock: number;
  categorySlug: CategorySlug;
  isNew: boolean;
  pack: boolean;
  popular: boolean;
  imageUrl?: string | null;
  published: boolean;
};

function cell(row: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const direct = row[key];
    if (direct !== undefined && direct !== null && String(direct).trim() !== "") {
      return String(direct).trim();
    }
    const found = Object.keys(row).find(
      (k) => k.trim().toLowerCase() === key.trim().toLowerCase(),
    );
    if (found != null) {
      const v = row[found];
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        return String(v).trim();
      }
    }
  }
  return "";
}

function truthy(v: string) {
  return ["1", "true", "oui", "yes", "on", "o", "x"].includes(v.toLowerCase());
}

function toInt(v: string, fallback = 0) {
  if (!v) return fallback;
  const n = Number(String(v).replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.round(n));
}

export function resolveCategorySlug(
  input: string,
  categories: CategoryOption[],
): CategorySlug | null {
  const raw = input.trim();
  if (!raw) return null;

  const bySlug = categories.find(
    (c) => c.slug.toLowerCase() === raw.toLowerCase(),
  );
  if (bySlug) return bySlug.slug;

  const byLabel = categories.find(
    (c) => c.label.toLowerCase() === raw.toLowerCase(),
  );
  if (byLabel) return byLabel.slug;

  const normalized = slugify(raw);
  const byNorm = categories.find((c) => c.slug === normalized);
  return byNorm?.slug ?? null;
}

export function parseImportRows(
  rows: Record<string, unknown>[],
  categories: CategoryOption[],
): { rows: ImportProductRow[]; errors: string[] } {
  const out: ImportProductRow[] = [];
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const line = index + 2;
    const brand = cell(row, "Marque", "brand");
    const name = cell(row, "Nom", "name");
    if (!brand && !name) return;
    if (!brand || !name) {
      errors.push(`Ligne ${line} : Marque et Nom sont obligatoires.`);
      return;
    }

    const categoryRaw = cell(
      row,
      "Categorie",
      "Catégorie",
      "categorySlug",
      "category",
    );
    const categorySlug = resolveCategorySlug(categoryRaw, categories);
    if (!categorySlug) {
      errors.push(
        `Ligne ${line} : catégorie inconnue « ${categoryRaw || "(vide)"} ». Voir l’onglet Categories.`,
      );
      return;
    }

    const slug = cell(row, "Slug", "slug") || undefined;
    const description = cell(row, "Description", "description") || name;
    const format = cell(row, "Format", "format") || "1 u";
    const priceFcfa = toInt(cell(row, "Prix_FCFA", "Prix", "priceFcfa"));
    const physicalStock = toInt(cell(row, "Stock", "physicalStock", "stock"));
    const imageUrl = cell(row, "Image_URL", "imageUrl", "Image") || null;
    const publishedRaw = cell(row, "Publie", "Publié", "published");

    out.push({
      brand,
      name,
      slug,
      description,
      format,
      priceFcfa,
      physicalStock,
      categorySlug,
      isNew: truthy(cell(row, "Nouveau", "isNew")),
      pack: truthy(cell(row, "Pack", "pack")),
      popular: truthy(cell(row, "Populaire", "popular")),
      imageUrl,
      published: publishedRaw ? truthy(publishedRaw) : true,
    });
  });

  return { rows: out, errors };
}

export function workbookFromBuffer(buffer: ArrayBuffer | Buffer) {
  return XLSX.read(buffer, { type: "buffer", cellDates: false });
}

export function rowsFromWorkbook(workbook: XLSX.WorkBook) {
  const sheetName =
    workbook.SheetNames.find((n) => n.toLowerCase() !== "categories") ??
    workbook.SheetNames[0];
  if (!sheetName) throw new Error("Le fichier Excel est vide.");
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
}

export function buildTemplateWorkbook(categories: CategoryOption[]) {
  const first = categories[0]?.label ?? "Hygiène quotidienne";
  const second = categories[1]?.label ?? first;

  const example = [
    {
      Marque: "Ksmile Care",
      Nom: "Gel douche coco",
      Slug: "gel-douche-coco",
      Description: "Gel douche familial au coco.",
      Format: "400 ml",
      Prix_FCFA: 2500,
      Stock: 20,
      Categorie: first,
      Nouveau: "oui",
      Pack: "non",
      Populaire: "non",
      Image_URL: "",
      Publie: "oui",
    },
    {
      Marque: "GlowLab",
      Nom: "Crème visage hydratante",
      Slug: "",
      Description: "Crème hydratante pour peaux normales.",
      Format: "50 ml",
      Prix_FCFA: 4500,
      Stock: 12,
      Categorie: second,
      Nouveau: "non",
      Pack: "non",
      Populaire: "oui",
      Image_URL: "",
      Publie: "oui",
    },
  ];

  const productsSheet = XLSX.utils.json_to_sheet(example, {
    header: [...EXCEL_HEADERS],
  });
  productsSheet["!cols"] = EXCEL_HEADERS.map((h) => ({
    wch: Math.max(12, h.length + 2),
  }));

  const categoriesSheet = XLSX.utils.aoa_to_sheet([
    ["Categorie (liste déroulante / à copier)", "Slug technique"],
    ...categories.map((c) => [c.label, c.slug]),
    [],
    ["Conseils"],
    ["1. Gardez la ligne d’en-tête de l’onglet Produits."],
    ["2. Une ligne = un produit."],
    ["3. Categorie : choisissez un libellé de cet onglet."],
    ["4. Nouveau / Pack / Populaire / Publie : oui ou non."],
    ["5. Slug vide = généré automatiquement."],
  ]);
  categoriesSheet["!cols"] = [{ wch: 48 }, { wch: 24 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, productsSheet, "Produits");
  XLSX.utils.book_append_sheet(wb, categoriesSheet, "Categories");
  return wb;
}

export function templateToBuffer(categories: CategoryOption[]) {
  const wb = buildTemplateWorkbook(categories);
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
