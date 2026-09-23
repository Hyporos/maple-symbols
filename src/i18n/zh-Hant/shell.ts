// App shell: Header, Footer, Selector, credit links and the error fallback.
// MACHINE DRAFT (2026-09-23), awaiting a native TMS player's review before it is served (REGIONS D-12).
import type { Messages } from "../index";

export const shell: Messages["shell"] = {
  goToCalculator: "前往計算機",
  openMenu: "開啟導覽選單",
  closeMenu: "關閉導覽選單",
  serverMenu: "選擇你的伺服器",
  siteVersion: "網站版本",
  numbersFrom: "數據來源",
  numbersFromPage: "{server}（本頁）",
  numbersFromNote: "目前顯示 {server} 的數據，並記在此瀏覽器中。選擇本頁的伺服器即可切換回來。",
  githubRepository: "GitHub 儲存庫",
  discordServer: "Discord 伺服器",
  donate: "透過 PayPal 贊助",
  copyright: "© {year} Maple Symbols ━ v{version} Beta",
  symbolType: "符文類型",
  arcane: "{arcane}",
  sacred: "{sacred}",
  symbolLevel: "Lv. {level}",
  errorFallback: "發生錯誤，請重新整理頁面。",
};
