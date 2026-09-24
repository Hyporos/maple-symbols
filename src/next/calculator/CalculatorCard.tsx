import { useState, type MouseEvent } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { FiCheck, FiLock, FiUnlock } from "react-icons/fi";
import { MdOutlineInfo } from "react-icons/md";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/Tooltip";
import { useLocalResetTime } from "../../hooks/useLocalResetTime";
import { track } from "../../lib/analytics";
import { formatMesos, formatNumber } from "../../lib/format";
import {
  CATALYST_RETENTION,
  EXTRA_MULTIPLIER,
  MAIN_STAT_PER_LEVEL,
  selectorWorksOn,
} from "../../lib/game";
import { isPublished, mesosKind, REGION_PROFILES, weeklySymbolsFor } from "../../lib/regions";
import { editionOf } from "../../lib/routes";
import { cn, isMaxLevel, isValid } from "../../lib/utils";
import { interpolate, useLocale, useMessages, useNameSet } from "../../i18n";
import { symbolNames } from "../../i18n/gameNames";
import Message from "../../i18n/Message";
import type { Mode } from "../../lib/types";
import { useAppStore } from "../../state/store";
import { Card, NumberField, ProgressBar, StatBox } from "../ui";
import QuestRow from "./QuestRow";
import ToolsSheet, { type Tool } from "./ToolsSheet";
import { useSymbolEditor } from "./useSymbolEditor";

// The small icon buttons beside the experience field (cap lock, apply overflow).
const ICON_BUTTON =
  "grid size-8 shrink-0 place-items-center rounded-lg transition-colors hover:bg-hover disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none";

// The buttons that open the Symbol Selector and Catalyst sheets.
const TOOL_BUTTON =
  "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-dark px-3 py-2 text-sm text-secondary transition-colors hover:bg-secondary hover:text-primary disabled:pointer-events-none disabled:opacity-25 motion-reduce:transition-none";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * CalculatorCard is the /next calculator's editor for the selected symbol: level and experience,
