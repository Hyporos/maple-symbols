import { useEffect, type ReactNode } from "react";
import SuggestionBanner from "../../components/SuggestionBanner";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { pageMetaFor } from "../../lib/routes";
import { cn } from "../../lib/utils";
import { useNextRoute } from "../routing";
import NextHeader from "./NextHeader";
import NextFooter from "./NextFooter";
import FeedbackButton from "./FeedbackButton";

interface NextShellProps {
  children: ReactNode;
  /** The page shows a fixed BottomTabBar on phones, so the foot of the page must clear it. */
  bottomBar?: boolean;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * NextShell is the /next redesign's page frame: header, the server suggestion banner, the
// * page itself, the floating feedback button, and the footer (spec §3).
// * The header and banner share a sticky wrapper rather than the header being sticky on its
// * own: the banner is absolutely positioned and contributes no height, so a plain wrapper
// * around them both would be exactly the header's height, and a sticky header nested inside
// * a parent that short loses its stick range almost immediately (its parent's bottom edge
// * scrolls past the viewport top right after the header's own height does). Making the
// * wrapper itself the sticky element gives it the rest of the page as its range (its own
// * parent is the full-height column below), and — since sticky is a positioned value —
// * it also becomes the banner's containing block, so `top-full` docks the banner right under
// * the header instead of at the page's own bottom.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const NextShell = ({ children, bottomBar = false }: NextShellProps) => {
  const { path, edition } = useNextRoute();
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    document.title = pageMetaFor(path, edition).title;
  }, [path, edition]);

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        // The bar is 57 px (py-2, a 20 px icon, gap-1, a text-xs line, a 1 px border) plus the
        // safe area it pads itself with; the footer ends right above it at max scroll.
        bottomBar && isMobile && "pb-[calc(57px+env(safe-area-inset-bottom))]"
      )}
    >
      <div className="sticky top-0 z-30">
        <NextHeader />
        <SuggestionBanner />
      </div>
      <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-16 md:px-8">
        {children}
      </main>
      <FeedbackButton />
      <NextFooter />
    </div>
  );
};

export default NextShell;
