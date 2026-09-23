// Overview card: the per-symbol target table.
// Machine draft (REGIONS D-12): awaiting a native KMS player's review before it is served.
export const overview = {
  headerTooltip: "심볼별 <b>개별 레벨</b> 요구량과 날짜를 확인하세요",
  symbol: "심볼",
  targetLevel: "목표 레벨",
  completionDate: "완료일",
  daysRemaining: "남은 일수",
  symbolsRemaining: "남은 심볼",
  mobileTitle: "심볼 현황",
  max: "MAX",
  levelPlaceholder: "레벨",
  targetTooltip: "<b>지정한 레벨</b>까지 남은 일수와 심볼을 미리 봅니다",
  targetTooltipShort: "<b>지정한 레벨</b>까지 남은 수치를 미리 봅니다",
  indefinite: "미정",
  complete: "완료",
  readyForUpgrade: "강화 가능",
  unknownDays: "?일",
  days: { one: "{count}일", other: "{count}일" },
  levelTooLow: "레벨이 너무 낮습니다",
  levelMustBeOver: "{level}레벨보다 높아야 합니다",
  enterLevel: "레벨을 입력하세요",
  enterTargetLevel: "목표 레벨을 입력하세요",
} as const;
