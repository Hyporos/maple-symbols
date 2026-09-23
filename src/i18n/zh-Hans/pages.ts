// Machine draft (REGIONS D-12), awaiting a native CMS player's review before it is served.
// Page titles and descriptions: SEO copy written for CMS searchers, not a translation of the
// English (REGIONS §4, §6). Titles aim at "神秘徽章计算器" and keep "| Maple Symbols" at the end.
export const pages = {
  calculator: {
    title: "冒险岛 {arcaneSymbols}・{sacredSymbols}计算器 | Maple Symbols",
    description:
      "冒险岛{arcaneSymbols}计算器，同时支持{sacredSymbols}：按每日、每周任务估算升级与满级日期，查看所需金币，规划你的徽章成长。",
    nav: "计算器",
  },
  handbook: {
    title: "{arcaneSymbols}・{sacredSymbols}升级需求与费用表 | Maple Symbols",
    description:
      "冒险岛国服（{pageServer}）数据：{arcaneSymbols}与{sacredSymbols}完整资料，各等级升级所需徽章数、金币费用，以及{arcanePower}、{sacredPower}对应的伤害比例。",
    nav: "手册",
  },
  changelog: {
    title: "更新日志 | Maple Symbols",
    description:
      "Maple Symbols 的完整版本历史与功能更新记录。Maple Symbols 是冒险岛{arcaneSymbols}与{sacredSymbols}计算器。",
    nav: "更多",
  },
  credits: {
    title: "致谢 | Maple Symbols",
    description:
      "Maple Symbols 致谢：冒险岛{arcaneSymbols}与{sacredSymbols}计算器背后的资料来源、创作者与社区成员。",
  },
  ogImageAlt: "Maple Symbols — 冒险岛徽章计算器",
} as const;
