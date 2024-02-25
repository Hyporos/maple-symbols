import { FaYoutube, FaTwitch, FaXTwitter  } from "react-icons/fa6";

const Credits = () => {
  return (
    <div className={"flex py-10 mx-12"}>
      <div className={"bg-dark h-[515px] w-[10px] mr-10"}></div>
      
      <div className="flex flex-col w-full justify-around space-y-12">
        {/* RESOURCES */}
        <div className="space-y-3">
          <h1 className="text-xl font-semibold">Resources Used</h1>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <img src="/credits/maplestory-fandom.webp" width={18} />
              <a
                href="https://maplestory.fandom.com/"
                target="_blank"
                className="text-accent hover:text-white transition-all text-sm"
              >
                https://maplestory.fandom.com/
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <img src="/credits/strategy-wiki.webp" width={18} />
              <a
                href="https://strategywiki.org/wiki/MapleStory"
                target="_blank"
                className="text-accent hover:text-white transition-all text-sm"
              >
                https://strategywiki.org/wiki/MapleStory
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <img src="/credits/orange-mushroom.webp" width={18} />
              <a
                href="https://orangemushroom.net/"
                target="_blank"
                className="text-accent hover:text-white transition-all text-sm"
              >
                https://orangemushroom.net/
              </a>
            </div>
          </div>
        </div>

        {/* ACKNOWLEDGMENTS */}
        <div className="space-y-3">
          <h1 className="text-xl font-semibold">Acknowledgments</h1>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <img src="/credits/scardor.webp" width={18} />
              <p className="text-sm">Scardor</p>
              <a href="https://www.twitch.tv/scardor" target="_blank">
                <FaTwitch className="hover:fill-[#6441a5] transition-all" />
              </a>
              <a
                href="https://www.youtube.com/user/zottenkerel"
                target="_blank"
              >
                <FaYoutube className="hover:fill-[#e00000] transition-all" />
              </a>
              <a href="https://twitter.com/scardorgaming" target="_blank">
                <FaXTwitter className="hover:fill-white transition-all" />
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <img src="/credits/gradedpeanut.webp" width={18} />
              <p className="text-sm">GradedPeanut</p>
              <a href="https://www.twitch.tv/gradedpeanut" target="_blank">
                <FaTwitch className="hover:fill-[#6441a5] transition-all" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCvNoLyymLPSosJpOsX0SOqg"
                target="_blank"
              >
                <FaYoutube className="hover:fill-[#e00000] transition-all" />
              </a>
            </div>
          </div>
        </div>

        {/* SPECIAL THANKS */}
        <div className="space-y-3">
          <h1 className="text-xl font-semibold">Special Thanks</h1>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <img src="/credits/saku.webp" width={18} />
              <p className="text-sm">Members of Saku, a Kronos guild</p>
            </div>
            <div className="flex items-center space-x-2">
            <img src="/credits/shark-tank.webp" width={18} />
              <p className="text-sm">
                Members of Shark Tank, a Thunder Breaker community
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;
