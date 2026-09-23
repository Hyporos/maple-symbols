// @vitest-environment node
// ---------------------------------------------------------------------------
// The data watcher (scripts/check-game-data.mjs) compares each server's sources
// with that server's numbers, which it builds itself from symbols.json and
// regions.json because it is plain Node. This pins that its numbers are the ones
// the site shows, and that its regional parsers read the shapes the sources use.
// ---------------------------------------------------------------------------

import { describe, expect, it } from "vitest";
import symbolsJson from "../lib/symbols.json";
import regionsJson from "../lib/regions.json";
import { createInitialSymbols } from "../lib/data";
import { EXTRA_MULTIPLIER } from "../lib/game";
import { REGIONS } from "../lib/regions";
import {
  SERVERS,
  costDifference,
  dailyCap,
  describeExpected,
  expectedFor,
  newDifferences,
  parseBwiki,
  parseJpAmount,
  parseKiiten,
  symbolLines,
} from "../../scripts/game-data.mjs";

describe("expectedFor (each server's numbers in the watcher)", () => {
  it("covers the same servers as the site, in the same order", () => {
    expect(SERVERS).toEqual([...REGIONS]);
  });

  it.each(REGIONS)(
    "gives %s the dailies and meso costs createInitialSymbols gives it",
    (region) => {
      const watcher = expectedFor(region, symbolsJson, regionsJson).symbols;
      const site = createInitialSymbols(region);
      expect(watcher.map((s) => [s.id, s.name, s.dailySymbols, s.mesosRequired])).toEqual(
        site.map((s) => [s.id, s.name, s.dailySymbols, s.mesosRequired])
      );
    }
  );

  it("applies KMS's own arcane costs and keeps the GMS sacred ones", () => {
    const kms = expectedFor("kms", symbolsJson, regionsJson);
    const vj = kms.symbols.find((s) => s.id === 1)!;
    const cernium = kms.symbols.find((s) => s.id === 7)!;
    expect(vj.mesosRequired[1]).toBe(670_000);
    expect(cernium.mesosRequired).toEqual(
      symbolsJson.symbols.find((s) => s.id === 7)!.mesosRequired
    );
    expect(kms.overridden).toEqual([1, 2, 3, 4, 5, 6]);
    expect(kms.weekly).toEqual({ perClear: 240, clears: 1 });
  });

  it("describes a server's numbers in one line, with its statuses", () => {
    const line = describeExpected(expectedFor("kms", symbolsJson, regionsJson), EXTRA_MULTIPLIER);
    expect(line).toContain("weekly 240 × 1");
    expect(line).toContain("Xenon 66 / 132");
    expect(line).toContain("own costs for 6 symbols");
    expect(line).toContain("Vanishing Journey 20 (40 with Reverse City)");
  });

  it("caps a day at the daily times the extra multiplier where an extra quest exists", () => {
    const [vj, , lachelein] = expectedFor("jms", symbolsJson, regionsJson).symbols;
    expect(dailyCap(vj, EXTRA_MULTIPLIER)).toBe(40);
    expect(dailyCap(lachelein, EXTRA_MULTIPLIER)).toBe(40);
  });
});

describe("patch-note lines", () => {
  it("keeps symbol lines that mention a change, in every server's language", () => {
    const html =
      "<p>■ 아케인심볼 강화 비용 조정</p><p>完成奧術之河地區每日任務時獲得的經驗值、符文增加</p>" +
      "<p>神秘徽章升级费用调整</p><p>今日のメンテナンス</p>";
    expect(symbolLines(html)).toEqual([
      "■ 아케인심볼 강화 비용 조정",
      "完成奧術之河地區每日任務時獲得的經驗值、符文增加",
      "神秘徽章升级费用调整",
    ]);
  });

  it("ignores TMS event counters that reset on Thursday (M-015)", () => {
    expect(symbolLines("<p>每週可簽到次數會於每週四0:00初始化。</p>")).toEqual([]);
  });
});

describe("comparing a community table", () => {
  it("reads kiiten's amounts: 万 exactly, 億 to one hundredth", () => {
    expect(parseJpAmount("1,423万")).toEqual({ value: 14_230_000, unit: 1e4 });
    expect(parseJpAmount("1.14億")).toEqual({ value: 114_000_000, unit: 1e6 });
    expect(parseJpAmount("12億")).toEqual({ value: 1_200_000_000, unit: 1e6 });
    expect(parseJpAmount("12")).toBeNull();
  });

  it("counts a rounded amount as matching, and reports a real difference with both totals", () => {
    const ours = [0, 36_500_000, 331_500_000];
    const rounded = [
      { value: 0, unit: 1 },
      { value: 36_500_000, unit: 1e4 },
      { value: 331_000_000, unit: 1e6 },
    ];
    expect(costDifference("Cernium", ours, rounded, "kiiten")).toBeNull();
    const typo = [rounded[0], rounded[1], { value: 190_000_000, unit: 1e6 }];
    expect(costDifference("Cernium", ours, typo, "kiiten")).toBe(
      "Cernium: 1 of 2 meso costs differ on kiiten, total 226,500,000 (ours 368,000,000): 2→3 190,000,000 (ours 331,500,000)"
    );
  });

  it("reports only differences that are new, and recorded ones that went away", () => {
    expect(newDifferences(["a", "b"], ["b", "c"])).toEqual({ fresh: ["a"], gone: ["c"] });
    expect(newDifferences([], undefined)).toEqual({ fresh: [], gone: [] });
  });
});

