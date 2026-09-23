// Overview card: the per-symbol target table.
// MACHINE DRAFT (2026-09-23), awaiting a native TMS player's review before it is served (REGIONS D-12).
import type { Messages } from "../index";

export const overview: Messages["overview"] = {
  headerTooltip: "查看每個符文的<b>個別等級</b>需求與日期",
  symbol: "符文",
  targetLevel: "目標等級",
  completionDate: "完成日期",
  daysRemaining: "剩餘天數",
  symbolsRemaining: "剩餘符文",
  mobileTitle: "符文總覽",
  max: "MAX",
  levelPlaceholder: "等級",
  targetTooltip: "預覽達到<b>指定等級</b>的剩餘天數與符文數",
  targetTooltipShort: "預覽<b>指定等級</b>的剩餘數據",
  indefinite: "無法預估",
  complete: "已完成",
  readyForUpgrade: "可以升級",
  unknownDays: "? 天",
  days: { one: "{count} 天", other: "{count} 天" },
  levelTooLow: "等級太低",
  levelMustBeOver: "等級必須大於 {level}",
  enterLevel: "請輸入等級",
  enterTargetLevel: "請輸入目標等級",
};
