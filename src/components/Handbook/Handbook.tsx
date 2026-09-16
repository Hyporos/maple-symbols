import TabLayout from "../ui/TabLayout";
import ExpTable from "./ExpTable";
import CostTable from "./CostTable";
import RatioTable from "./RatioTable";
import { track } from "../../lib/analytics";

/** Analytics names for the tabs, in tab order (docs/ANALYTICS.md §3, handbook_tab). */
const TAB_EVENTS = ["exp", "cost", "ratio"] as const;

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Handbook component acts as a page for the Experience, Meso Cost, and Damage Ratio Tables.
// * Navigate through both using the buttons provided at the top of the container.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const Handbook = () => (
  <TabLayout
    tabs={[
      { label: "Experience Table", mobileLabel: "Exp Table", content: <ExpTable /> },
      { label: "Meso Cost Table", mobileLabel: "Cost Table", content: <CostTable /> },
      { label: "Damage Ratio Table", mobileLabel: "Dmg Table", content: <RatioTable /> },
    ]}
    onSelect={(index) => {
      const tab = TAB_EVENTS[index - 1];
      if (tab) track("handbook_tab", { tab });
    }}
  />
);

export default Handbook;
