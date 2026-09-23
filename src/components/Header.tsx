import { useState } from "react";
import { HiOutlineMenu } from "react-icons/hi";
import ServerMenu from "./ServerMenu";
import SuggestionBanner from "./SuggestionBanner";
import { cn } from "../lib/utils";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useRouter } from "../contexts/RouterContext";
import { useEdition } from "../hooks/useEdition";
import { hrefFor, NAV } from "../lib/routes";
import { useMessages } from "../i18n";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Header component is the top most component of the page which includes navigation and the server menu.
// * Links stay inside the current edition (/kms/handbook on KMS); the server menu moves between editions.
// * On mobile devices, you can click the menu button on the top right to view all available options.
// * The server suggestion bar hangs below it, in its bottom margin (SuggestionBanner).
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Header = () => {
  const messages = useMessages();
  const m = messages.shell;
  const navLabel = (page: (typeof NAV)[number]) => {
    const copy = messages.pages[page.page];
    return "nav" in copy ? copy.nav : page.label;
  };
  const { isMobile, isTablet } = useBreakpoint();
  const { navigate } = useRouter();
  const { edition, path: pathname } = useEdition();
  const home = hrefFor("/", edition);
  const hrefOf = (page: (typeof NAV)[number]) => hrefFor(page.path, edition);

  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    e.preventDefault();
    navigate(to);
  };

  const isActive = (page: (typeof NAV)[number]) =>
    pathname === page.path || (page.activeFor as readonly string[]).includes(pathname);

  return (
    <section className="relative mb-16 bg-linear-to-t from-card to-card-grad p-1.5 px-4 md:p-3 md:px-8">
      <div
        className={cn(
          "flex h-[55px] flex-col overflow-hidden transition-height",
          menuOpen && isMobile && "h-[110px]"
        )}
      >
        <div className="mx-auto my-2.5 flex w-full max-w-[1125px] items-center justify-between md:my-auto">
          <div className={cn(!isTablet && "w-1/3")}>
            {!isMobile ? (
              <a href={home} aria-label={m.goToCalculator} onClick={(e) => handleNav(e, home)}>
                <img
                  src="/main/logo-lg.webp"
                  alt="Maple Symbols"
                  className="cursor-pointer"
                  width={180}
                  height={48}
                />
              </a>
            ) : (
              <a href={home} aria-label={m.goToCalculator} onClick={(e) => handleNav(e, home)}>
                <img
                  src="/main/logo-sm.webp"
                  alt="Maple Symbols"
                  className="cursor-pointer"
                  width={48}
                  height={48}
                />
              </a>
            )}
          </div>

          {isTablet ? (
            <div className={cn("flex gap-10", isMobile && "gap-8")}>
              {!isMobile ? (
                <nav className="flex gap-14">
                  {NAV.map((page) => (
                    <a
                      key={page.path}
                      href={hrefOf(page)}
                      onClick={(e) => handleNav(e, hrefOf(page))}
                      className={cn(
                        "transition-all hover:text-white",
                        isActive(page) && "text-white"
                      )}
                    >
                      {navLabel(page)}
                    </a>
                  ))}
                </nav>
              ) : (
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label={menuOpen ? m.closeMenu : m.openMenu}
                >
                  <HiOutlineMenu
                    size={35}
                    className={cn("transition-all hover:stroke-white", menuOpen && "stroke-white")}
                  />
                </button>
              )}

              <div className={cn("h-[40px] w-px bg-white/10", isMobile && "hidden")}></div>

              <div className="flex justify-end">
                <ServerMenu compact={isMobile} />
              </div>
            </div>
          ) : (
            <>
              <nav className="flex w-1/3 justify-center gap-14">
                {NAV.map((page) => (
                  <a
                    key={page.path}
                    href={hrefOf(page)}
                    onClick={(e) => handleNav(e, hrefOf(page))}
                    className={cn(
                      "transition-all hover:text-white",
                      isActive(page) && "text-white"
                    )}
                  >
                    {navLabel(page)}
                  </a>
                ))}
              </nav>

              <div className="flex w-1/3 justify-end">
                <ServerMenu />
              </div>
            </>
          )}
        </div>
        {isMobile && (
          <>
            <div className="my-2 h-px w-full bg-white/10" />
            <div className="my-auto flex items-center justify-around text-sm">
              {NAV.map((page) => (
                <a
                  key={page.path}
                  href={hrefOf(page)}
                  className={cn("transition-all hover:text-white", isActive(page) && "text-white")}
                  onClick={(e) => {
                    handleNav(e, hrefOf(page));
                    setMenuOpen(false);
                  }}
                >
                  {navLabel(page)}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
      <SuggestionBanner />
    </section>
  );
};

export default Header;
