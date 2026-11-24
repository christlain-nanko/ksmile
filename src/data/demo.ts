import type { Category, Product, SortOption } from "@/types";

/** Données de démonstration clairement fictives, non connectées. */
export const DEMO_NOTICE =
  "Données de démonstration : catalogue fictif, non connecté à un stock réel.";

export const categories: Category[] = [
  {
    slug: "hygiene-quotidienne",
    name: "Hygiène quotidienne",
    shortName: "Hygiène",
    description: "Savon, dentifrice, déodorants et essentiels du quotidien.",
    inNav: true,
  },
  {
    slug: "beaute-soins",
    name: "Beauté et soins",
    shortName: "Beauté",
    description: "Soins visage, corps et essentiels beauté.",
    inNav: true,
  },
  {
    slug: "cheveux",
    name: "Cheveux",
    shortName: "Cheveux",
    description: "Shampoings, huiles et soins capillaires.",
    inNav: true,
  },
  {
    slug: "bebe-famille",
    name: "Bébé et famille",
    shortName: "Bébé",
    description: "Couches, lingettes et soins pour toute la famille.",
    inNav: true,
  },
  {
    slug: "entretien-maison",
    name: "Entretien de la maison",
    shortName: "Maison",
    description: "Lessive, vaisselle et entretien ménager.",
    inNav: true,
  },
  {
    slug: "nouveautes",
    name: "Nouveautés",
    shortName: "Nouveautés",
    description: "Les derniers arrivages du catalogue Ksmile.",
    inNav: true,
  },
  {
    slug: "packs-offres",
    name: "Packs et offres",
    shortName: "Packs",
    description: "Assortiments pratiques et offres groupées.",
    inNav: true,
  },
];

