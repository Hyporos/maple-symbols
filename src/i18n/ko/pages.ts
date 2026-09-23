// Page titles and descriptions (read by src/lib/routes.ts, SEO.tsx and the build-time routes plugin).
// Machine draft (REGIONS D-12): awaiting a native KMS player's review before it is served.
// SEO copy written for KMS searchers, not a translation (REGIONS §4, §6): it aims at
// "심볼 계산기", "아케인심볼 계산기" and "심볼 강화 비용". "메이플" / "메이플스토리" is the
// game's Korean name, written out rather than `{pageGame}` (the server code, "KMS").
// Titles keep the brand, "| Maple Symbols", as literal text at the end (SEO-6, I18N-8).
export const pages = {
  calculator: {
    title: "메이플 심볼 계산기 ({arcane}·{sacred}) | Maple Symbols",
    description:
      "메이플스토리 {arcaneSymbols}·{sacredSymbols} 계산기. 일일·주간 퀘스트로 완료일, 심볼 강화 비용(메소), {arcanePower} 성장 그래프를 {pageServer} 기준으로 확인하세요.",
    nav: "계산기",
  },
  handbook: {
    title: "메이플 심볼 강화 비용·성장치 표 | Maple Symbols",
    description:
      "메이플스토리({pageServer}) {arcaneSymbols}·{sacredSymbols} 자료: 레벨별 필요 심볼, 메소 강화 비용, {arcanePower}·{sacredPower} 데미지 비율 표.",
    nav: "핸드북",
  },
  changelog: {
    title: "업데이트 내역 | Maple Symbols",
    description:
      "메이플스토리 {arcaneSymbols}·{sacredSymbols} 계산기 Maple Symbols의 전체 버전 기록과 기능 업데이트 내역입니다.",
    nav: "기타",
  },
  credits: {
    title: "크레딧 | Maple Symbols",
    description:
      "메이플스토리 {arcaneSymbols}·{sacredSymbols} 계산기 Maple Symbols를 만든 자료, 제작자, 커뮤니티 멤버를 소개합니다.",
  },
  ogImageAlt: "Maple Symbols — 메이플스토리 심볼 계산기",
} as const;
