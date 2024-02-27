import CreditText from "../CreditText";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Credits component will display all acknowledgments to resources, users, and communities.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Credits = () => {
  return (
    <div className="flex py-10 mx-12 h-[596px]">
      <div className="flex flex-col w-full justify-around items-center space-y-12">
        {/* RESOURCES */}
        <div className="w-[215px] space-y-3">
          <h1 className="text-xl font-semibold text-center">Resources Used</h1>
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
        <div className="w-[215px] space-y-3">
          <h1 className="text-xl font-semibold text-center">Acknowledgments</h1>
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
        <div className="w-[215px] space-y-3">
          <h1 className="text-xl font-semibold text-center">Special Thanks</h1>
          <div className="h-px w-full bg-white/10"></div>
          <div className="space-y-2">
            <CreditText label="Members of Saku" img="/credits/saku.webp" />
            <CreditText
              label="Members of Shark Tank"
              img="/credits/shark-tank.webp"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;
