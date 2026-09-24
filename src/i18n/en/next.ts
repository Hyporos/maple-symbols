// The redesigned interface at /next (docs/superpowers/specs/2026-09-23-visual-redesign-design.md).
// Only copy the current interface lacks; the rest is read from the existing areas.
// When /next replaces the current UI, these keys move to their pages' areas.
export const next = {
  shell: {
    characterChip: "Main",
    characterMenu: "Choose a character",
    charactersSoon:
      "Character profiles are coming in 2.0, so your main and your alts keep their own levels.",
    accessibility: "Text and contrast",
    accessibilitySoon:
      "An accessibility mode with higher contrast and larger text is coming in 2.0.",
    feedback: "Feedback",
    feedbackSoon: "Soon you can report a wrong number or suggest an improvement from here.",
    closeNote: "Close",
  },
  calculator: {
    sections: "Calculator sections",
    tabEdit: "Edit",
    tabOverview: "Overview",
    tabGraph: "Graph",
    pickerLabel: "Symbols",
    familyLabel: "Symbol family",
    familyGrand: "{grand}",
    familyPower: "{power}: <b>{value}</b> / {max}",
    symbolLevel: "{symbol}, level {level} of {max}",
    maxShort: "MAX",
    calculatorLabel: "Calculator",
    expOf: "/ {count} exp",
    perDay: "{count} / day",
    perWeek: "{count} / week",
    extraFactor: "×{factor}",
    extraQuest: "Extra ({quest})",
    nextLevel: "Next level",
    readyNow: "Ready now",
    inDays: { one: "In {count} day", other: "In {count} days" },
    notSet: "Not set",
    cost: "Cost",
    mainStat: "Main stat",
    toolsLabel: "Tools",
    toolsClose: "Close",
  },
  overview: {
    label: "Overview",
    allMaxedOn: "All maxed on <b>{date}</b>",
    allMaxedUnknown: "Enter each symbol's level and quests to see when everything is maxed",
    toMax: "{symbol}: {percent}% of the way to max",
  },
  graph: {
    label: "Power over time",
    now: "Now",
    target: "Target",
    reachedBy: "by <b>{date}</b>",
  },
  handbook: {
    label: "Handbook",
    // The Exp and Cost headings with Grand selected (Grand Sacred reads the Sacred tables).
    grandSymbolsHeading: "{grand} {sacredSymbols}",
  },
  extras: { label: "Extras" },
} as const;
