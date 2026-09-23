// Tools card: the Symbol Selector and Catalyst previews.
// Machine draft (2026-09-23), awaiting a native JMS player's review before it is served
// (docs/REGIONS.md D-12).
export const tools = {
  symbolSelector: "{symbolSelector}",
  arcaneSelectorAlt: "{arcaneSelector}",
  sacredSelectorAlt: "{sacredSelector}",
  arcaneCatalyst: "{arcaneCatalyst}",
  sacredCatalyst: "{sacredCatalyst}",
  // The world limit, shown before either tooltip only where the server has one
  // (`catalystRegularWorldOnly` in src/lib/regions.json).
  catalystWorldTag: "<b>[{regularServer}限定]</b>",
  arcaneCatalystTooltip: "同じワールド内で{aArcaneSymbol}を1回移動できます",
  sacredCatalystTooltip: "同じワールド内で{aSacredSymbol}を1回移動できます",
  countPlaceholder: "個数",
  apply: "適用",
  // The preview tooltip draws "[Before → After]" with an arrow icon between the two words.
  before: "変更前",
  after: "変更後",
  selectorPreviewTooltip: "レベル / 成長値",
  catalystPreviewTooltip: "シンボルレベル / 成長値",
  disabledWhileUnlocked: "成長値の上限解除中は、この機能を<b>使用できません</b>",
  catalystLevelTooLow: "レベル2以上が必要です",
  arcaneExpLoss: "使用時に成長値-20%",
  sacredExpLoss: "使用時に成長値-40%",
} as const;
