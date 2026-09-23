// Machine draft (REGIONS D-12), awaiting a native CMS player's review before it is served.
// Graph card: the power-over-time chart and its controls.
export const graph = {
  power: { arcane: "{arcanePower}", sacred: "{sacredPower}" },
  targetPower: "目标数值",
  targetPowerFull: { arcane: "目标{arcanePower}", sacred: "目标{sacredPower}" },
  targetPlaceholder: "目标",
  targetTooltip: "计算你达到<b>指定数值</b>的日期",
  dateLabel: "日期：",
  attainmentDateLabel: "达成日期：",
  enterTarget: "请输入目标数值",
  targetTooLow: "目标数值过低",
  targetMustBeGreater: "目标须大于 {power}",
  xAxisSpacing: "X 轴间距",
  dynamic: "动态",
  linear: "线性",
  dynamicTooltip: "X 轴各点将按<b>日期</b>采用<b>动态</b>间距",
  linearTooltip: "X 轴各点将采用<b>均匀</b>间距",
  tooltipPower: "{power}：{value}",
  tooltipSymbolLevel: "{symbol}：{level}",
  readyForUpgrade: "可以升级",
} as const;
