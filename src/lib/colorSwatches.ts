export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  category?: "primary" | "secondary" | "accent" | "custom";
  isDark: boolean;
  createdAt: string;
}

export const DEFAULT_COLOR_SWATCHES: ColorSwatch[] = [
  { id: "swatch-navy-900", name: "Deep Royal Navy", hex: "#23216B", category: "primary", isDark: true, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-oceanic-blue", name: "Oceanic Blue (Client Brand)", hex: "#13416B", category: "custom", isDark: true, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-navy-700", name: "Classic Navy", hex: "#34318F", category: "primary", isDark: true, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-gold-500", name: "British Academic Gold", hex: "#D9B84A", category: "accent", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-gold-700", name: "Muted Antique Gold", hex: "#B78A2E", category: "accent", isDark: true, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-mint", name: "Fresh Mint", hex: "#E8F4F1", category: "secondary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-peach", name: "Warm Peach", hex: "#FFEDD5", category: "secondary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-lavender", name: "Soft Lavender Mist", hex: "#F3E8FF", category: "secondary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-sky", name: "Sky Mist", hex: "#EBF5FB", category: "secondary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-coral", name: "Coral Promotional", hex: "#E53935", category: "accent", isDark: true, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-paper", name: "Parchment Paper", hex: "#FAF8F3", category: "primary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
  { id: "swatch-white", name: "Pure White", hex: "#FFFFFF", category: "primary", isDark: false, createdAt: "2026-10-21T00:00:00Z" },
];
