// Handbook page: the EXP, meso cost and damage ratio tables.
export const handbook = {
  tabs: {
    exp: { label: "Experience Table", mobileLabel: "Exp Table" },
    cost: { label: "Meso Cost Table", mobileLabel: "Cost Table" },
    ratio: { label: "Damage Ratio Table", mobileLabel: "Dmg Table" },
  },
  symbolsHeading: { arcane: "{arcaneSymbols}", sacred: "{sacredSymbols}" },
  power: { arcane: "{arcanePower}", sacred: "{sacredPower}" },
  currentLevelAlt: "{symbol}: current level",
  level: "Level",
  symbolsRequired: "Symbols Required",
  expRequired: "Exp Required",
  totalExperience: "Total Experience",
  totalSymbols: "Total Symbols",
  mesosRequired: "Mesos Required",
  costsUnpublished: "Meso costs are not published yet for <b>{server}</b>.",
  totalCost: "Total Cost",
  damageDealt: "Damage Dealt",
  damageTaken: "Damage Taken",
  expTooltip: "Displays <b>symbols required</b> to level up to the <b>specified level</b>.",
  costTooltip: "Displays <b>cost</b> to level up to the <b>specified level</b>.",
  ratioTooltip:
    "Displays <b>damage ratios</b> for {region} maps, <b>depending</b> on your {power}.",
  arcanePowerTooltip:
    "The current <b>{arcanePower} range</b> you meet, compared to the <b>map requirement</b>",
  sacredPowerTooltip:
    "The difference between <b>your {sacredPower}</b> and the <b>map requirement</b>",
  oneDamageTooltip: "Monsters will deal <b>1 damage</b> to your character",
} as const;
