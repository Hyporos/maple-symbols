import { Dispatch, SetStateAction } from "react";
import { useMediaQuery } from "react-responsive";
import { Tooltip, TooltipTrigger, TooltipContent } from "./Tooltip";
import { FaGlobeAmericas, FaBars } from "react-icons/fa";
import { cn } from "../lib/utils";
import ConditionalWrapper from "./ConditionalWrapper";

interface Props {
  selectedPage: number;
  setSelectedPage: Dispatch<SetStateAction<number>>;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Footer component is the top most component of the page which includes navigation and language buttons.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Header = ({ selectedPage, setSelectedPage }: Props) => {
  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });
  const isTablet = useMediaQuery({ query: `(max-width: 1149px)` });

  return (
    <section className={cn("flex-col bg-gradient-to-t from-card to-card-grad p-3 mb-16", !isMobile && "px-8")}>
      <div className="flex justify-between items-center mx-auto max-w-[1125px] h-[55px] ">
        <div className={cn(!isTablet && "w-1/3")}>
          {!isMobile ? (
            <img src="/main/logo-lg.webp" width={175} />
          ) : (
            <img src="/main/logo-sm.webp" width={50} />
          )}
        </div>

        <ConditionalWrapper
          condition={isTablet}
          wrapper={(children) => <div className={cn("flex gap-10", isMobile && "gap-8")}>{children}</div>}
        >
          {isMobile ? (
            <nav
              className={cn("flex gap-14", !isTablet && "w-1/3")}
            >
              <button
                className={cn(
                  "hover:text-white  transition-all w-1/3",
                  selectedPage === 1 && "text-white"
                )}
                onClick={() => setSelectedPage(1)}
              >
                Calculator
              </button>
              <button
                className={cn(
                  "hover:text-white  transition-all w-1/3",
                  selectedPage === 2 && "text-white"
                )}
                onClick={() => setSelectedPage(2)}
              >
                Handbook
              </button>
              <button
                className={cn(
                  "hover:text-white  transition-all w-1/3",
                  selectedPage === 3 && "text-white"
                )}
                onClick={() => setSelectedPage(3)}
              >
                Extras
              </button>
            </nav>
          ) : (
            <button className="flex justify-center items-center gap-3 bg-dark h-[45px] w-[45px] group cursor-default">
            <FaBars size={23} className="fill-basic/75" />
          </button>
          )}

          {isTablet && <div className={cn("w-px bg-white/10 h-[40px]", isMobile && "hidden")}></div>}

          <div className={cn("flex justify-end", !isTablet && "w-1/3", isMobile && "hidden")}>
            <Tooltip placement="bottom">
              <TooltipTrigger>
                <button className={cn("flex justify-center items-center gap-3 bg-dark h-[40px] w-[80px] group cursor-default", isMobile && "h-[45px] w-[45px]")}>
                  {!isMobile && <FaGlobeAmericas size={23} className="fill-basic/75" />}
                  <p>EN</p>
                </button>
              </TooltipTrigger>
              <TooltipContent className="tooltip">
                <span>[Coming Soon]</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </ConditionalWrapper>
      </div>
    </section>
  );
};

export default Header;
