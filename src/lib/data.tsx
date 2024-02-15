const changelogEntries = [
  {
    version: "v1.1",
    additions: [
      "By default, you can only enter symbol experience up to what is required to reach the next level. Now, when you enter that capped number, you can choose to unlock the restriction and instead enter any number up to 2679 or 4565, depending on the type of symbol. This will allow users who are stacking up symbols without leveling them up to conveniently view them with their updated level/experience.",
      "Added a link to the GitHub repo in the footer",
    ],
    fixes: [
      "Prevented tab focus on the Tools section (selector/catalyst) when the respective symbol is disabled",
      "Disabled dragging & selecting on images",
      "Changed the default website description that shows on Google",
      "Total symbols remaining in the Levels section (tables/target level) will now show 0 instead of a blank character when you have enough experience to reach level 20",
    ],
  },
  {
    version: "v1.1.1",
    fixes: [
      "Fixed experience fields being set to 'unlocked' by default on new sessions",
      "Repositioned the tooltip for the lock/unlock button"
    ],
  },
  {
    version: "v1.1.2",
    additions: ["If a symbol is going to be maxed on Nov 15 or later (the estimated date of the New Age patch), then there will be an indicator letting you know that on this patch, the daily symbol count will be increased. (all symbols will give 20 daily)"],
    fixes: [
      "Re-adjusted the footer for mobile devices which was misaligned due to the new GitHub link",
      "Fixed another bug with the locks where if you refreshed on empty values it would show the unlock button",
      "Fixed an issue where you couldn't input max level on Sacred Symbols"
    ],
  },
  {
    version: "v1.1.3",
    fixes: [
      "Adjusted the symbol upgrade costs to reflect the latest patch.",
      "The Symbol Selector value no longer resets when you select another symbol",
      "Catalyst is no longer 'disabled' while experience is unlocked",
      "Fixed some issues where Catalyst would show an incorrect value at levels 20 and 2",
      "Catalyst result now rounds dynamically instead of only down, now showing the correct number",
      "Fixed an issue where unlocking the exp and inputting an overflowing value would interfere with the Symbol Selector tool",
      "When applying an unlocked experience value, it will lock again instead of staying unlocked",
      "Slightly re-positioned some elements, such as the header and some horizontal dividers",
    ],
  },
  {
    version: "v1.1.4",
    additions: ["Three new symbols have been added (Shangri-La, Arteria, Carcion), all of which will be introduced during the New Age update."],
    fixes: [
      "Daily rewards have been adjusted. Each Arcane Symbol quest will now get you 20 symbols daily. Cernium will give you 20 (cern + burn quests got merged), and Odium will give you 10.",
    ],
  },
  {
    version: "v1.2",
    additions: ["Visualize your arcane/sacred power trend with the new graph! It'll display the rate at which it grows, which includes date and power. You can hover over the graph to view more details on the current date in addition to the power, such as which symbols leveled up.",
"Ever wondered how long it would take to reach a certain amount of arcane/sacred power? There's now an option above the graph that lets you input any value, and it'll tell you the date you'll reach it."],
  },
  {
    version: "v1.2.1",
    additions: ["You can now choose between two ways to view your progression graph. Linear (default), and exponential. Linear is the same as the previous version, where each X axis tick will be assigned to its respective date. With the exponential version, each X axis tick is set to dates in between now and the final completion date. This will give you a better idea on how long it's taking for your symbols to level up."],
    fixes: [
      "Fixed a bug where users on older versions did not receive certain updates unless they cleared their site cache.",
    ],
  },
  {
    version: "v1.2.2",
    fixes: [
      "Changed the arrow icon that is used across the site",
      "Added a tooltip to the Linear/Exponential graph options",
      "Added a tooltip to the Question Mark Icon"
    ],
  },
  {
    version: "v1.3",
    additions: ["Added the Information section to the page. If you're reading this from the changelogs, then it's working! This new part of the site will provide with information regarding symbol experience / level up cost tables, a log of prior updates, as well as a credits section."],
    fixes: [
      "Added names for the Shangri-La, Carcion and Arteria daily quest tooltips",
      "Fixed an incorrect level up cost for Lachelein"
    ],
  },
];

export default changelogEntries;
