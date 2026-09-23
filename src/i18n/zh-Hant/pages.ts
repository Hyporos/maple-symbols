// Page titles and descriptions (read by src/lib/routes.ts, SEO.tsx and the build-time routes plugin).
// Titles keep the brand, "| Maple Symbols", as literal text at the end (SEO-6, I18N-8).
// MACHINE DRAFT (2026-09-23), awaiting a native TMS player's review before it is served (REGIONS D-12).
// SEO copy written for TMS searchers, not translated (REGIONS §4, §6): "新楓之谷" is the game's
// name in Taiwan, and the calculator description also carries the variant spelling 秘法符文,
// which the V280 notice itself mixes with 祕法符文 and players search for both.
import type { Messages } from "../index";

export const pages: Messages["pages"] = {
  calculator: {
    title: "新楓之谷 {arcaneSymbols}・{sacredSymbol}計算機 | Maple Symbols",
    description:
      "新楓之谷（{pageServer}）符文計算機：輸入{arcaneSymbols}（秘法符文）與{sacredSymbols}的等級與經驗值，依每日、每週任務算出完成日期與升級所需楓幣。",
    nav: "計算機",
  },
  handbook: {
    title: "符文手冊：經驗值與楓幣費用表 | Maple Symbols",
    description:
      "新楓之谷{arcaneSymbols}與{sacredSymbol}完整資料，收錄 {pageServer} 的經驗值表、升級楓幣費用與傷害比例。",
    nav: "手冊",
  },
  changelog: {
    title: "更新日誌 | Maple Symbols",
    description:
      "新楓之谷{arcaneSymbols}與{sacredSymbol}計算機 Maple Symbols 的完整版本紀錄與功能更新。",
    nav: "其他",
  },
  credits: {
    title: "製作名單 | Maple Symbols",
    description:
      "Maple Symbols 製作名單：打造這款新楓之谷{arcaneSymbols}與{sacredSymbol}計算機的資源、創作者與社群成員。",
  },
  ogImageAlt: "Maple Symbols — 新楓之谷符文計算機",
};
