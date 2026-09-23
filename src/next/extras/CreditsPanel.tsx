import CreditText from "../../components/CreditText";
import { interpolate, useMessages } from "../../i18n";

// Where the numbers come from today (docs/GAME.md §6): the wiki, and each server's own
// official site. Proper names, so they are data, not catalogue copy (matches Credits.tsx).
const DATA_SOURCES = [
  { label: "MapleStory Wiki", link: "https://maplestorywiki.net/" },
  { label: "Nexon (GMS)", link: "https://www.nexon.com/maplestory/news/update" },
  { label: "MapleStory SEA", link: "https://www.maplesea.com/updates" },
  { label: "메이플스토리 (KMS)", link: "https://maplestory.nexon.com/news/update" },
  { label: "メイプルストーリー (JMS)", link: "https://maplestory.nexon.co.jp/notice/" },
  { label: "新楓之谷 (TMS)", link: "https://maplestory.beanfun.com/bulletin" },
  { label: "冒险岛 (CMS)", link: "https://mxd.web.sdo.com/" },
] as const;

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * CreditsPanel is the Extras page's Credits tab: the current Credits content, restyled to
// * grow with the Card instead of a fixed height.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const CreditsPanel = () => {
  const m = useMessages().extras;

  return (
    <div className="flex flex-col items-center gap-10 py-1">
      {/* RESOURCES: the original three, then where the numbers come from today */}
      <div className="w-full max-w-[420px] space-y-3">
        <h3 className="text-center text-base font-semibold text-primary">{m.resourcesUsed}</h3>
        <div className="mx-auto h-px w-[200px] bg-white/10" />
        <div className="space-y-2">
          <CreditText
            label="MapleStory Fandom Wiki"
            img="/credits/maplestory-fandom.webp"
            link="https://maplestory.fandom.com/"
          />
          <CreditText
            label="MapleStory Strategy Wiki"
            img="/credits/strategy-wiki.webp"
            link="https://strategywiki.org/wiki/MapleStory"
          />
          <CreditText
            label="Orange Mushroom's Blog"
            img="/credits/orange-mushroom.webp"
            link="https://orangemushroom.net/"
          />
        </div>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-1 text-xs">
          {DATA_SOURCES.map((source) => (
            <li key={source.link}>
              <a
                href={source.link}
                target="_blank"
                rel="noopener"
                data-umami-event="outbound"
                data-umami-event-destination="credit"
                className="text-accent transition-colors hover:text-primary motion-reduce:transition-none"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* ACKNOWLEDGMENTS */}
      <div className="w-[215px] space-y-3">
        <h3 className="text-center text-base font-semibold text-primary">{m.acknowledgments}</h3>
        <div className="h-px w-full bg-white/10" />
        <div className="space-y-2">
          <CreditText
            label="Scardor"
            img="/credits/scardor.webp"
            twitch="https://www.twitch.tv/scardor"
            youtube="https://www.youtube.com/user/zottenkerel"
            x="https://twitter.com/scardorgaming"
          />
          <CreditText
            label="GradedPeanut"
            img="/credits/gradedpeanut.webp"
            twitch="https://www.twitch.tv/gradedpeanut"
            youtube="https://www.youtube.com/channel/UCvNoLyymLPSosJpOsX0SOqg"
          />
        </div>
      </div>

      {/* SPECIAL THANKS */}
      <div className="w-[215px] space-y-3">
        <h3 className="text-center text-base font-semibold text-primary">{m.specialThanks}</h3>
        <div className="h-px w-full bg-white/10" />
        <div className="space-y-2">
          <CreditText
            label={interpolate(m.membersOf, { group: "Saku" })}
            img="/credits/saku.webp"
          />
          <CreditText
            label={interpolate(m.membersOf, { group: "Shark Tank" })}
            img="/credits/shark-tank.webp"
          />
        </div>
      </div>
    </div>
  );
};

export default CreditsPanel;
