import CreditText from "../CreditText";
import { interpolate, useMessages } from "../../i18n";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Credits component will display all acknowledgments to resources, users, and communities.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Credits = () => {
  const m = useMessages().extras;

  return (
    <div className="mx-12 flex h-[555px] py-10">
      <div className="flex w-full flex-col items-center justify-around space-y-12">
        {/* RESOURCES */}
        <div className="w-[195px] space-y-3 md:w-[215px]">
          <h1 className="text-center text-lg font-semibold md:text-xl">{m.resourcesUsed}</h1>
          <div className="h-px w-full bg-white/10"></div>
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