export const products: Product[] = [
  {
    id: "p1",
    slug: "ksmile-savon-doux-karite",
    brand: "Ksmile Care",
    name: "Savon doux au karité",
    category: "hygiene-quotidienne",
    description:
      "Savon familial au beurre de karité pour une peau propre et confortable. Usage quotidien.",
    format: "200 g",
    priceFcfa: 1500,
    popular: true,
    isNew: true,
    stockAvailable: 24,
    variants: [
      {
        id: "p1-v1",
        label: "200 g",
        format: "200 g",
        priceFcfa: 1500,
        stockAvailable: 24,
      },
      {
        id: "p1-v2",
        label: "Lot de 3",
        format: "3 × 200 g",
        priceFcfa: 4000,
        stockAvailable: 8,
      },
    ],
  },
  {
    id: "p2",
    slug: "freshday-dentifrice-menthe",
    brand: "FreshDay",
    name: "Dentifrice menthe fraîche",
    category: "hygiene-quotidienne",
    description:
      "Dentifrice à la menthe pour une haleine fraîche. Tube familial.",
    format: "100 ml",
    priceFcfa: 2200,
    popular: true,
    stockAvailable: 18,
  },
  {
    id: "p3",
    slug: "pureguard-deodorant-naturel",
    brand: "PureGuard",
    name: "Déodorant naturel stick",
    category: "hygiene-quotidienne",
    description: "Protection douce sans alcool agressif. Format stick.",
    format: "50 ml",
    priceFcfa: 3500,
    isNew: true,
    stockAvailable: 3,
  },
  {
    id: "p4",
    slug: "glowlab-creme-visage",
    brand: "GlowLab",
    name: "Crème visage hydratante",
    category: "beaute-soins",
    description:
      "Crème légère qui hydrate sans effet gras. Peaux mixtes à sèches.",
    format: "50 ml",
    priceFcfa: 6500,
    popular: true,
    isNew: true,
    stockAvailable: 9,
  },
  {
    id: "p5",
    slug: "glowlab-lait-corps",
    brand: "GlowLab",
    name: "Lait corps nourrissant",
    category: "beaute-soins",
    description: "Lait corps pour une peau souple toute la journée.",
    format: "400 ml",
    priceFcfa: 4800,
    stockAvailable: 14,
  },
  {
    id: "p6",
    slug: "cocosoft-huile-capillaire",
    brand: "CocoSoft",
    name: "Huile capillaire coco",
    category: "cheveux",
    description:
      "Huile nourrissante à la noix de coco pour cheveux secs et abîmés.",
    format: "100 ml",
    priceFcfa: 4500,
    popular: true,
    isNew: true,
    stockAvailable: 12,
    variants: [
      {
        id: "p6-v1",
        label: "100 ml",
        format: "100 ml",
        priceFcfa: 4500,
        stockAvailable: 12,
      },
      {
        id: "p6-v2",
        label: "250 ml",
        format: "250 ml",
        priceFcfa: 8500,
        stockAvailable: 5,
      },
    ],
  },
  {
    id: "p7",
    slug: "cocosoft-shampoing-doux",
    brand: "CocoSoft",
    name: "Shampoing doux quotidien",
    category: "cheveux",
    description: "Shampoing doux pour lavage fréquent. Cheveux souples.",
    format: "400 ml",
    priceFcfa: 3800,
    stockAvailable: 0,
  },
  {
    id: "p8",
    slug: "cocosoft-apres-shampoing",
    brand: "CocoSoft",
    name: "Après-shampoing démêlant",
    category: "cheveux",
    description: "Facilite le démêlage et apporte de la douceur.",
    format: "250 ml",
    priceFcfa: 4200,
    isNew: true,
    stockAvailable: 10,
  },
  {
    id: "p9",
    slug: "douceu-lingettes-bebe",
    brand: "Douceu",
    name: "Lingettes bébé douceur",
    category: "bebe-famille",
    description:
      "Lingettes sans parfum agressif pour le change. Paquet refermable.",
    format: "72 lingettes",
    priceFcfa: 2800,
    popular: true,
    stockAvailable: 30,
  },
  {
    id: "p10",
    slug: "douceu-lait-toilette",
    brand: "Douceu",
    name: "Lait de toilette bébé",
    category: "bebe-famille",
    description: "Nettoie en douceur la peau fragile de bébé.",
    format: "500 ml",
    priceFcfa: 4200,
    isNew: true,
    stockAvailable: 14,
  },
  {
    id: "p11",
    slug: "douceu-couches-taille-3",
    brand: "Douceu",
    name: "Couches taille 3",
    category: "bebe-famille",
    description: "Couches absorbantes pour bébés de 4 à 9 kg.",
    format: "48 couches",
    priceFcfa: 9500,
    stockAvailable: 7,
  },
  {
    id: "p12",
    slug: "maisonnette-lessive-liquide",
    brand: "Maisonnette",
    name: "Lessive liquide familiale",
    category: "entretien-maison",
    description: "Lessive efficace à basse température. Parfum frais.",
    format: "2 L",
    priceFcfa: 5500,
    popular: true,
    stockAvailable: 11,
  },
  {
    id: "p13",
    slug: "maisonnette-vaisselle-citron",
    brand: "Maisonnette",
    name: "Liquide vaisselle citron",
    category: "entretien-maison",
    description: "Dégraisse efficacement avec un parfum citron léger.",
    format: "750 ml",
    priceFcfa: 1800,
    isNew: true,
    stockAvailable: 22,
  },
  {
    id: "p14",
    slug: "maisonnette-desinfectant",
    brand: "Maisonnette",
    name: "Désinfectant multi-surfaces",
    category: "entretien-maison",
    description: "Nettoie et désinfecte plans de travail et sanitaires.",
    format: "1 L",
    priceFcfa: 3200,
    stockAvailable: 2,
  },
  {
    id: "p15",
    slug: "pack-hygiene-famille",
    brand: "Ksmile",
    name: "Pack hygiène famille",
    category: "packs-offres",
    description: "Savon, dentifrice et déodorant pour l’essentiel hygiène.",
    format: "Pack 3 produits",
    priceFcfa: 6500,
    pack: true,
    popular: true,
    stockAvailable: 6,
  },
  {
    id: "p16",
    slug: "pack-bebe-accueil",
    brand: "Ksmile",
    name: "Pack bébé accueil",
    category: "packs-offres",
    description: "Lingettes et lait de toilette pour les premiers jours.",
    format: "Pack 2 produits",
    priceFcfa: 6200,
    pack: true,
    popular: true,
    isNew: true,
    stockAvailable: 4,
  },
  {
    id: "p17",
    slug: "pack-maison-propre",
    brand: "Ksmile",
    name: "Pack maison propre",
    category: "packs-offres",
    description: "Lessive et liquide vaisselle pour l’entretien simple.",
    format: "Pack 2 produits",
    priceFcfa: 6800,
    pack: true,
    stockAvailable: 5,
  },
  {
    id: "p18",
    slug: "glowlab-serum-vitamine-c",
    brand: "GlowLab",
    name: "Sérum vitamine C",
    category: "beaute-soins",
    description: "Sérum éclat pour le visage. Texture légère.",
    format: "30 ml",
    priceFcfa: 8900,
    isNew: true,
    stockAvailable: 8,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getNavCategories(): Category[] {
  return categories.filter((c) => c.inNav);
}

export function getProductsByCategory(slug: string): Product[] {
  if (slug === "nouveautes") return products.filter((p) => p.isNew);
  if (slug === "packs-offres") return products.filter((p) => p.pack);
  return products.filter((p) => p.category === slug);
}

export function getPopularProducts(): Product[] {
  return products.filter((p) => p.popular);
}

export function getNewProducts(): Product[] {
  return products.filter((p) => p.isNew);
}

export function getPacks(): Product[] {
  return products.filter((p) => p.pack);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.includes(q),
  );
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

/** Génère une référence de demande démo (simulation locale). */
export function makeDemoRequestRef(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `KSM-${n}`;
}
