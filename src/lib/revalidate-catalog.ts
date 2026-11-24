import { updateTag } from "next/cache";
import { CATALOG_CACHE_TAG } from "@/lib/catalog";

/** Invalide le cache catalogue après mutation admin / stock. */
export function revalidateCatalog() {
  updateTag(CATALOG_CACHE_TAG);
}
