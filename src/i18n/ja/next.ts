// The redesigned interface at /next (docs/superpowers/specs/2026-09-23-visual-redesign-design.md).
// Machine draft (2026-09-23), awaiting a native JMS player's review before it is served
// (docs/REGIONS.md D-12). Only copy the current interface lacks; the rest is read from the
// existing areas.
export const next = {
  shell: {
    characterChip: "メイン",
    characterMenu: "キャラクターを選択",
    charactersSoon:
      "キャラクタープロフィール機能は2.0で追加予定で、メインとサブがそれぞれのレベルを保持します。",
    accessibility: "文字とコントラスト",
    accessibilitySoon:
      "コントラストを高くし文字を大きくするアクセシビリティモードは2.0で追加予定です。",
    feedback: "フィードバック",
    feedbackSoon: "近日中に、ここから数値の誤りの報告や改善の提案ができるようになります。",
    closeNote: "閉じる",
  },
  calculator: {
    sections: "計算機セクション",
    tabEdit: "編集",
    tabOverview: "概要",
    tabGraph: "グラフ",
    pickerLabel: "シンボル",
    familyLabel: "シンボルの種類",
    familyGrand: "{grand}",
    familyPower: "{power}：<b>{value}</b> / {max}",
    symbolLevel: "{symbol}、レベル{level} / {max}",
    maxShort: "MAX",
    calculatorLabel: "計算機",
    expOf: "/ {count}成長値",
    perDay: "1日 {count}個",
    perWeek: "1週間 {count}個",
    extraFactor: "×{factor}",
    extraQuest: "追加（{quest}）",
    nextLevel: "次のレベル",
    readyNow: "強化可能",
    inDays: { one: "あと{count}日", other: "あと{count}日" },
    notSet: "未設定",
    cost: "費用",
    mainStat: "メインステータス",
    toolsLabel: "ツール",
    toolsClose: "閉じる",
  },
  overview: {
    label: "概要",
    allMaxedOn: "<b>{date}</b>にすべて最大レベルに到達します",
    allMaxedUnknown:
      "各シンボルのレベルとクエストを入力すると、すべて最大レベルになる日がわかります",
    toMax: "{symbol}：最大レベルまで{percent}%",
  },
  graph: {
    label: "フォースの推移",
    now: "現在",
    target: "目標",
    reachedBy: "<b>{date}</b>に到達予定",
  },
  handbook: { label: "早見表", grandSymbolsHeading: "{grand}{sacredSymbols}" },
  extras: { label: "その他" },
} as const;
