import { useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./Tooltip";
import { FaEarthAmericas } from "react-icons/fa6";
import { HiOutlineMenu } from "react-icons/hi";
import { cn } from "../lib/utils";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useRouter } from "../contexts/RouterContext";

const PAGES = [
  { path: "/", label: "Calculator" },
  { path: "/handbook", label: "Handbook" },
  { path: "/changelog", label: "Extras", activeFor: ["/changelog", "/credits"] as string[] },
];

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Header component is the top most component of the page which includes navigation and language buttons.
// * On mobile devices, you can click the menu button on the top right to view all available options.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Header = () => {
  const { isMobile, isTablet } = useBreakpoint();
  const { path: pathname, navigate } = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    e.preventDefault();
    navigate(to);
  };

  const isActive = (page: (typeof PAGES)[number]) =>
    pathname === page.path || page.activeFor?.includes(pathname) === true;

  return (
    <section className="mb-16 bg-gradient-to-t from-card to-card-grad p-1.5 px-4 md:p-3 md:px-8">
      <div
        className={cn(
          "flex h-[55px] flex-col overflow-hidden transition-height",
          menuOpen && isMobile && "h-[110px]"
        )}
      >
        <div className="mx-auto my-2.5 flex w-full max-w-[1125px] items-center justify-between md:my-auto">
          <div className={cn(!isTablet && "w-1/3")}>
            {!isMobile ? (
              <a href="/" aria-label="Go to calculator" onClick={(e) => handleNav(e, "/")}>
                <img src="/main/logo-lg.webp" className="cursor-pointer" width={180} />
              </a>
            ) : (
              <a href="/" aria-label="Go to calculator" onClick={(e) => handleNav(e, "/")}>
                <img src="/main/logo-sm.webp" className="cursor-pointer" width={48} />
              </a>
            )}
          </div>

          {isTablet ? (
            <div className={cn("flex gap-10", isMobile && "gap-8")}>
              {!isMobile ? (
                <nav className="flex gap-14">
                  {PAGES.map((page) => (
                    <a
                      key={page.path}
                      href={page.path}
                      onClick={(e) => handleNav(e, page.path)}
                      className={cn(
                        "transition-all hover:text-white",
                        isActive(page) && "text-white"
                      )}
                    >
                      {page.label}
                    </a>
                  ))}
                </nav>
              ) : (
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                >
                  <HiOutlineMenu
                    size={35}
                    className={cn("transition-all hover:stroke-white", menuOpen && "stroke-white")}
                  />
                </button>
              )}

              <div className={cn("h-[40px] w-px bg-white/10", isMobile && "hidden")}></div>

              <div className={cn("flex justify-end", isMobile && "hidden")}>
                <Tooltip placement="bottom">
                  <TooltipTrigger tabIndex={-1}>
                    <button
                      aria-label="Language selector (coming soon)"
                      className={cn(
                        "group flex h-[40px] w-[80px] cursor-default items-center justify-center gap-3 bg-dark",
                        isMobile && "h-[45px] w-[45px]"
                      )}
                    >
                      {!isMobile && <FaEarthAmericas size={23} className="fill-basic/75" />}
                      <p>EN</p>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="tooltip">
                    <span>[Coming Soon]</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ) : (
            <>
              <nav className="flex w-1/3 justify-center gap-14">
                {PAGES.map((page) => (
                  <a
                    key={page.path}
                    href={page.path}
                    onClick={(e) => handleNav(e, page.path)}
                    className={cn(
                      "transition-all hover:text-white",
                      isActive(page) && "text-white"
                    )}
                  >
                    {page.label}
                  </a>
                ))}
              </nav>

              <div className="flex w-1/3 justify-end">
                <Tooltip placement="bottom">
                  <TooltipTrigger tabIndex={-1}>
                    <button
                      aria-label="Language selector (coming soon)"
                      className="group flex h-[40px] w-[80px] cursor-default items-center justify-center gap-3 bg-dark"
                    >
                      <FaEarthAmericas size={23} className="fill-basic/75" />
                      <p>EN</p>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="tooltip">
                    <span>[Coming Soon]</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            </>
          )}
        </div>
        {isMobile && (
          <>
            <div className="my-2 h-px w-full bg-white/10" />
            <div className="my-auto flex items-center justify-around text-sm">
              {PAGES.map((page) => (
                <a
                  key={page.path}
                  href={page.path}
                  className={cn("transition-all hover:text-white", isActive(page) && "text-white")}
                  onClick={(e) => {
                    handleNav(e, page.path);
                    setMenuOpen(false);
                  }}
                >
                  {page.label}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Header;
