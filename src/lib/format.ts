export function formatFcfa(amount: number): string {
  const digits = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${digits} FCFA`;
}

export function stockStatus(
  available: number,
): "in_stock" | "low" | "out_of_stock" {
  if (available <= 0) return "out_of_stock";
  if (available <= 5) return "low";
  return "in_stock";
}
