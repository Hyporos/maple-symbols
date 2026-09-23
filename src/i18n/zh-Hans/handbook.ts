// Machine draft (REGIONS D-12), awaiting a native CMS player's review before it is served.
// Handbook page: the EXP, meso cost and damage ratio tables.
export const handbook = {
  tabs: {
    exp: { label: "经验表", mobileLabel: "经验表" },
    cost: { label: "金币费用表", mobileLabel: "费用表" },
    ratio: { label: "伤害比例表", mobileLabel: "伤害表" },
  },
  regionName: { arcane: "{arcaneRegion}", sacred: "{sacredRegion}" },
  symbolsHeading: { arcane: "{arcaneSymbols}", sacred: "{sacredSymbols}" },
  power: { arcane: "{arcanePower}", sacred: "{sacredPower}" },
  currentLevelAlt: "{symbol}：当前等级",
  level: "等级",
  symbolsRequired: "所需徽章",
  expRequired: "所需经验",
  totalExperience: "累计经验",
  totalSymbols: "累计徽章",
  mesosRequired: "所需金币",
  costsUnpublished: "<b>{server}</b> 尚未公布金币费用。",
  totalCost: "总费用",
  damageDealt: "造成伤害",
  damageTaken: "受到伤害",
  expTooltip: "显示升级到<b>指定等级</b>所需的<b>徽章数</b>。",
  costTooltip: "显示升级到<b>指定等级</b>所需的<b>费用</b>。",
  ratioTooltip: "显示{region}地图的<b>伤害比例</b>，<b>取决于</b>你的{power}。",
  arcanePowerTooltip: "你当前达到的<b>{arcanePower}区间</b>与<b>地图要求</b>的对比",
  sacredPowerTooltip: "<b>你的{sacredPower}</b>与<b>地图要求</b>之间的差值",
  oneDamageTooltip: "怪物对你的角色只会造成 <b>1 点伤害</b>",
} as const;
