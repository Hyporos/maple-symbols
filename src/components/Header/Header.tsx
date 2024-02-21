import { Dispatch, SetStateAction } from "react";
import { FaDiscord, FaGithub, FaPaypal } from "react-icons/fa6";

import { cn } from "../../lib/utils";
import "./Header.css";

interface Props {
  selectedPage: number;
  setSelectedPage: Dispatch<SetStateAction<number>>;
}

const Header = ({ selectedPage, setSelectedPage }: Props) => {
  return (
    <section className="header">
      <div className="flex justify-between items-center mx-auto max-w-[1050px]">
        <div className="flex gap-20">
          <div className="cursor-pointer" onClick={() => setSelectedPage(1)}>
            <img src="/main/favicon.png" width={50} />
          </div>
          <nav className="flex gap-12">
            <button className={cn("hover:text-white transition-all", selectedPage === 1 && "text-white")} onClick={() => setSelectedPage(1)}>
              Calculator
            </button>
            <button className={cn("hover:text-white transition-all", selectedPage === 2 && "text-white")} onClick={() => setSelectedPage(2)}>
              Handbook
            </button>
            <button className={cn("hover:text-white transition-all", selectedPage === 3 && "text-white")} onClick={() => setSelectedPage(3)}>
            Miscellaneous
            </button>
          </nav>
        </div>
        <div className="flex space-x-6">
          <a href="https://discord.gg/FTMgy2ZKPK" target="_blank" className="">
            <FaDiscord
              size={25}
              className="hover:scale-110 hover:fill-[#7289DA] transition-all"
            />
          </a>
          <a
            href="https://github.com/Hyporos/maple-symbols"
            target="_blank"
            className=""
          >
            <FaGithub
              size={25}
              className="hover:scale-110 hover:fill-[#B18BD0] transition-all"
            />
          </a>
          <a href="https://www.paypal.com/donate/?hosted_button_id=RL3T3LA3QNVTU" target="_blank" className="">
            <FaPaypal
              size={25}
              className="hover:scale-110 hover:fill-[#009CDE] transition-all"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Header;
