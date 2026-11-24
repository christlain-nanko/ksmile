/** Slug de catégorie (ex. hygiene-quotidienne). Libre en base. */
export type CategorySlug = string;

export type StockStatus = "in_stock" | "low" | "out_of_stock";

export interface Category {
  id?: string;
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  inNav: boolean;
  sortOrder?: number;
}

export interface ProductVariant {
  id: string;
  label: string;
  format: string;
  priceFcfa: number;
  stockAvailable: number;
}

export interface Product {
  id: string;
  slug: string;
  brand: string;
  name: string;
  category: CategorySlug;
  description: string;
  format: string;
  priceFcfa: number;
  isNew?: boolean;
  pack?: boolean;
  popular?: boolean;
  stockAvailable: number;
  variants?: ProductVariant[];
  imageUrl?: string | null;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  /** Instantané pour affichage panier (localStorage) */
  name: string;
  brand: string;
  slug: string;
  format: string;
  priceFcfa: number;
  stockAvailable: number;
}

export type SortOption = "pertinence" | "prix-asc" | "prix-desc" | "nom";
