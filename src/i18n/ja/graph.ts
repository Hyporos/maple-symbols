// Graph card: the power-over-time chart and its controls.
// Machine draft (2026-09-23), awaiting a native JMS player's review before it is served
// (docs/REGIONS.md D-12).
export const graph = {
  power: { arcane: "{arcanePower}", sacred: "{sacredPower}" },
  targetPower: "目標フォース",
  targetPowerFull: { arcane: "目標{arcanePower}", sacred: "目標{sacredPower}" },
  targetPlaceholder: "目標",
  targetTooltip: "<b>指定したフォース</b>に到達する日を計算します",
  dateLabel: "日付：",
  attainmentDateLabel: "到達日：",
  enterTarget: "目標フォースを入力",
  targetTooLow: "目標フォースが低すぎます",
  targetMustBeGreater: "目標は{power}より大きくしてください",
  xAxisSpacing: "X軸の間隔",
  dynamic: "可変",
  linear: "等間隔",
  dynamicTooltip: "X軸の点を<b>日付</b>に応じた<b>可変</b>の間隔で表示します",
  linearTooltip: "X軸の点を<b>一定</b>の間隔で表示します",
  tooltipPower: "{power} : {value}",
  tooltipSymbolLevel: "{symbol} : {level}",
  readyForUpgrade: "強化可能",
} as const;
