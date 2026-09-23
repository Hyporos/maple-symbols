import { useState } from "react";
import { useMessages } from "../../i18n";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { Card, Tabs } from "../ui";
import ExpPanel from "../handbook/ExpPanel";
import CostPanel from "../handbook/CostPanel";
import RatioPanel from "../handbook/RatioPanel";

type HandbookTab = "exp" | "cost" | "ratio";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * HandbookPage is the /next redesign's handbook page (spec §3): one Card with Tabs for the
// * Experience, Meso cost and Damage ratio panels, each with its own Arcane/Sacred/Grand switch.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const HandbookPage = () => {
  const messages = useMessages();
  const { isMobile } = useBreakpoint();
  const [tab, setTab] = useState<HandbookTab>("exp");

  const tabs = [
    {
      value: "exp" as const,
      label: isMobile ? messages.handbook.tabs.exp.mobileLabel : messages.handbook.tabs.exp.label,
    },
    {
      value: "cost" as const,
      label: isMobile ? messages.handbook.tabs.cost.mobileLabel : messages.handbook.tabs.cost.label,
    },
    {
      value: "ratio" as const,
      label: isMobile
        ? messages.handbook.tabs.ratio.mobileLabel
        : messages.handbook.tabs.ratio.label,
    },
  ];

  return (
    <Card label={messages.next.handbook.label} as="section" className="mx-auto mt-8 max-w-[860px]">
      <Tabs
        label={messages.next.handbook.label}
        idPrefix="hb"
        tabs={tabs}
        value={tab}
        onChange={setTab}
      />
      <div
        role="tabpanel"
        id={`hb-panel-${tab}`}
        aria-labelledby={`hb-tab-${tab}`}
        className="pt-5"
      >
        {tab === "exp" && <ExpPanel />}
        {tab === "cost" && <CostPanel />}
        {tab === "ratio" && <RatioPanel />}
      </div>
    </Card>
  );
};

export default HandbookPage;
