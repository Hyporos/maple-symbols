// Handbook page: the EXP, meso cost and damage ratio tables.
// Machine draft (2026-09-23), awaiting a native JMS player's review before it is served
// (docs/REGIONS.md D-12).
export const handbook = {
  tabs: {
    exp: { label: "成長値表", mobileLabel: "成長値" },
    cost: { label: "強化費用表", mobileLabel: "費用" },
    ratio: { label: "ダメージ比率表", mobileLabel: "ダメージ" },
  },
  symbolsHeading: { arcane: "{arcaneSymbols}", sacred: "{sacredSymbols}" },
  power: { arcane: "{arcanePower}", sacred: "{sacredPower}" },
  currentLevelAlt: "{symbol}：現在のレベル",
  level: "レベル",
  symbolsRequired: "必要シンボル数",
  expRequired: "必要成長値",
  totalExperience: "累計成長値",
  totalSymbols: "累計シンボル数",
  mesosRequired: "必要メル",
  costsUnpublished: "<b>{server}</b>のシンボル強化費用はまだ公開されていません。",
  totalCost: "累計費用",
  damageDealt: "与えるダメージ",
  damageTaken: "受けるダメージ",
  expTooltip: "<b>指定したレベル</b>まで上げるのに<b>必要なシンボル数</b>を表示します。",
  costTooltip: "<b>指定したレベル</b>まで上げるのに<b>必要な費用</b>を表示します。",
  ratioTooltip: "{region}のマップでの<b>ダメージ比率</b>を、{power}に<b>応じて</b>表示します。",
  arcanePowerTooltip: "<b>マップの要求値</b>に対して満たしている<b>{arcanePower}の範囲</b>",
  sacredPowerTooltip: "<b>自分の{sacredPower}</b>と<b>マップの要求値</b>の差",
  oneDamageTooltip: "モンスターから受けるダメージが<b>1</b>になります",
} as const;
