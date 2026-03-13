import { ReactNode, useState } from "react";
import SlideButton from "./SlideButton";
import { useBreakpoint } from "../../hooks/useBreakpoint";

interface Tab {
  /** Full label used on desktop. */
  label: string;
  /** Shorter label used on mobile — falls back to `label` if omitted. */
  mobileLabel?: string;
  content: ReactNode;
}

interface TabLayoutProps {
  tabs: Tab[];
  /** Override the active tab index (1-based). When provided the component is
   * controlled and internal state is ignored. */
  activeTab?: number;
  /** Called with the new 1-based tab index whenever the user clicks a tab.
   * Only used when `activeTab` is provided. */
  onTabChange?: (index: number) => void;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * TabLayout is the shared page wrapper used by Handbook and Extras.
// * It renders the outer card container, the slide-button nav bar, and the
// * selected tab's content.  Navigation state lives entirely inside this component.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const TabLayout = ({ tabs, activeTab, onTabChange }: TabLayoutProps) => {
  const [internalTab, setInternalTab] = useState(1);
  const { isMobile } = useBreakpoint();

  const selectedTab = activeTab ?? internalTab;
  const setSelectedTab = onTabChange ?? setInternalTab;

  return (
    <section className="mx-4 flex justify-center md:mx-8">
      <div className="h-[650px] w-[360px] max-w-[800px] rounded-lg bg-gradient-to-t from-card-tool to-card-grad py-8 md:h-[700px] md:w-full md:py-10">
        {/* NAVBAR */}
        <nav className="flex bg-dark text-center shadow-input transition-all">
          {tabs.map((tab, index) => (
            <SlideButton
              key={tab.label}
              label={isMobile && tab.mobileLabel ? tab.mobileLabel : tab.label}
              selectedInfo={selectedTab}
              setSelectedInfo={setSelectedTab}
              targetInfo={index + 1}
            />
          ))}
        </nav>

        {/* CONTENT */}
        {tabs[selectedTab - 1]?.content}
      </div>
    </section>
  );
};

export default TabLayout;
