// ---------------------------------------------------------------------------
// changelog.ts — The versions the Changelog shows: number, release day and pull request.
// The notes themselves are copy, one set per language, in the catalogue's `changelog` area
// (src/i18n/en/changelog.ts), keyed by version; a test holds the two lists to each other.
// ---------------------------------------------------------------------------

import type { changelog } from "../i18n/en/changelog";

/** A version that has notes in the catalogue. */
export type ChangelogVersion = keyof typeof changelog;

export interface ChangelogEntry {
  version: ChangelogVersion;
  /**
   * Release day as ISO `YYYY-MM-DD`, locale-neutral. It feeds `<time dateTime>` as-is and
   * is displayed through `formatDate` (src/lib/format.ts), never rendered raw (I18N-12).
   */
  date: string;
  link: string;
}

/** Oldest first; the UI treats the last entry as the current version. */
export const changelogEntries: ChangelogEntry[] = [
  {
    version: "v1.0.1",
    date: "2023-07-25",
    link: "https://github.com/Hyporos/maple-symbols/pull/2",
  },
  { version: "v1.1", date: "2023-08-24", link: "https://github.com/Hyporos/maple-symbols/pull/3" },
  {
    version: "v1.1.1",
    date: "2023-08-25",
    link: "https://github.com/Hyporos/maple-symbols/pull/4",
  },
  {
    version: "v1.1.2",
    date: "2023-08-27",
    link: "https://github.com/Hyporos/maple-symbols/pull/5",
  },
  {
    version: "v1.1.3",
    date: "2023-08-31",
    link: "https://github.com/Hyporos/maple-symbols/pull/6",
  },
  {
    version: "v1.1.4",
    date: "2023-11-15",
    link: "https://github.com/Hyporos/maple-symbols/pull/7",
  },
  { version: "v1.2", date: "2023-12-13", link: "https://github.com/Hyporos/maple-symbols/pull/8" },
  {
    version: "v1.2.1",
    date: "2023-12-14",
    link: "https://github.com/Hyporos/maple-symbols/pull/11",
  },
  {
    version: "v1.2.2",
    date: "2023-12-17",
    link: "https://github.com/Hyporos/maple-symbols/pull/12",
  },
  { version: "v1.3", date: "2024-03-01", link: "https://github.com/Hyporos/maple-symbols/pull/13" },
  {
    version: "v1.3.0.1",
    date: "2025-08-22",
    link: "https://github.com/Hyporos/maple-symbols/pull/15",
  },
  {
    version: "v1.3.0.2",
    date: "2026-03-03",
    link: "https://github.com/Hyporos/maple-symbols/pull/16",
  },
  {
    version: "v1.4.0",
    date: "2026-09-16",
    link: "https://github.com/Hyporos/maple-symbols/pull/17",
  },
  {
    version: "v1.4.1",
    date: "2026-09-16",
    link: "https://github.com/Hyporos/maple-symbols/pull/19",
  },
  {
    version: "v1.4.2",
    date: "2026-09-16",
    link: "https://github.com/Hyporos/maple-symbols/pull/20",
  },
];
