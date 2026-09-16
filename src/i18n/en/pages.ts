// Page titles and descriptions (read by src/lib/routes.ts, SEO.tsx and the build-time routes plugin).
// Titles keep the brand, "| Maple Symbols", as literal text at the end (SEO-6, I18N-8).
export const pages = {
  calculator: {
    title: "MapleStory Arcane & Sacred Symbol Calculator | Maple Symbols",
    description:
      "MapleStory symbol calculator for Arcane and Sacred symbols. Track daily and weekly quests, estimate completion dates, and plan your leveling.",
    nav: "Calculator",
  },
  handbook: {
    title: "Symbol Handbook | Maple Symbols",
    description:
      "Complete Arcane and Sacred Symbol reference: experience tables, meso upgrade costs, and daily/weekly quest ratios for every MapleStory region.",
    nav: "Handbook",
  },
  changelog: {
    title: "Changelog | Maple Symbols",
    description:
      "Full version history and feature updates for Maple Symbols, the MapleStory Arcane and Sacred Symbol calculator.",
    nav: "Extras",
  },
  credits: {
    title: "Credits | Maple Symbols",
    description:
      "Credits for Maple Symbols: the resources, creators and community members behind the MapleStory Arcane and Sacred symbol calculator.",
  },
  ogImageAlt: "Maple Symbols — MapleStory Symbol Calculator",
} as const;
