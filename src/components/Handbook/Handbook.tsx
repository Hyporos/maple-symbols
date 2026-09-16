import TabLayout from "../ui/TabLayout";
import ExpTable from "./ExpTable";
import CostTable from "./CostTable";
import RatioTable from "./RatioTable";
import { track } from "../../lib/analytics";
import { useMessages } from "../../i18n";

/** Analytics names for the tabs, in tab order (docs/ANALYTICS.md §3, handbook_tab). */
const TAB_EVENTS = ["exp", "cost", "ratio"] as const;

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Handbook component acts as a page for the Experience, Meso Cost, and Damage Ratio Tables.
// * Navigate through both using the buttons provided at the top of the container.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Handbook = () => {
  const m = useMessages().handbook;

  return (
    <TabLayout
      tabs={[
        { ...m.tabs.exp, content: <ExpTable /> },
        { ...m.tabs.cost, content: <CostTable /> },
        { ...m.tabs.ratio, content: <RatioTable /> },
      ]}
      onSelect={(index) => {
        const tab = TAB_EVENTS[index - 1];
        if (tab) track("handbook_tab", { tab });
      }}
    />
  );
};

export default Handbook;
