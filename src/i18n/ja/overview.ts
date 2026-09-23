// Overview card: the per-symbol target table.
// Machine draft (2026-09-23), awaiting a native JMS player's review before it is served
// (docs/REGIONS.md D-12).
export const overview = {
  headerTooltip: "シンボルごとの<b>個別レベル</b>の必要数と日付を表示します",
  symbol: "シンボル",
  targetLevel: "目標レベル",
  completionDate: "完了日",
  daysRemaining: "残り日数",
  symbolsRemaining: "残りシンボル",
  mobileTitle: "シンボル一覧",
  max: "MAX",
  levelPlaceholder: "レベル",
  targetTooltip: "<b>指定したレベル</b>までの残り日数とシンボル数をプレビューします",
  targetTooltipShort: "<b>指定したレベル</b>までの残りをプレビューします",
  indefinite: "未定",
  complete: "完了",
  readyForUpgrade: "強化可能",
  unknownDays: "?日",
  days: { one: "{count}日", other: "{count}日" },
  levelTooLow: "レベルが低すぎます",
  levelMustBeOver: "{level}より上のレベルを入力してください",
  enterLevel: "レベルを入力",
  enterTargetLevel: "目標レベルを入力",
} as const;
