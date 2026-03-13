// ---------------------------------------------------------------------------
// changelog.ts — Version history entries displayed in the Changelog component.
// ---------------------------------------------------------------------------

export interface ChangelogEntry {
  version: string;
  date: string;
  link: string;
  additions?: string[];
  fixes?: string[];
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "v1.0.1",
    date: "Jul 25, 2023",
    link: "https://github.com/Hyporos/maple-symbols/pull/2",
    fixes: [
      "Disabled the Dark Reader plugin as it messed with colors.",
      "Made the y padding on Arcane Catalyst match the same padding as Symbol Selector.",
      "Sacred Symbol target level was defaulting to 20, now set to 11.",
    ],
  },
  {
    version: "v1.1",
    date: "Aug 24, 2023",
    link: "https://github.com/Hyporos/maple-symbols/pull/3",
    additions: [
      "By default, you can only enter symbol experience up to what is required to reach the next level. Now, when you enter that capped number, you can choose to unlock the restriction and instead enter any number up to 2679 or 4565, depending on the type of symbol. This will allow users who are stacking up symbols without leveling them up to conveniently view them with their updated level/experience.",
      "Added a link to the GitHub repo in the footer.",
    ],
    fixes: [
      "Prevented tab focus on the Tools section (selector/catalyst) when the respective symbol is disabled.",
      "Disabled dragging & selecting on images.",
      "Changed the default website description that shows on Google.",
      "Total symbols remaining in the Overview section (tables/target level) will now show 0 instead of a blank character when you have enough experience to reach level 20.",
    ],
  },
  {
    version: "v1.1.1",
    date: "Aug 25, 2023",
    link: "https://github.com/Hyporos/maple-symbols/pull/4",
    fixes: [
      "Fixed experience fields being set to 'unlocked' by default on new sessions.",
      "Repositioned the tooltip for the lock/unlock button.",
    ],
  },
  {
    version: "v1.1.2",
    date: "Aug 27, 2023",
    link: "https://github.com/Hyporos/maple-symbols/pull/5",
    additions: [
      "If a symbol is going to be maxed on Nov 15 or later (the estimated date of the New Age patch), then there will be an indicator letting you know that on this patch, the daily symbol count will be increased (all symbols will give 20 daily).",
    ],
    fixes: [
      "Re-adjusted the footer for mobile devices which was misaligned due to the new GitHub link.",
      "Fixed another bug with the locks where if you refreshed on empty values it would show the unlock button.",
      "Fixed an issue where you couldn't input max level on Sacred Symbols.",
    ],
  },
  {
    version: "v1.1.3",
    date: "Aug 31, 2023",
    link: "https://github.com/Hyporos/maple-symbols/pull/6",
    fixes: [
      "Adjusted the symbol upgrade costs to reflect the latest patch.",
      "The Symbol Selector value no longer resets when you select another symbol.",
      "Catalyst is no longer 'disabled' while experience is unlocked.",
      "Fixed some issues where Catalyst would show an incorrect value at levels 20 and 2.",
      "Catalyst result now rounds dynamically instead of only down, now showing the correct number.",
      "Fixed an issue where unlocking the exp and inputting an overflowing value would interfere with the Symbol Selector tool.",
      "When applying an unlocked experience value, it will lock again instead of staying unlocked.",
      "Slightly re-positioned some elements, such as the header and some horizontal dividers.",
    ],
  },
  {
    version: "v1.1.4",
    date: "Nov 15, 2023",
    link: "https://github.com/Hyporos/maple-symbols/pull/7",
    additions: [
      "Three new symbols have been added (Shangri-La, Arteria, Carcion), all of which will be introduced during the New Age update.",
    ],
    fixes: [
      "Daily rewards have been adjusted. Each Arcane Symbol quest will now get you 20 symbols daily. Cernium will give you 20 (cern + burn quests got merged), and Odium will give you 10.",
    ],
  },
  {
    version: "v1.2",
    date: "Dec 13, 2023",
    link: "https://github.com/Hyporos/maple-symbols/pull/8",
    additions: [
      "Visualize your arcane/sacred power trend with the new graph! It'll display the rate at which it grows, which includes date and power. You can hover over the graph to view more details on the current date in addition to the power, such as which symbols leveled up.",
      "Ever wondered how long it would take to reach a certain amount of arcane/sacred power? There's now an option above the graph that lets you input any value, and it'll tell you the date you'll reach it.",
    ],
  },
  {
    version: "v1.2.1",
    date: "Dec 14, 2023",
    link: "https://github.com/Hyporos/maple-symbols/pull/11",
    additions: [
      "You can now choose between two ways to view your progression graph. Linear (default), and exponential. Linear is the same as the previous version, where each X axis tick will be assigned to its respective date. With the exponential version, each X axis tick is set to dates in between now and the final completion date. This will give you a better idea on how long it's taking for your symbols to level up.",
    ],
    fixes: [
      "Fixed a bug where users on older versions did not receive certain updates unless they cleared their site cache.",
    ],
  },
  {
    version: "v1.2.2",
    date: "Dec 17, 2023",
    link: "https://github.com/Hyporos/maple-symbols/pull/12",
    fixes: [
      "Changed the arrow icon that is used across the site.",
      "Added a tooltip to the Linear/Exponential graph options.",
      "Added a tooltip to the Question Mark Icon.",
    ],
  },
  {
    version: "v1.3",
    date: "Mar 1, 2024",
    link: "https://github.com/Hyporos/maple-symbols/pull/13",
    additions: [
      "Added the Handbook and Extras sections to the page. If you're reading this from the changelogs, then it's working! This new part of the site will provide with information regarding symbol experience / damage ratio / level up cost tables, a log of prior updates, as well as a credits section.",
      "Completely redesigned the header and footer. With a more conventional style, it's easier to adapt to potential features implemented in future updates.",
      "Reworked the Selector component. Enjoy a smoother, more intuitive symbol selecting and swapping experience.",
      "Added a link to a paypal donation page on the right side of the header. The site will forever remain ad-free, however there are always costs involved with hosting. You can choose to support me and my work, I'd really appreciate it!",
    ],
    fixes: [
      "Removed the disclaimer upon loading the page.",
      "Added names for the Shangri-La, Carcion and Arteria daily quest tooltips.",
      "Reworded the Linear / Exponential graph variants for intuitiveness. The default option has been changed to Exponential.",
      "Improved responsiveness and redesigned the UI for smaller devices (tablets & phones).",
      "Increased the visibility of the bottom borders on the Daily/Weekly/Extra buttons.",
      "Adjusted an incorrect level up cost for Lachelein.",
      "Made the footer now stick to the bottom of the window, regardless of height.",
      "Fixed an issue where certain symbol icons would appear blurry.",
      "Fixed an issue where swapping from Arcane to Sacred symbols would cause flickering text on the Calculator.",
    ],
  },
  {
    version: "v1.3.0.1",
    date: "Aug 22, 2025",
    link: "https://github.com/Hyporos/maple-symbols/pull/15",
    additions: ["Updated Weekly Quests to provide 120 instead of 40 symbols per week."],
    fixes: ["Optimized SEO for the webapp. Let's see if it brings it higher up on google!"],
  },
  {
    version: "v1.3.0.2",
    date: "Mar 3, 2026",
    link: "https://github.com/Hyporos/maple-symbols/pull/16",
    fixes: [
      "Improved general performance and load time around the web app. (Also, our previous SEO change did work!)",
    ],
  },
  {
    version: "v1.4.0",
    date: "Mar 17, 2026",
    link: "https://github.com/Hyporos/maple-symbols/pull/17",
    additions: [
      "Enhanced the visibility for current-level table rows (Experience & Meso Cost Tables) on the Handbook.",
    ],
    fixes: [
      "Used AI to refactor, reorganize and optimize the entire codebase. This should improve performance, readability and maintainability across the board. If you notice any bugs or issues, please report them on the Discord (linked in footer) so I can fix them as soon as possible!",
      "Further optimized the SEO and added URLs for certain sections of the page. This should help with search rankings and make it easier for users to find Maple Symbols.",
    ],
  },
];
