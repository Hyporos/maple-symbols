// Tools card: the Symbol Selector and Catalyst previews.
export const tools = {
  symbolSelector: "{symbolSelector}",
  arcaneSelectorAlt: "{arcaneSelector}",
  sacredSelectorAlt: "{sacredSelector}",
  arcaneCatalyst: "{arcaneCatalyst}",
  sacredCatalyst: "{sacredCatalyst}",
  // The world limit, shown before either tooltip only where the server has one
  // (`catalystRegularWorldOnly` in src/lib/regions.json).
  catalystWorldTag: "<b>[{regularServer} Only]</b>",
  arcaneCatalystTooltip: "Transfer {aArcaneSymbol} once within the same world",
  sacredCatalystTooltip: "Transfer {aSacredSymbol} once within the same world",
  countPlaceholder: "Count",
  apply: "Apply",
  // The preview tooltip draws "[Before → After]" with an arrow icon between the two words.
  before: "Before",
  after: "After",
  selectorPreviewTooltip: "Level / Experience",
  catalystPreviewTooltip: "Symbol Level / Exp",
  disabledWhileUnlocked: "This feature is <b>disabled</b> while experience is unlocked",
  catalystLevelTooLow: "Must be level 2 or higher",
  arcaneExpLoss: "-20% EXP upon use",
  sacredExpLoss: "-40% EXP upon use",
} as const;
