// Graph card: the power-over-time chart and its controls.
// MACHINE DRAFT (2026-09-23), awaiting a native TMS player's review before it is served (REGIONS D-12).
import type { Messages } from "../index";

export const graph: Messages["graph"] = {
  power: { arcane: "{arcanePower}", sacred: "{sacredPower}" },
  targetPower: "目標力量",
  targetPowerFull: { arcane: "目標{arcanePower}", sacred: "目標{sacredPower}" },
  targetPlaceholder: "目標",
  targetTooltip: "計算你達到<b>指定力量</b>的日期",
  dateLabel: "日期：",
  attainmentDateLabel: "達成日期：",
  enterTarget: "請輸入目標力量",
  targetTooLow: "目標力量太低",
  targetMustBeGreater: "目標必須大於 {power}",
  xAxisSpacing: "X 軸間距",
  dynamic: "動態",
  linear: "線性",
  dynamicTooltip: "X 軸各點依<b>日期</b>採用<b>動態</b>間距",
  linearTooltip: "X 軸各點採用<b>固定</b>間距",
  tooltipPower: "{power}：{value}",
  tooltipSymbolLevel: "{symbol}：{level}",
  readyForUpgrade: "可以升級",
};
