// Tools card: the Symbol Selector and Catalyst previews.
// Machine draft (REGIONS D-12): awaiting a native KMS player's review before it is served.
export const tools = {
  symbolSelector: "{symbolSelector}",
  arcaneSelectorAlt: "{arcaneSelector}",
  sacredSelectorAlt: "{sacredSelector}",
  arcaneCatalyst: "{arcaneCatalyst}",
  sacredCatalyst: "{sacredCatalyst}",
  // The world limit, shown before either tooltip only where the server has one
  // (`catalystRegularWorldOnly` in src/lib/regions.json).
  catalystWorldTag: "<b>[{regularServer} 전용]</b>",
  arcaneCatalystTooltip: "같은 월드 내 캐릭터에게 {aArcaneSymbol}을 1회 이동",
  sacredCatalystTooltip: "같은 월드 내 캐릭터에게 {aSacredSymbol}을 1회 이동",
  countPlaceholder: "개수",
  apply: "적용",
  // The preview tooltip draws "[Before → After]" with an arrow icon between the two words.
  before: "이전",
  after: "이후",
  selectorPreviewTooltip: "레벨 / 성장치",
  catalystPreviewTooltip: "심볼 레벨 / 성장치",
  disabledWhileUnlocked: "성장치 제한을 해제한 동안에는 이 기능을 <b>사용할 수 없습니다</b>",
  catalystLevelTooLow: "2레벨 이상이어야 합니다",
  arcaneExpLoss: "사용 시 성장치 -20%",
  sacredExpLoss: "사용 시 성장치 -40%",
} as const;
