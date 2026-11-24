import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Ksmile",
    short_name: "Ksmile",
    description:
      "Catalogue de droguerie en ligne. Hygiène, beauté, cheveux, bébé et maison. Demandez, nous confirmons.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: brand.white,
    theme_color: brand.green,
    lang: "fr",
    dir: "ltr",
    categories: ["shopping", "lifestyle"],
    icons: [
      {
        src: "/brand/pwa-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/pwa-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/pwa-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/pwa-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
