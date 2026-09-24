// The redesigned interface at /next (docs/superpowers/specs/2026-09-23-visual-redesign-design.md).
// Machine draft (REGIONS D-12): awaiting a native KMS player's review before it is served.
// Only copy the current interface lacks; the rest is read from the existing areas.
export const next = {
  shell: {
    characterChip: "메인",
    characterMenu: "캐릭터 선택",
    charactersSoon:
      "캐릭터 프로필 기능은 2.0에서 제공되며, 메인과 부캐가 각자의 레벨을 유지합니다.",
    accessibility: "텍스트 및 대비",
    accessibilitySoon: "대비를 높이고 글자를 크게 하는 접근성 모드는 2.0에서 추가될 예정입니다.",
    feedback: "피드백",
    feedbackSoon: "곧 이곳에서 잘못된 수치를 제보하거나 개선 사항을 제안할 수 있습니다.",
    closeNote: "닫기",
  },
  calculator: {
    sections: "계산기 섹션",
    tabEdit: "편집",
    tabOverview: "개요",
    tabGraph: "그래프",
    pickerLabel: "심볼",
    familyLabel: "심볼 종류",
    familyGrand: "{grand}",
    familyPower: "{power}: <b>{value}</b> / {max}",
    symbolLevel: "{symbol}, 레벨 {level} / {max}",
    maxShort: "MAX",
    calculatorLabel: "계산기",
    expOf: "/ {count} 성장치",
    perDay: "하루 {count}개",
    perWeek: "주당 {count}개",
    extraFactor: "×{factor}",
    extraQuest: "추가 ({quest})",
    nextLevel: "다음 레벨",
    readyNow: "강화 가능",
    inDays: { one: "{count}일 후", other: "{count}일 후" },
    notSet: "설정되지 않음",
    cost: "비용",
    mainStat: "주력 스탯",
    toolsLabel: "도구",
    toolsClose: "닫기",
  },
  overview: {
    label: "개요",
    allMaxedOn: "<b>{date}</b>에 모두 최대 레벨에 도달합니다",
    allMaxedUnknown:
      "각 심볼의 레벨과 퀘스트를 입력하면 모두 최대 레벨이 되는 날짜를 확인할 수 있습니다",
    toMax: "{symbol}: 최대 레벨까지 {percent}%",
  },
  graph: {
    label: "시간에 따른 포스 변화",
    now: "현재",
    target: "목표",
    reachedBy: "<b>{date}</b>에 도달 예정",
  },
  handbook: { label: "핸드북", grandSymbolsHeading: "{grand} {sacredSymbols}" },
  extras: { label: "기타" },
} as const;
