// App shell: Header, Footer, Selector, credit links and the error fallback.
// Machine draft (REGIONS D-12): awaiting a native KMS player's review before it is served.
export const shell = {
  goToCalculator: "계산기로 이동",
  openMenu: "메뉴 열기",
  closeMenu: "메뉴 닫기",
  serverMenu: "서버 선택",
  siteVersion: "사이트 버전",
  numbersFrom: "수치 기준",
  numbersFromPage: "{server} (이 페이지)",
  numbersFromNote:
    "{server} 수치를 보여 주는 중이며, 이 브라우저에 저장됩니다. 이 페이지의 서버를 고르면 돌아갑니다.",
  githubRepository: "GitHub 저장소",
  discordServer: "디스코드 서버",
  donate: "PayPal로 후원하기",
  copyright: "© {year} Maple Symbols ━ v{version} Beta",
  symbolType: "심볼 종류",
  arcane: "{arcane}",
  sacred: "{sacred}",
  symbolLevel: "Lv. {level}",
  errorFallback: "문제가 발생했습니다. 새로고침해 주세요.",
} as const;
