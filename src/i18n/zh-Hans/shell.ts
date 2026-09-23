// Machine draft (REGIONS D-12), awaiting a native CMS player's review before it is served.
// App shell: Header, Footer, Selector, credit links and the error fallback.
export const shell = {
  goToCalculator: "前往计算器",
  openMenu: "打开导航菜单",
  closeMenu: "关闭导航菜单",
  serverMenu: "选择你的服务器",
  siteVersion: "网站版本",
  numbersFrom: "数据来源",
  numbersFromPage: "{server}（本页）",
  numbersFromNote: "正在显示 {server} 的数据，已保存在此浏览器中。选择本页的服务器即可恢复。",
  suggestion: "在 <b>{server}</b> 玩吗？本页面有 {server} 版本。",
  suggestionLink: "前往 {server} 版本",
  suggestionDismiss: "关闭此建议",
  githubRepository: "GitHub 仓库",
  discordServer: "Discord 服务器",
  donate: "通过 PayPal 捐助",
  copyright: "© {year} Maple Symbols ━ v{version} Beta",
  symbolType: "徽章类型",
  arcane: "{arcane}",
  sacred: "{sacred}",
  symbolLevel: "Lv. {level}",
  errorFallback: "出错了，请刷新页面。",
} as const;
