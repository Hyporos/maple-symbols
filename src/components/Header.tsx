import { Dispatch, SetStateAction, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Tooltip, TooltipTrigger, TooltipContent } from "./Tooltip";
import { FaGlobeAmericas } from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";
import { cn } from "../lib/utils";
import ConditionalWrapper from "./ConditionalWrapper";

interface Props {
  selectedPage: number;
  setSelectedPage: Dispatch<SetStateAction<number>>;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Header component is the top most component of the page which includes navigation and language buttons.
// * On mobile devices, you can click the menu button on the top right to view all available options.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Header = ({ selectedPage, setSelectedPage }: Props) => {
  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });
  const isTablet = useMediaQuery({ query: `(max-width: 1149px)` });

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="bg-gradient-to-t from-card to-card-grad p-1.5 md:p-3 px-4 md:px-8 mb-16">
      <div
        className={cn(
          "flex flex-col transition-height overflow-hidden h-[55px]",
          menuOpen && isMobile && "h-[110px]"
        )}
      >
        <div className="flex justify-between items-center mx-auto w-full max-w-[1125px] my-2.5 md:my-auto">
          <div
            className={cn("cursor-pointer", !isTablet && "w-1/3")}
            onClick={() => setSelectedPage(1)}
          >
            {!isMobile ? (
              <img src="/main/logo-lg.webp" width={175} />
            ) : (
              <img src="/main/logo-sm.webp" width={45} />
            )}
          </div>

          <ConditionalWrapper
            condition={isTablet}
            wrapper={(children) => (
              <div className={cn("flex gap-10", isMobile && "gap-8")}>
                {children}
              </div>
            )}
          >
            {!isMobile ? (
              <nav className={cn("flex gap-14", !isTablet && "w-1/3")}>
                <button
                  className={cn(
                    "hover:text-white transition-all w-1/3",
                    selectedPage === 1 && "text-white"
                  )}
                  onClick={() => setSelectedPage(1)}
                >
                  Calculator
                </button>
                <button
                  className={cn(
                    "hover:text-white transition-all w-1/3",
                    selectedPage === 2 && "text-white"
                  )}
                  onClick={() => setSelectedPage(2)}
                >
                  Handbook
                </button>
                <button
                  className={cn(
                    "hover:text-white transition-all w-1/3",
                    selectedPage === 3 && "text-white"
                  )}
                  onClick={() => setSelectedPage(3)}
                >
                  Extras
                </button>
              </nav>
            ) : (
              <button onClick={() => setMenuOpen(!menuOpen)}>
                <HiOutlineMenu
                  size={35}
                  className={cn(
                    "hover:stroke-white transition-all",
                    menuOpen && "stroke-white"
                  )}
                />
              </button>
            )}

            {isTablet && (
              <div
                className={cn(
                  "w-px bg-white/10 h-[40px]",
                  isMobile && "hidden"
                )}
              ></div>
            )}

            <div
              className={cn(
                "flex justify-end",
                !isTablet && "w-1/3",
                isMobile && "hidden"
              )}
            >
              <Tooltip placement="bottom">
                <TooltipTrigger tabIndex={-1}>
                  <button
                    className={cn(
                      "flex justify-center items-center gap-3 bg-dark h-[40px] w-[80px] group cursor-default",
                      isMobile && "h-[45px] w-[45px]"
                    )}
                  >
                    {!isMobile && (
                      <FaGlobeAmericas size={23} className="fill-basic/75" />
                    )}
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
        {isMobile && (
          <>
            <div className="w-full h-px bg-white/10 my-2" />
            <div className="flex justify-around items-center my-auto text-sm">
              <p
                className={cn(
                  "hover:text-white cursor-pointer transition-all",
                  selectedPage === 1 && "text-white"
                )}
                onClick={() => setSelectedPage(1)}
              >
                Calculator
              </p>
              <p
                className={cn(
                  "hover:text-white cursor-pointer transition-all",
                  selectedPage === 2 && "text-white"
                )}
                onClick={() => setSelectedPage(2)}
              >
                Handbook
              </p>
              <p
                className={cn(
                  "hover:text-white cursor-pointer transition-all",
                  selectedPage === 3 && "text-white"
                )}
                onClick={() => setSelectedPage(3)}
              >
                Extras
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Header;
