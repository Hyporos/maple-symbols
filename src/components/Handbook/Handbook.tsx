import TabLayout from "../ui/TabLayout";
import ExpTable from "./ExpTable";
import CostTable from "./CostTable";
import RatioTable from "./RatioTable";

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
  />
);

export default Handbook;
