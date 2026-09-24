import { useState } from "react";
import { HiOutlineChartBar, HiOutlinePencilSquare, HiOutlineTableCells } from "react-icons/hi2";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useMessages } from "../../i18n";
import CalculatorCard from "../calculator/CalculatorCard";
import GraphCard from "../calculator/GraphCard";
import OverviewCard from "../calculator/OverviewCard";
import SymbolPicker from "../calculator/SymbolPicker";
import { BottomTabBar } from "../ui";

type Section = "edit" | "overview" | "graph";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * CalculatorPage is the /next redesign's calculator page (spec §3). From 768 px: two columns, the
// * picker and calculator (sticky from 1150 px) beside the overview and graph. On phones: one card
// * set per screen behind a bottom tab bar, all three kept in the page with the others hidden
// * (NextShell pads the page's foot for the bar; NextApp tells it this page has one).
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const CalculatorPage = () => {
  const m = useMessages().next.calculator;
  const { isMobile } = useBreakpoint();
  // Local on purpose: the phone tab resets to Edit on reload.
  const [section, setSection] = useState<Section>("edit");

  if (!isMobile) {
    return (
      <div className="grid gap-6 pt-8 min-[768px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-[1150px]:grid-cols-[400px_1fr]">
        <div className="flex flex-col gap-6 min-[1150px]:sticky min-[1150px]:top-24 min-[1150px]:self-start">
          <SymbolPicker />
          <CalculatorCard />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <OverviewCard />
          <GraphCard />
        </div>
      </div>
    );
  }

  // One screen per tab; the inactive ones stay in the page, hidden.
  const panelProps = (value: Section) => ({
    role: "tabpanel",
    id: `calc-panel-${value}`,
    "aria-labelledby": `calc-tab-${value}`,
    hidden: section !== value,
  });

  return (
    <div className="pt-4">
      <div {...panelProps("edit")}>
        <div className="flex flex-col gap-4">
          <SymbolPicker />
          <CalculatorCard />
        </div>
      </div>
      <div {...panelProps("overview")}>
        <OverviewCard />
      </div>
      <div {...panelProps("graph")}>
        <GraphCard />
      </div>
      <BottomTabBar
        label={m.sections}
        idPrefix="calc"
        value={section}
        onChange={setSection}
        tabs={[
          { value: "edit", label: m.tabEdit, icon: <HiOutlinePencilSquare size={20} /> },
          { value: "overview", label: m.tabOverview, icon: <HiOutlineTableCells size={20} /> },
          { value: "graph", label: m.tabGraph, icon: <HiOutlineChartBar size={20} /> },
        ]}
      />
    </div>
  );
};

export default CalculatorPage;
