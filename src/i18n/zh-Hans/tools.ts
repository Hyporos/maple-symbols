// Machine draft (REGIONS D-12), awaiting a native CMS player's review before it is served.
// Tools card: the Symbol Selector and Catalyst previews.
export const tools = {
  symbolSelector: "{symbolSelector}",
  arcaneSelectorAlt: "{arcaneSelector}",
  sacredSelectorAlt: "{sacredSelector}",
  arcaneCatalyst: "{arcaneCatalyst}",
  sacredCatalyst: "{sacredCatalyst}",
  // The world limit, shown before either tooltip only where the server has one
  // (`catalystRegularWorldOnly` in src/lib/regions.json).
  catalystWorldTag: "<b>[仅限{regularServer}]</b>",
  arcaneCatalystTooltip: "可在同一世界内转移一次{aArcaneSymbol}",
  sacredCatalystTooltip: "可在同一世界内转移一次{aSacredSymbol}",
  countPlaceholder: "数量",
  apply: "应用",
  // The preview tooltip draws "[Before → After]" with an arrow icon between the two words.
  before: "使用前",
  after: "使用后",
  selectorPreviewTooltip: "等级 / 经验",
  catalystPreviewTooltip: "徽章等级 / 经验",
  disabledWhileUnlocked: "解除经验上限时，此功能<b>不可用</b>",
  catalystLevelTooLow: "需要等级 2 或以上",
  arcaneExpLoss: "使用后经验 -20%",
  sacredExpLoss: "使用后经验 -40%",
} as const;
