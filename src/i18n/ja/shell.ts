// App shell: Header, Footer, Selector, credit links and the error fallback.
// Machine draft (2026-09-23), awaiting a native JMS player's review before it is served
// (docs/REGIONS.md D-12).
export const shell = {
  goToCalculator: "計算機へ移動",
  openMenu: "ナビゲーションメニューを開く",
  closeMenu: "ナビゲーションメニューを閉じる",
  serverMenu: "サーバーを選択",
  siteVersion: "サイト版",
  numbersFrom: "数値の基準",
  numbersFromPage: "{server}（このページ）",
  numbersFromNote:
    "{server}の数値を表示中です（このブラウザに保存）。このページのサーバーを選ぶと元に戻ります。",
  suggestion: "<b>{server}</b>でプレイしていますか？このページには{server}版があります。",
  suggestionLink: "{server}版へ移動",
  suggestionDismiss: "この提案を閉じる",
  githubRepository: "GitHubリポジトリ",
  discordServer: "Discordサーバー",
  donate: "PayPalで寄付",
  copyright: "© {year} Maple Symbols ━ v{version} Beta",
  symbolType: "シンボルの種類",
  arcane: "{arcane}",
  sacred: "{sacred}",
  symbolLevel: "Lv. {level}",
  errorFallback: "問題が発生しました。ページを再読み込みしてください。",
} as const;
