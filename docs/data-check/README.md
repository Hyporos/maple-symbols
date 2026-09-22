# Data check sheets

Working files for re-confirming the game data (GAME §0: everything shipped today is unverified). Each CSV is pre-filled with what the site uses now, so checking means correcting a cell, not typing a table. These are scratch files, not a source the app reads: once a sheet is settled, the numbers go into `src/lib/symbols.json`, `src/lib/game.ts` or `src/lib/ratioData.ts`, the result is recorded in GAME §6, and the sheet stays as the record of that check.

## How to fill them in

- The last column is `correct?`. Put `y` if our number matches the game, or **the right value** if it does not. Leave it blank for anything you did not check.
- Add a note when something is odd (a value that changed in a patch, a name that differs between the client and a wiki).
- Numbers are plain digits, no commas or "m"/"b" suffixes, so a bad cell is obvious.
- Nothing here is authoritative until GAME §6 has a row for it.

## The sheets

| File                                             | What to check                                                                                     | Best source                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `gms-symbols.csv`                                | Symbol and quest names, symbols per day, weekly and extra quests                                  | The in-game quest list                                       |
| `gms-exp-arcane.csv`, `gms-exp-sacred.csv`       | Symbols needed per level-up (shared by every symbol of that type)                                 | The symbol UI in game                                        |
| `gms-mesos-arcane.csv`, `gms-mesos-sacred.csv`   | Meso cost per level-up, per symbol (the biggest block)                                            | The symbol UI in game                                        |
| `gms-constants.csv`                              | Max levels, weekly amount, extra multipliers, Catalyst, power, main stat, Demon Avenger and Xenon | In game; patch notes                                         |
| `gms-ratios-arcane.csv`, `gms-ratios-sacred.csv` | Damage dealt and taken per power band                                                             | In game; the wikis                                           |
| `resets.csv`                                     | Daily and weekly quest reset times, in UTC, per server (settles KI-013)                           | In game; official notices                                    |
| `grand-sacred.csv`                               | Tallahart and Geardock, for 2.0                                                                   | Pre-filled from maplestorywiki.net, needs confirming in game |
| `server-differences.csv`                         | Whether KMS, JMS, TMS, CMS and MSEA differ from GMS at all                                        | Regional wikis and patch notes                               |

## Order

1. `grand-sacred.csv` (2.0 needs it, and we had nothing).
2. `gms-mesos-*.csv` (most likely to have drifted with patches).
3. `resets.csv` (the one item that can give a player a wrong date today).
4. `gms-symbols.csv`, `gms-exp-*.csv`, `gms-constants.csv`, `gms-ratios-*.csv`.
5. `server-differences.csv`: only whether each server differs, not full tables. Showing another server's numbers would be a data-model change and a separate decision (I18N §0).
