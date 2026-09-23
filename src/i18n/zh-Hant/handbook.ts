// Handbook page: the EXP, meso cost and damage ratio tables.
// MACHINE DRAFT (2026-09-23), awaiting a native TMS player's review before it is served (REGIONS D-12).
import type { Messages } from "../index";

export const handbook: Messages["handbook"] = {
  tabs: {
    exp: { label: "經驗值表", mobileLabel: "經驗值表" },
    cost: { label: "楓幣費用表", mobileLabel: "費用表" },
    ratio: { label: "傷害比例表", mobileLabel: "傷害表" },
  },
  regionName: { arcane: "{arcaneRegion}", sacred: "{sacredRegion}" },
  symbolsHeading: { arcane: "{arcaneSymbols}", sacred: "{sacredSymbols}" },
  power: { arcane: "{arcanePower}", sacred: "{sacredPower}" },
  currentLevelAlt: "{symbol}：目前等級",
  level: "等級",
  symbolsRequired: "所需符文",
  expRequired: "所需經驗值",
  totalExperience: "累積經驗值",
  totalSymbols: "累積符文",
  mesosRequired: "所需楓幣",
  costsUnpublished: "<b>{server}</b> 尚未公布楓幣費用。",
  totalCost: "總費用",
  damageDealt: "造成傷害",
  damageTaken: "受到傷害",
  expTooltip: "顯示升到<b>指定等級</b>所需的<b>符文數量</b>。",
  costTooltip: "顯示升到<b>指定等級</b>所需的<b>費用</b>。",
  ratioTooltip: "顯示{region}地圖的<b>傷害比例</b>，<b>取決於</b>你的{power}。",
  arcanePowerTooltip: "你目前達到的<b>{arcanePower}區間</b>，與<b>地圖需求</b>相比",
  sacredPowerTooltip: "<b>你的{sacredPower}</b>與<b>地圖需求</b>之間的差距",
  oneDamageTooltip: "怪物對你的角色只會造成<b>1 點傷害</b>",
};
