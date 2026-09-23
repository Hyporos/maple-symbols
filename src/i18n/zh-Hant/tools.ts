// Tools card: the Symbol Selector and Catalyst previews.
// MACHINE DRAFT (2026-09-23), awaiting a native TMS player's review before it is served (REGIONS D-12).
import type { Messages } from "../index";

export const tools: Messages["tools"] = {
  symbolSelector: "{symbolSelector}",
  arcaneSelectorAlt: "{arcaneSelector}",
  sacredSelectorAlt: "{sacredSelector}",
  arcaneCatalyst: "{arcaneCatalyst}",
  sacredCatalyst: "{sacredCatalyst}",
  // The world limit, shown before either tooltip only where the server has one
  // (`catalystRegularWorldOnly` in src/lib/regions.json).
  catalystWorldTag: "<b>[僅限{regularServer}]</b>",
  arcaneCatalystTooltip: "可在同一世界內轉移{aArcaneSymbol}一次",
  sacredCatalystTooltip: "可在同一世界內轉移{aSacredSymbol}一次",
  countPlaceholder: "數量",
  apply: "套用",
  // The preview tooltip draws "[Before → After]" with an arrow icon between the two words.
  before: "使用前",
  after: "使用後",
  selectorPreviewTooltip: "等級／經驗值",
  catalystPreviewTooltip: "符文等級／經驗值",
  disabledWhileUnlocked: "解除經驗值上限時，此功能<b>無法使用</b>",
  catalystLevelTooLow: "等級需達 2 以上",
  arcaneExpLoss: "使用後經驗值 -20%",
  sacredExpLoss: "使用後經驗值 -40%",
};
