import type { ReactNode } from "react";
import SuggestionBanner from "../../components/SuggestionBanner";
import NextHeader from "./NextHeader";
import NextFooter from "./NextFooter";
import FeedbackButton from "./FeedbackButton";

interface NextShellProps {
  children: ReactNode;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * NextShell is the /next redesign's page frame: header, the server suggestion banner, the
// * page itself, the floating feedback button, and the footer (spec §3).
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const NextShell = ({ children }: NextShellProps) => (
  <div className="flex min-h-screen flex-col">
    <NextHeader />
    <SuggestionBanner />
    <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-24 md:px-8 md:pb-16">
      {children}
    </main>
    <FeedbackButton />
    <NextFooter />
  </div>
);

export default NextShell;
