import CreditText from "../CreditText";
import { interpolate, useMessages } from "../../i18n";

// Where the numbers come from today (docs/GAME.md §6): the wiki, and each server's own
// official site. Proper names, so they are data, not catalogue copy.
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
// * The Credits component will display all acknowledgments to resources, users, and communities.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Credits = () => {
  const m = useMessages().extras;

  return (
    <div className="mx-12 flex h-[555px] py-10">
      <div className="flex w-full flex-col items-center justify-around space-y-12">
        {/* RESOURCES: the original three, then where the numbers come from today */}
        <div className="w-[270px] space-y-3 md:w-[420px]">
          <h1 className="text-center text-lg font-semibold md:text-xl">{m.resourcesUsed}</h1>
          <div className="mx-auto h-px w-[195px] bg-white/10 md:w-[215px]"></div>
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
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-1 text-xs md:text-sm">
            {DATA_SOURCES.map((source) => (
              <li key={source.link}>
                <a
                  href={source.link}
                  target="_blank"
                  rel="noopener"
                  data-umami-event="outbound"
                  data-umami-event-destination="credit"
                  className="text-accent transition-all hover:text-white"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ACKNOWLEDGMENTS */}
        <div className="w-[195px] space-y-3 md:w-[215px]">
          <h1 className="text-center text-lg font-semibold md:text-xl">{m.acknowledgments}</h1>
          <div className="h-px w-full bg-white/10"></div>
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
        <div className="w-[195px] space-y-3 md:w-[215px]">
          <h1 className="text-center text-lg font-semibold md:text-xl">{m.specialThanks}</h1>
          <div className="h-px w-full bg-white/10"></div>
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
    </div>
  );
};

export default Credits;
