import { useId, useState, type MouseEvent } from "react";
import { HiOutlineBars3 } from "react-icons/hi2";
import { cn } from "../../lib/utils";
import { useRouter } from "../../contexts/RouterContext";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { NAV } from "../../lib/routes";
import { useMessages } from "../../i18n";
import { nextHref, useNextRoute } from "../routing";
import CharacterChip from "./CharacterChip";
import AccessibilityButton from "./AccessibilityButton";
import NextServerMenu from "./NextServerMenu";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * NextHeader is the /next redesign's header (spec §3): the logo, the page nav, and the
// * character/server/accessibility places. Links stay inside /next in the current edition
// * (`nextHref`); on phones the server menu and "Aa" move into the ☰ menu and the character
// * chip stays put.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const NextHeader = () => {
  const messages = useMessages();
  const m = messages.shell;
  const { isMobile } = useBreakpoint();
  const { navigate } = useRouter();
  const { edition, path } = useNextRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  const home = nextHref("/", edition);

  const navLabel = (page: (typeof NAV)[number]) => {
    const copy = messages.pages[page.page];
    return "nav" in copy ? copy.nav : page.label;
  };

  const isActive = (page: (typeof NAV)[number]) =>
    path === page.path || (page.activeFor as readonly string[]).includes(path);

  const handleNav = (e: MouseEvent<HTMLAnchorElement>, to: string) => {
    e.preventDefault();
    navigate(to);
    setMenuOpen(false);
  };

  const navLink = (page: (typeof NAV)[number], className: string) => {
    const href = nextHref(page.path, edition);
    return (
      <a
        key={page.path}
        href={href}
        aria-current={isActive(page) ? "page" : undefined}
        onClick={(e) => handleNav(e, href)}
        className={className}
      >
        {navLabel(page)}
      </a>
    );
  };

  return (
    <header className="border-b border-white/6 bg-linear-to-t from-card to-card-grad">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-8">
        <a
          href={home}
          onClick={(e) => handleNav(e, home)}
          className="shrink-0 text-lg font-semibold text-primary"
        >
          Maple <span>Symbols</span>
        </a>

        {!isMobile && (
          <nav className="flex items-center gap-8">
            {NAV.map((page) =>
              navLink(
                page,
                cn(
                  "text-sm transition-colors motion-reduce:transition-none hover:text-primary",
                  isActive(page) ? "text-primary" : "text-secondary"
                )
              )
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <CharacterChip />
          {!isMobile && (
            <>
              <NextServerMenu />
              <AccessibilityButton />
            </>
          )}
          {isMobile && (
            <button
              type="button"
              aria-label={menuOpen ? m.closeMenu : m.openMenu}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center rounded-lg p-2 text-secondary transition-colors hover:text-primary motion-reduce:transition-none"
            >
              <HiOutlineBars3 size={22} />
            </button>
          )}
        </div>
      </div>

      {isMobile && menuOpen && (
        <div id={menuId} className="border-t border-white/6 px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {NAV.map((page) =>
              navLink(
                page,
                cn(
                  "rounded-lg px-2 py-2 text-sm transition-colors motion-reduce:transition-none hover:text-primary",
                  isActive(page) ? "text-primary" : "text-secondary"
                )
              )
            )}
          </nav>
          <div className="flex items-center gap-3 pt-3">
            <NextServerMenu />
            <AccessibilityButton />
          </div>
        </div>
      )}
    </header>
  );
};

export default NextHeader;
