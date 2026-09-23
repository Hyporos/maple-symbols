// Graph card: the power-over-time chart and its controls.
// Machine draft (REGIONS D-12): awaiting a native KMS player's review before it is served.
export const graph = {
  power: { arcane: "{arcanePower}", sacred: "{sacredPower}" },
  targetPower: "목표 포스",
  targetPowerFull: { arcane: "목표 {arcanePower}", sacred: "목표 {sacredPower}" },
  targetPlaceholder: "목표",
  targetTooltip: "<b>지정한 포스</b>를 달성하는 날짜를 계산합니다",
  dateLabel: "날짜:",
  attainmentDateLabel: "달성일:",
  enterTarget: "목표 포스를 입력하세요",
  targetTooLow: "목표 포스가 너무 낮습니다",
  targetMustBeGreater: "목표는 {power}보다 커야 합니다",
  xAxisSpacing: "X축 간격",
  dynamic: "날짜순",
  linear: "균등",
  dynamicTooltip: "X축 간격이 <b>날짜</b>에 따라 <b>유동적</b>으로 정해집니다",
  linearTooltip: "X축 간격이 <b>일정</b>합니다",
  tooltipPower: "{power} : {value}",
  tooltipSymbolLevel: "{symbol} : {level}",
  readyForUpgrade: "강화 가능",
} as const;
