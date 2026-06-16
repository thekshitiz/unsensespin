import type { SlotTheme } from "@/types/slot";

export const themes: Record<SlotTheme["id"], SlotTheme> = {
  "empire-conquest": {
    id: "empire-conquest",
    name: "Empire Conquest",
    description: "Original map-and-castle symbols with a restrained adventure tone.",
    className: "from-slate-950 via-indigo-950 to-amber-950",
    symbols: [
      { id: "crown", label: "Crown", tier: "high" },
      { id: "coin-chest", label: "Coin Chest", tier: "high" },
      { id: "castle", label: "Castle", tier: "medium" },
      { id: "sword", label: "Sword", tier: "medium" },
      { id: "shield", label: "Shield", tier: "medium" },
      { id: "scroll", label: "Scroll", tier: "low" },
      { id: "banner", label: "Banner", tier: "low" },
      { id: "map", label: "Map", tier: "low" },
    ],
  },
  "reel-catch": {
    id: "reel-catch",
    name: "Reel Catch",
    description: "Original sea-side symbols with a friendly arcade feel.",
    className: "from-slate-950 via-cyan-950 to-yellow-950",
    symbols: [
      { id: "fisherman", label: "Fisherman", tier: "high" },
      { id: "treasure-chest", label: "Treasure", tier: "high" },
      { id: "lighthouse", label: "Lighthouse", tier: "medium" },
      { id: "boat", label: "Boat", tier: "medium" },
      { id: "fish", label: "Fish", tier: "medium" },
      { id: "rod", label: "Rod", tier: "low" },
      { id: "anchor", label: "Anchor", tier: "low" },
      { id: "wave", label: "Wave", tier: "low" },
    ],
  },
};

export const themeList = Object.values(themes);
