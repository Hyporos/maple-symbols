// Page titles and descriptions (read by src/lib/routes.ts, SEO.tsx and the build-time routes plugin).
// Titles keep the brand, "| Maple Symbols", as literal text at the end (SEO-6, I18N-8).
// Machine draft (2026-09-23), awaiting a native JMS player's review before it is served
// (docs/REGIONS.md D-12). SEO copy written for JMS searchers, not a translation (REGIONS §4,
// §6): it aims at アーケインシンボル 計算 / シンボル シミュレーター. JMS meso costs are
// unpublished (src/lib/regions.json), so the Handbook copy does not promise them.
export const pages = {
  calculator: {
    title: "シンボル計算機 {arcane}・{sacred} | Maple Symbols",
    description:
      "メイプルストーリー（{pageServer}）の{arcaneSymbols}・{sacredSymbols}計算＆シミュレーター。デイリー・ウィークリーから完了日とフォースの伸びがわかります。",
    nav: "計算機",
  },
  handbook: {
    title: "シンボル早見表（必要数・ダメージ比率） | Maple Symbols",
    description:
      "メイプルストーリー（{pageServer}）の{arcaneSymbols}・{sacredSymbols}早見表。レベルごとの必要シンボル数と累計、ダメージ比率を{pageServer}の数値でまとめています。",
    nav: "早見表",
  },
  changelog: {
    title: "更新履歴 | Maple Symbols",
    description:
      "Maple Symbolsの更新履歴。メイプルストーリーの{arcane}・{sacredSymbol}計算機に追加された機能と修正をすべて記録しています。",
    nav: "その他",
  },
  credits: {
    title: "クレジット | Maple Symbols",
    description:
      "Maple Symbolsのクレジット。メイプルストーリーの{arcane}・{sacred}シンボル計算機を支える資料、制作者、コミュニティの皆さんを紹介します。",
  },
  ogImageAlt: "Maple Symbols — メイプルストーリー シンボル計算機",
} as const;
