// ---------------------------------------------------------------------------
// allMaxedOn.ts — The latest completion day among a family's unmaxed symbols, for the
// OverviewCard's closing line ("All maxed on …"). Pure, so it is testable without a render.
// ---------------------------------------------------------------------------

import type { Dayjs } from "dayjs";
import { inFamily } from "../../lib/game";
import { progressToMax } from "../../lib/calculator";
import { isMaxLevel } from "../../lib/utils";
import type { Region } from "../../lib/regions";
import type { SymbolData, SymbolType } from "../../lib/types";

/**
 * The latest completion day (`YYYY-MM-DD`) among `family`'s symbols that are not yet maxed,
 * or `null` while any of them has no computable date (an unset level, no quest enabled, or
 * any other reason `progressToMax` cannot resolve a day count).
 *
 * Also `null` when every symbol of the family is already maxed (there is nothing left to
 * date): that case reads the same as "cannot be dated" here on purpose. Telling the two
 * apart — nothing left to compute vs. everything already done — is the caller's job
 * (OverviewCard checks `isMaxLevel` on the family before falling back to this).
 */
export function allMaxedOn(
  symbols: SymbolData[],
  family: SymbolType,
  now: Dayjs,
  region: Region
): string | null {
  let latest: string | null = null;

  for (const symbol of symbols) {
    if (!inFamily(symbol.type, family)) continue;
    if (isMaxLevel(symbol.level, symbol.type)) continue;

    const { completion, daysRemaining } = progressToMax(symbol, now, region);
    if (completion === "Invalid Date" || !Number.isFinite(daysRemaining)) return null;
    if (latest === null || completion > latest) latest = completion;
  }

  return latest;
}
