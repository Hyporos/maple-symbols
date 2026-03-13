// ---------------------------------------------------------------------------
// ratioData.ts — Damage ratio table data for the Handbook's RatioTable.
// ---------------------------------------------------------------------------

export const arcaneRatioData = [
  { arcanePower: "0% - 9%", damageDealt: 10, damageTaken: 280 },
  { arcanePower: "10% - 29%", damageDealt: 30, damageTaken: 240 },
  { arcanePower: "30% - 49%", damageDealt: 60, damageTaken: 180 },
  { arcanePower: "50% - 69%", damageDealt: 70, damageTaken: 160 },
  { arcanePower: "70% - 99%", damageDealt: 80, damageTaken: 140 },
  { arcanePower: "100% - 109%", damageDealt: 100, damageTaken: 100 },
  { arcanePower: "110% - 129%", damageDealt: 110, damageTaken: 80 },
  { arcanePower: "130% - 149%", damageDealt: 130, damageTaken: 40 },
  { arcanePower: "150% +", damageDealt: 150, damageTaken: 0 },
];

export const sacredRatioData = [
  { sacredPower: "< -100", damageDealt: 5, damageTaken: 200 },
  { sacredPower: -90, damageDealt: 10, damageTaken: 200 },
  { sacredPower: -80, damageDealt: 20, damageTaken: 200 },
  { sacredPower: -70, damageDealt: 30, damageTaken: 200 },
  { sacredPower: -60, damageDealt: 40, damageTaken: 200 },
  { sacredPower: -50, damageDealt: 50, damageTaken: 150 },
  { sacredPower: -40, damageDealt: 60, damageTaken: 150 },
  { sacredPower: -30, damageDealt: 70, damageTaken: 150 },
  { sacredPower: -20, damageDealt: 80, damageTaken: 150 },
  { sacredPower: -10, damageDealt: 90, damageTaken: 150 },
  { sacredPower: 0, damageDealt: 100, damageTaken: 100 },
  { sacredPower: 10, damageDealt: 105, damageTaken: 100 },
  { sacredPower: 20, damageDealt: 110, damageTaken: 100 },
  { sacredPower: 30, damageDealt: 115, damageTaken: 100 },
  { sacredPower: 40, damageDealt: 120, damageTaken: 100 },
  { sacredPower: "50 +", damageDealt: 125, damageTaken: 100 },
];
