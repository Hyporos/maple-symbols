// App shell: Header, Footer, Selector, credit links and the error fallback.
export const shell = {
  goToCalculator: "Go to calculator",
  openMenu: "Open navigation menu",
  closeMenu: "Close navigation menu",
  serverMenu: "Choose your server",
  siteVersion: "Site version",
  numbersFrom: "Numbers from",
  numbersFromPage: "{server} (this page)",
  numbersFromNote:
    "Showing {server} numbers, remembered in this browser. Pick this page's server to go back.",
  githubRepository: "GitHub repository",
  discordServer: "Discord server",
  donate: "Donate via PayPal",
  copyright: "© {year} Maple Symbols ━ v{version} Beta",
  symbolType: "Symbol type",
  arcane: "Arcane",
  sacred: "Sacred",
  symbolLevel: "Lv. {level}",
  errorFallback: "Something went wrong. Please refresh.",
} as const;
