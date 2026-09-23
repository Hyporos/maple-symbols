import { useState } from "react";
import { FaGithub } from "react-icons/fa6";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { interpolate, useLocale, useMessages } from "../../i18n";
import { changelogEntries, type ChangelogEntry, type ChangelogVersion } from "../../lib/changelog";
import { formatDate } from "../../lib/format";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * ChangelogPanel is the Extras page's Changelog tab: every version's notes as a vertical list,
// * newest first, on desktop; a version picker showing one entry at a time on phones.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ChangelogPanel = () => {
  const messages = useMessages();
  const m = messages.extras;
  const locale = useLocale();
  const { isMobile } = useBreakpoint();

  const newestFirst = [...changelogEntries].reverse();
  const [selected, setSelected] = useState<ChangelogVersion>(newestFirst[0].version);

  const renderEntry = (entry: ChangelogEntry) => {
    const {
      additions = [],
      fixes = [],
    }: { additions?: readonly string[]; fixes?: readonly string[] } =
      messages.changelog[entry.version];

    return (
      <article
        key={entry.version}
        className="border-t border-white/8 pt-5 first:border-t-0 first:pt-0"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-primary">{entry.version}</h3>
          <div className="flex items-center gap-3">
            <time dateTime={entry.date} className="text-xs text-tertiary">
              {formatDate(entry.date, locale)}
            </time>
            <a
              href={entry.link}
              target="_blank"
              rel="noopener"
              aria-label={interpolate(m.pullRequestLink, { version: entry.version })}
              className="text-tertiary transition-colors hover:text-primary motion-reduce:transition-none"
            >
              <FaGithub size={16} />
            </a>
          </div>
        </div>

        {additions.length > 0 && (
          <div className="mt-3">
            <h4 className="mb-2 text-sm font-semibold text-secondary">{m.newAdditions}</h4>
            <ul className="space-y-1.5">
              {additions.map((line, index) => (
                <li key={index} className="text-sm text-secondary">
                  • {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {fixes.length > 0 && (
          <div className="mt-3">
            <h4 className="mb-2 text-sm font-semibold text-secondary">{m.bugFixes}</h4>
            <ul className="space-y-1.5">
              {fixes.map((line, index) => (
                <li key={index} className="text-sm text-secondary">
                  • {line}
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    );
  };

  if (isMobile) {
    const entry = newestFirst.find((e) => e.version === selected) ?? newestFirst[0];
    return (
      <div>
        <select
          aria-label={m.changelogTab}
          value={selected}
          onChange={(event) => setSelected(event.target.value as ChangelogVersion)}
          className="mb-5 w-full rounded-lg bg-dark px-3 py-2 text-sm text-primary outline-hidden"
        >
          {newestFirst.map((e) => (
            <option key={e.version} value={e.version}>
              {e.version}
            </option>
          ))}
        </select>
        {renderEntry(entry)}
      </div>
    );
  }

  return <div className="space-y-5">{newestFirst.map(renderEntry)}</div>;
};

export default ChangelogPanel;
