// Handbook page: the EXP, meso cost and damage ratio tables.
export const handbook = {
  tabs: {
    exp: { label: "Experience Table", mobileLabel: "Exp Table" },
    cost: { label: "Meso Cost Table", mobileLabel: "Cost Table" },
    ratio: { label: "Damage Ratio Table", mobileLabel: "Dmg Table" },
  },
  symbolsHeading: { arcane: "Arcane Symbols", sacred: "Sacred Symbols" },
  power: { arcane: "Arcane Power", sacred: "Sacred Power" },
  currentLevelAlt: "{symbol}: current level",
  level: "Level",
  symbolsRequired: "Symbols Required",
  expRequired: "Exp Required",
  totalExperience: "Total Experience",
  totalSymbols: "Total Symbols",
  mesosRequired: "Mesos Required",
  totalCost: "Total Cost",
  damageDealt: "Damage Dealt",
  damageTaken: "Damage Taken",
  expTooltip: "Displays <b>symbols required</b> to level up to the <b>specified level</b>.",
  costTooltip: "Displays <b>cost</b> to level up to the <b>specified level</b>.",
  ratioTooltip:
    "Displays <b>damage ratios</b> for {region} maps, <b>depending</b> on your {power}.",
  arcanePowerTooltip:
    "The current <b>Arcane Power range</b> you meet, compared to the <b>map requirement</b>",
  sacredPowerTooltip:
    "The difference between <b>your Sacred Power</b> and the <b>map requirement</b>",
  oneDamageTooltip: "Monsters will deal <b>1 damage</b> to your character",
} as const;