// * one row per quest, the next level's timing and cost, and the Symbol Selector and Catalyst.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const CalculatorCard = () => {
  /* ―――――――――――――――――――― Declarations ―――――――――――――――――――― */

  const messages = useMessages();
  const m = messages.next.calculator;
  const c = messages.calculator;
  const t = messages.tools;
  const locale = useLocale();
  const nameSet = useNameSet();

  const region = useAppStore((s) => s.region);
  const selectedId = useAppStore((s) => s.selectedId);
  const mode = useAppStore((s) => s.mode);

  const {
    symbol,
    nextExperience,
    readyForUpgrade,
    daysToNextLevel,
    setLevel,
    setExperience,
    toggle,
    unlockCap,
    lockCap,
    applyOverflow,
  } = useSymbolEditor();

  // The server's daily reset on the visitor's clock, for the day-count tooltip (REGIONS D-8).
  const resetTime = useLocalResetTime(region, locale);

  const [openTool, setOpenTool] = useState<Tool | null>(null);
  const [toolAnchor, setToolAnchor] = useState<HTMLElement | null>(null);

  // A tool belongs to the selection that opened it: the desktop popover is not modal, so the
  // picker stays usable while it is open. A new symbol or family closes it, during render (local
  // state only, no store write), so no frame shows one symbol's tool for another.
  const selection = `${selectedId}|${mode}`;
  const [toolSelection, setToolSelection] = useState(selection);
  if (toolSelection !== selection) {
    setToolSelection(selection);
    setOpenTool(null);
  }

  const names = symbolNames(symbol, nameSet);
  const { type } = symbol;
  const levelSet = isValid(symbol.level);
  const atMax = isMaxLevel(symbol.level, type);
  const mainStat = MAIN_STAT_PER_LEVEL[type];
  const extraMultiplier = EXTRA_MULTIPLIER[type] ?? 1;
  const catalystRetention = CATALYST_RETENTION[type];
  // Class-specific gains per level for the main stat tooltip; they differ by server. Read only
  // where `mainStat` is not null, which is exactly the families classGains covers (`as Mode`).
  const { demonAvengerHp, xenonAllStat } = REGION_PROFILES[region].classGains;
  // A tool shows only where the symbol has it, whatever state is left open.
  const toolAllowed: Record<Tool, boolean> = {
    selector: selectorWorksOn(symbol),
    catalyst: catalystRetention !== null,
  };

  // The cap controls, with the current Calculator's visibility rules: unlocking is offered once
  // the experience reaches the next level; locking and applying the overflow while unlocked.
  const canUnlock =
    symbol.locked &&
    readyForUpgrade &&
    isValid(symbol.experience) &&
    symbol.experience !== 0 &&
    !!symbol.level;
  const hasOverflow = symbol.experience > nextExperience;

  // What the daily pays with the extra as set, as if the daily were on.
  const dailyRate = symbol.dailySymbols * (symbol.extra ? extraMultiplier : 1);

  const openSheet = (tool: Tool) => (event: MouseEvent<HTMLButtonElement>) => {
    track("tool_used", { tool, action: "preview" });
    setToolAnchor(event.currentTarget);
    setOpenTool(tool);
  };

  /* ―――――――――――――――――――― Output ――――――――――――――――――――――――― */

  // A day count is shown (and explained by the info tooltip) only when one can be computed.
  const countingDays =
    !readyForUpgrade &&
    isValid(symbol.experience) &&
    (symbol.daily || !!symbol.weekly) &&
    Number.isFinite(daysToNextLevel);

  const nextLevelWhen = readyForUpgrade ? (
    m.readyNow
  ) : !countingDays ? (
    m.notSet
  ) : (
    <Message text={m.inDays} count={daysToNextLevel} />
  );

  return (
    <Card as="section" label={m.calculatorLabel}>
      {/* TITLE */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <img src={symbol.img} alt="" width={32} height={32} />
        <h2 className="text-base font-semibold text-primary">{names.name}</h2>
        {/* The current UI's "Level 12 → Level 13" glance. */}
        {levelSet && !atMax && (
          <p className="ml-auto flex items-center gap-2 text-sm text-secondary">
            <Message text={c.level} values={{ level: symbol.level }} />
            <FaArrowRight size={12} className="text-tertiary" />
            <Message text={c.level} values={{ level: symbol.level + 1 }} />
          </p>
        )}
      </div>

      {/* LEVEL AND EXPERIENCE */}
      <div className="mt-4 flex items-center gap-2">
        <NumberField
          label={c.levelPlaceholder}
          placeholder={c.levelPlaceholder}
          value={symbol.level}
          onChange={setLevel}
          className="min-w-0 flex-1"
        />
        <NumberField
          label={c.experiencePlaceholder}
          placeholder={c.experiencePlaceholder}
          value={symbol.experience}
          onChange={setExperience}
          className="min-w-0 flex-1"
        />
        {Number.isFinite(nextExperience) && (
          <p className="shrink-0 text-sm text-tertiary">
            {interpolate(m.expOf, { count: nextExperience }, locale)}
          </p>
        )}
        {canUnlock && (
          <Tooltip placement="bottom">
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={c.unlockCap}
                className={cn(ICON_BUTTON, "text-accent")}
                onClick={unlockCap}
              >
                <FiUnlock size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="tooltip">
              <Message text={c.unlockCapTooltip} />
            </TooltipContent>
          </Tooltip>
        )}
        {!symbol.locked && (
          <>
            <Tooltip placement="bottom">
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={c.lockCap}
                  className={cn(ICON_BUTTON, "text-tertiary")}
                  onClick={lockCap}
                >
                  <FiLock size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <Message text={c.lockCapTooltip} />
              </TooltipContent>
            </Tooltip>
            <button
              type="button"
              aria-label={c.applyOverflow}
              disabled={!hasOverflow}
              className={cn(ICON_BUTTON, hasOverflow ? "text-accent" : "text-tertiary")}
              onClick={applyOverflow}
            >
              <FiCheck size={18} />
            </button>
          </>
        )}
      </div>

      <ProgressBar
        className="mt-3"
        label={c.experiencePlaceholder}
        value={atMax ? 1 : symbol.experience}
        max={atMax ? 1 : Number.isFinite(nextExperience) ? nextExperience : 0}
      />

      {/* QUESTS */}
      <div className="mt-3 divide-y divide-white/6">
        <QuestRow
          label={c.daily}
          rate={interpolate(m.perDay, { count: dailyRate }, locale)}
          checked={symbol.daily}
          onChange={() => toggle("daily")}
          tooltip={<Message text={c.dailyTooltip} values={{ quest: names.dailyName }} />}
        />
        {symbol.weeklyName && (
          <QuestRow
            label={c.weekly}
            rate={interpolate(m.perWeek, { count: weeklySymbolsFor(region) }, locale)}
            checked={!!symbol.weekly}
            onChange={() => toggle("weekly")}
            tooltip={<Message text={c.weeklyTooltip} values={{ quest: names.weeklyName ?? "" }} />}
          />
        )}
        {symbol.extraName && (
          <QuestRow
            label={interpolate(m.extraQuest, { quest: names.extraName ?? "" }, locale)}
            rate={interpolate(m.extraFactor, { factor: extraMultiplier }, locale)}
            checked={!!symbol.extra}
            onChange={() => toggle("extra")}
            tooltip={<Message text={c.extraTooltip} values={{ quest: names.extraName ?? "" }} />}
          />
        )}
      </div>

      {/* NEXT LEVEL / MAX / UNSET */}
      <div className="mt-4">
        {levelSet && !atMax && (
          <div className="grid grid-cols-2 gap-2">
            <StatBox caption={m.nextLevel}>
              <span className="inline-flex items-center gap-1.5 text-primary">
                {nextLevelWhen}
                {countingDays && (
                  <Tooltip placement="top">
                    <TooltipTrigger aria-label={m.nextLevel} className="grid place-items-center">
                      <MdOutlineInfo size={16} className="fill-accent" />
                    </TooltipTrigger>
                    <TooltipContent className="tooltip">
                      <p>
                        <Message text={c.completionAssumption} />
                      </p>
                      {resetTime && (
                        <p className="pt-1.5">
                          <Message
                            text={c.resetHint}
                            values={{ server: editionOf(region).name, time: resetTime }}
                          />
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                )}
              </span>
            </StatBox>
            <StatBox caption={m.cost}>
              {isPublished(region, mesosKind(type)) ? (
                formatMesos(symbol.mesosRequired[symbol.level], locale)
              ) : (
                <Message text={c.mesosUnpublished} values={{ server: editionOf(region).name }} />
              )}
            </StatBox>
            {mainStat !== null && (
              <StatBox caption={m.mainStat}>
                <span className="inline-flex items-center gap-1.5 text-primary">
                  {`+${formatNumber(mainStat, locale)}`}
                  <Tooltip placement="top">
                    <TooltipTrigger aria-label={m.mainStat} className="grid place-items-center">
                      <MdOutlineInfo size={16} className="fill-accent" />
                    </TooltipTrigger>
                    <TooltipContent className="tooltip">
                      <div>
                        <Message
                          text={c.demonAvengerHp}
                          values={{ hp: demonAvengerHp[type as Mode] }}
                        />
                      </div>
                      <div>
                        <Message
                          text={c.xenonAllStat}
                          values={{ stat: xenonAllStat[type as Mode] }}
                        />
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </span>
              </StatBox>
            )}
          </div>
        )}
        {atMax && (
          <p className="text-center text-lg font-semibold tracking-widest text-accent">
            {c.maxLevel}
          </p>
        )}
        {!levelSet && (
          <div className="space-y-1.5 text-center">
            <p className="text-lg font-semibold tracking-widest text-secondary">{c.disabled}</p>
            <p className="text-xs font-light tracking-widest text-secondary">{c.disabledHint}</p>
          </div>
        )}
      </div>

      {/* TOOLS */}
      {(toolAllowed.selector || toolAllowed.catalyst) && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] tracking-[0.08em] text-tertiary uppercase">
            {m.toolsLabel}
          </p>
          <div className="flex gap-2">
            {toolAllowed.selector && (
              <button
                type="button"
                disabled={!levelSet}
                className={TOOL_BUTTON}
                onClick={openSheet("selector")}
              >
                <img
                  src={
                    type === "arcane"
                      ? "/symbols/arcane-selector.webp"
                      : "/symbols/sacred-selector.webp"
                  }
                  alt=""
                  width={24}
                  height={24}
                />
                {t.symbolSelector}
              </button>
            )}
            {toolAllowed.catalyst && (
              <button
                type="button"
                disabled={!levelSet}
                className={TOOL_BUTTON}
                onClick={openSheet("catalyst")}
              >
                <img
                  src={
                    type === "arcane"
                      ? "/symbols/arcane-catalyst.webp"
                      : "/symbols/sacred-catalyst.webp"
                  }
                  alt=""
                  width={24}
                  height={24}
                />
                {type === "arcane" ? t.arcaneCatalyst : t.sacredCatalyst}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Keyed on the selection: a new symbol or family starts the sheet over (no carried count). */}
      <ToolsSheet
        key={selection}
        tool={openTool ?? "selector"}
        open={openTool !== null && toolAllowed[openTool]}
        onClose={() => setOpenTool(null)}
        anchor={toolAnchor}
      />
    </Card>
  );
};

export default CalculatorCard;