/** A kiiten arcane page cut down to what the parser reads, in its own wording. */
const kiitenArcane = () => {
  const names = [
    "消滅の旅路",
    "チューチューアイランド",
    "レヘルン",
    "アルカナ",
    "モラス",
    "エスフェラ",
  ];
  const stages = names
    .map(
      (name, i) =>
        `<div>Stage ${["I", "II", "III", "IV", "V", "VI"][i]} ${name} Req Lv 200 日 配布 40 /日</div>`
    )
    .join("");
  const stats = Array.from(
    { length: 20 },
    (_, i) =>
      `${i + 1} ${30 + 10 * i} ${300 + 100 * i} ${117 + 39 * i} ${(4200 + 1400 * i).toLocaleString("en-US")}`
  ).join(" ");
  const costs = Array.from(
    { length: 19 },
    (_, i) => `${i + 1} → ${i + 2} ${names.map(() => `${97 + i}万`).join(" ")} ${12 + i}`
  ).join(" ");
  return (
    `<main>${stages}<table><tr><td>Lv</td><td>フォース</td><td>メインステータス</td><td>ゼノンステータス</td>` +
    `<td>デーモンアヴェンジャーHP</td></tr> ${stats} ×6 1,320</table>` +
    `<table>Lv ${names.join(" ")} 必要シンボル数 ${costs} 合計 2.5億</table></main>` +
    `<script>self.__next_f.push([1,"Stage IX 偽物 Req Lv 1 日 配布 99 /日"])</script>`
  );
};

describe("parseKiiten", () => {
  it("reads the daily caps, the per-level gains and the cost table", () => {
    const parsed = parseKiiten(kiitenArcane(), "arcane");
    expect(parsed.stages).toHaveLength(6);
    expect(parsed.stages[0]).toEqual({ name: "消滅の旅路", daily: 40 });
    expect(parsed.gains).toEqual({ power: 10, mainStat: 100, xenon: 39, demonAvenger: 1400 });
    expect(parsed.costs[0]).toHaveLength(20);
    expect(parsed.costs[5][19]).toEqual({ value: 1_150_000, unit: 1e4 });
  });

  it("throws when the page no longer reads as expected", () => {
    expect(() => parseKiiten("<p>メンテナンス中</p>", "arcane")).toThrow(/regions found/);
  });
});

describe("parseBwiki", () => {
  const page = [
    "===神秘力量===",
    "{{段落|每个神秘徽章开始的时候拥有30点神秘力量，而后每一级神秘力量可以提供10点神秘力量。}}",
    "{{段落|消亡旅途神秘徽章升级所消耗的金币遵循：'''3110000 + 3960000 × 当前成长等级'''}}",
    "{{段落|阿尔卡那、莫拉斯、埃斯佩拉神秘徽章升级所消耗的金币遵循：'''11196000 + 5940000 × 当前成长等级'''}}",
    "<!--{{段落|啾啾岛神秘徽章升级所消耗的金币遵循：'''1 + 1 × 当前成长等级'''}}-->",
    "===恶魔复仇者===",
    "{{段落|神秘徽章初始基于6300HP，而后每次升级给予2100HP}}",
    "===尖兵===",
    "{{段落|神秘徽章初始基于144力量,144敏捷,144运气，而后每次升级给予48力量, 48敏捷,48运气}}",
    "===其余职业===",
    "{{段落|神秘徽章初始基于300主属性，而后每次升级给予100主属性}}",
  ].join("\n");

  it("turns each stated cost formula into a per-level table, for every region it names", () => {
    const { costs } = parseBwiki(page, 20);
    expect(costs[1].table.slice(0, 3)).toEqual([0, 7_070_000, 11_030_000]);
    expect(costs[1].table).toHaveLength(20);
    expect(costs[6].formula).toBe("11,196,000 + 5,940,000 × level");
    expect(costs[2]).toBeUndefined(); // commented out on the page
  });

  it("reads the per-level gains its prose states", () => {
    expect(parseBwiki(page, 20).gains).toEqual({
      power: 10,
      mainStat: 100,
      xenon: 48,
      demonAvenger: 2100,
    });
  });
});
