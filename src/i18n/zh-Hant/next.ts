// The redesigned interface at /next (docs/superpowers/specs/2026-09-23-visual-redesign-design.md).
// MACHINE DRAFT (2026-09-23), awaiting a native TMS player's review before it is served (REGIONS D-12).
// Only copy the current interface lacks; the rest is read from the existing areas.
import type { Messages } from "../index";

export const next: Messages["next"] = {
  shell: {
    characterChip: "主要角色",
    characterMenu: "選擇角色",
    charactersSoon: "角色檔案功能將於 2.0 推出，讓你的主要角色與小號各自保留等級。",
    accessibility: "文字與對比",
    accessibilitySoon: "提高對比與放大文字的無障礙模式將於 2.0 推出。",
    feedback: "意見回饋",
    feedbackSoon: "很快就能在這裡回報錯誤數據或提出改善建議。",
    closeNote: "關閉",
  },
  calculator: {
    sections: "計算機區塊",
    tabEdit: "編輯",
    tabOverview: "總覽",
    tabGraph: "圖表",
    pickerLabel: "符文",
    familyLabel: "符文類型",
    familyGrand: "{grand}",
    familyPower: "{power}：<b>{value}</b> / {max}",
    symbolLevel: "{symbol}，等級 {level} / {max}",
    maxShort: "MAX",
    calculatorLabel: "計算機",
    expOf: "/ {count} 經驗值",
    perDay: "每日 {count} 個符文",
    perWeek: "每週 {count} 個符文",
    extraFactor: "×{factor}",
    extraQuest: "額外（{quest}）",
    nextLevel: "下一等級",
    readyNow: "可以升級",
    inDays: { one: "{count} 天後", other: "{count} 天後" },
    notSet: "尚未設定",
    cost: "費用",
    mainStat: "主屬性",
    toolsLabel: "工具",
    toolsClose: "關閉",
  },
  overview: {
    label: "總覽",
    allMaxedOn: "全部將於 <b>{date}</b> 達到滿級",
    allMaxedUnknown: "輸入每個符文的等級與任務，即可查看全部滿級的日期",
    toMax: "{symbol}：距離滿級 {percent}%",
  },
  graph: {
    label: "力量成長趨勢",
    now: "目前",
    target: "目標",
    reachedBy: "預計於 <b>{date}</b> 達成",
  },
  handbook: { label: "手冊", grandSymbolsHeading: "{grand}{sacredSymbols}" },
  extras: { label: "其他" },
};
