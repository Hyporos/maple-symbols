// Calculator card: the level/experience inputs, quest toggles and next-level panel.
// Machine draft (REGIONS D-12): awaiting a native KMS player's review before it is served.
// "성장치" is the KMS guide's word for a symbol's experience (maplestory.nexon.com
// Guide/N23GameInformation/Articles/396); "[일일 퀘스트]" is the client's quest tag.
export const calculator = {
  levelPlaceholder: "레벨",
  experiencePlaceholder: "성장치",
  experiencePlaceholderShort: "성장치",
  inputsTooltip: "<b>심볼</b> 레벨 / 성장치",
  unlockCap: "성장치 제한 해제",
  lockCap: "성장치 제한 설정",
  unlockCapTooltip: "성장치 제한 <b>해제</b>",
  lockCapTooltip: "성장치 제한 <b>설정</b>",
  applyOverflow: "초과 성장치 적용",
  daily: "일일",
  weekly: "주간",
  extra: "추가",
  dailyTooltip: "<b>[일일 퀘스트]</b> {quest}",
  weeklyTooltip: "<b>[주간 퀘스트]</b> {quest}",
  extraTooltip: "<b>[해금]</b> {quest}",
  symbolsPerDay: "하루 {count}개",
  symbolsPerWeek: "주당 {count}개",
  level: "레벨 <b>{level}</b>",
  daysToGo: { one: "<b>{count}</b>일 남음", other: "<b>{count}</b>일 남음" },
  completionAssumption:
    "완료일은 <b>일일</b> 퀘스트와 <b>주간</b> 퀘스트를 모두 <b>완료</b>한다고 가정한 날짜입니다",
  readyForUpgrade: "<b>강화</b> 가능",
  experienceNotSet: "<b>성장치</b>가 입력되지 않았습니다",
  questsNotSet: "<b>퀘스트</b>가 선택되지 않았습니다",
  sufficientSymbols: "심볼 <b>충분</b>",
  symbolsRemaining: {
    one: "<b>{count}</b>개 남음",
    other: "<b>{count}</b>개 남음",
  },
  unknownRemaining: "남은 심볼 <b>알 수 없음</b>",
  mesosRequired: "<b>{mesos}</b> 메소 필요",
  mesosUnpublished: "<b>{server}</b> 강화 비용은 아직 공개되지 않았습니다",
  mainStat: "주력 스탯 <b>+{stat}</b>",
  demonAvengerHp: "HP <b>+{hp}</b> ({demonAvenger})",
  xenonAllStat: "올스탯 <b>+{stat}</b> ({xenon})",
  maxLevel: "MAX LEVEL",
  disabled: "비활성화",
  disabledHint: "레벨을 입력하면 활성화됩니다",
} as const;
