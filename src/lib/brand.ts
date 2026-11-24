/**
 * Identité Ksmile
 *
 * Deux logos distincts (ne jamais les fusionner ni les juxtaposer) :
 * - logo-mark.png     → monogramme KS + sourire (favicon, icônes, petits espaces)
 * - logo-wordmark.png → mot-symbole Ksmile + sourire (en-tête, supports de marque)
 *
 * Orthographe : « Ksmile »
 */
export const brand = {
  green: "#14583c",
  greenDark: "#0e4630",
  greenSoft: "#e7f2ec",
  coral: "#f07c68",
  coralSoft: "#fdeae6",
  white: "#ffffff",
  surface: "#f7f7f7",
  ink: "#1a1a1a",
  muted: "#5c5c5c",
  line: "#e6e6e6",
  name: "Ksmile",
  tagline: "Beauté · Soins · Essentiels",
  assets: {
    mark: "/brand/logo-mark.png",
    wordmark: "/brand/logo-wordmark.png",
  },
} as const;
