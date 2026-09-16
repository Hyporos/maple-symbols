import { Fragment } from "react";
import { interpolate, pluralMessage, type MessageValues } from "./interpolate";
import { useLocale } from "./index";
import type { PluralMessage } from "./types";

interface MessageProps {
  /** A catalogue entry, e.g. `m.calculator.readyForUpgrade`, or a `{ one, other }` pair with `count`. */
  text: string | PluralMessage;
  /** Values for the message's `{placeholders}`; numbers are formatted for the locale. */
  values?: MessageValues;
  /** Picks the plural form when `text` is a `{ one, other }` pair; also available as `{count}`. */
  count?: number;
}

// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * Renders one whole catalogue sentence, turning its <b>…</b> into the accent <span>.
// * The sentence stays in one piece so each language can order the words its own way (I18N B-1).
// ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ACCENT = /<b>([\s\S]*?)<\/b>/g;

/** Splits a message into plain and accent runs, in order. Exported for tests. */
export function splitAccents(message: string): { text: string; accent: boolean }[] {
  const parts: { text: string; accent: boolean }[] = [];
  let last = 0;
  for (const match of message.matchAll(ACCENT)) {
    if (match.index > last) parts.push({ text: message.slice(last, match.index), accent: false });
    parts.push({ text: match[1], accent: true });
    last = match.index + match[0].length;
  }
  if (last < message.length) parts.push({ text: message.slice(last), accent: false });
  if (parts.some((p) => /<\/?\w/.test(p.text))) {
    throw new Error(`i18n: only <b>…</b> markup is supported, without nesting: "${message}"`);
  }
  return parts;
}

const Message = ({ text, values = {}, count }: MessageProps) => {
  const locale = useLocale();
  const message = typeof text === "string" ? text : pluralMessage(text, count ?? NaN, locale);
  const allValues = count === undefined ? values : { count, ...values };

  return (
    <>
      {splitAccents(message).map(({ text: run, accent }, i) => {
        const filled = interpolate(run, allValues, locale);
        return accent ? <span key={i}>{filled}</span> : <Fragment key={i}>{filled}</Fragment>;
      })}
    </>
  );
};

export default Message;
