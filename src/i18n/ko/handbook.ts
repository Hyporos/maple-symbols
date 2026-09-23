// Handbook page: the EXP, meso cost and damage ratio tables.
// Machine draft (REGIONS D-12): awaiting a native KMS player's review before it is served.
// "주는 피해" / "받는 피해" are the KMS guide's column names (Guide/N23GameInformation/Articles/396).
export const handbook = {
  tabs: {
    exp: { label: "성장치 표", mobileLabel: "성장치" },
    cost: { label: "강화 비용 표", mobileLabel: "강화 비용" },
    ratio: { label: "데미지 비율 표", mobileLabel: "데미지" },
  },
  symbolsHeading: { arcane: "{arcaneSymbols}", sacred: "{sacredSymbols}" },
  power: { arcane: "{arcanePower}", sacred: "{sacredPower}" },
  currentLevelAlt: "{symbol}: 현재 레벨",
  level: "레벨",
  symbolsRequired: "필요 심볼",
  expRequired: "필요 성장치",
  totalExperience: "누적 성장치",
  totalSymbols: "누적 심볼",
  mesosRequired: "필요 메소",
  costsUnpublished: "<b>{server}</b> 메소 강화 비용은 아직 공개되지 않았습니다.",
  totalCost: "누적 비용",
  damageDealt: "주는 피해",
  damageTaken: "받는 피해",
  expTooltip: "<b>지정한 레벨</b>까지 강화하는 데 <b>필요한 심볼</b> 수를 보여 줍니다.",
  costTooltip: "<b>지정한 레벨</b>까지 강화하는 데 드는 <b>비용</b>을 보여 줍니다.",
  ratioTooltip: "{power}에 <b>따른</b> {region} 사냥터의 <b>데미지 비율</b>을 보여 줍니다.",
  arcanePowerTooltip: "<b>사냥터 요구치</b> 대비 현재 충족하는 <b>{arcanePower} 구간</b>",
  sacredPowerTooltip: "<b>내 {sacredPower}</b>와 <b>사냥터 요구치</b>의 차이",
  oneDamageTooltip: "몬스터가 캐릭터에게 <b>1 데미지</b>를 줍니다",
} as const;
