import { useEffect, type ReactNode } from "react";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { pageMetaFor } from "../../lib/routes";
import { cn } from "../../lib/utils";
import { useNextRoute } from "../routing";
import NextHeader from "./NextHeader";
import NextFooter from "./NextFooter";
import FeedbackButton from "./FeedbackButton";
import NextSuggestionBanner from "./NextSuggestionBanner";
import { useFeedbackInHeader } from "./useFeedbackInHeader";

interface NextShellProps {
  children: ReactNode;
  /** The page shows a fixed BottomTabBar on phones, so the foot of the page must clear it. */
  bottomBar?: boolean;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * NextShell is the /next redesign's page frame: the sticky header, the server suggestion banner
// * (in the page's flow under the header, so it pushes the page down rather than covering the
// * first card, and scrolls away with it), the page itself, the feedback button where it floats
// * (from 1256 px; NextHeader holds it below that), and the footer (spec §3).
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const NextShell = ({ children, bottomBar = false }: NextShellProps) => {
  const { path, edition } = useNextRoute();
  const { isMobile } = useBreakpoint();
  const feedbackInHeader = useFeedbackInHeader();

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
      </div>
      <NextSuggestionBanner />
      <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-16 md:px-8">
        {children}
      </main>
      {/* Below the floating width it is a header chip instead (NextHeader). */}
      {!feedbackInHeader && <FeedbackButton placement="floating" />}
      <NextFooter />
    </div>
  );
};

export default NextShell;
