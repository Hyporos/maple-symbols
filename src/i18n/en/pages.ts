// Page titles and descriptions (read by src/lib/routes.ts, SEO.tsx and the build-time routes plugin).
// Titles keep the brand, "| Maple Symbols", as literal text at the end (SEO-6, I18N-8).
export const pages = {
  calculator: {
    title: "{pageGame} {arcane} & {sacredSymbol} Calculator | Maple Symbols",
    description:
      "MapleStory symbol calculator for {arcane} and {sacred} symbols. Track daily and weekly quests, estimate completion dates, and plan your leveling.",
    nav: "Calculator",
  },
  handbook: {
    title: "Symbol Handbook | Maple Symbols",
    description:
      "Complete {arcane} and {sacredSymbol} reference for MapleStory ({pageServer}): experience tables, meso upgrade costs, and damage ratios.",
    nav: "Handbook",
  },
  changelog: {
    title: "Changelog | Maple Symbols",
    description:
      "Full version history and feature updates for Maple Symbols, the MapleStory {arcane} and {sacredSymbol} calculator.",
    nav: "Extras",
  },
  credits: {
    title: "Credits | Maple Symbols",
    description:
      "Credits for Maple Symbols: the resources, creators and community members behind the MapleStory {arcane} and {sacred} symbol calculator.",
  },
  ogImageAlt: "Maple Symbols — MapleStory Symbol Calculator",
} as const;
