import TabLayout from "../ui/TabLayout";
import Changelog from "./Changelog";
import Credits from "./Credits";
import { useRouter } from "../../contexts/RouterContext";
import { EXTRAS_TABS } from "../../lib/routes";
import { track } from "../../lib/analytics";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * The Extras component acts as a page for the Changelog and Credits components.
// * Tab selection is reflected in the URL (/changelog, /credits).
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const TAB_PATHS: readonly string[] = EXTRAS_TABS;

const Extras = () => {
  const { path: pathname, navigate } = useRouter();

  const activeTab = TAB_PATHS.indexOf(pathname) + 1 || 1;

  return (
    <TabLayout
      tabs={[
        { label: "Changelog", content: <Changelog /> },
        { label: "Credits", content: <Credits /> },
      ]}
      activeTab={activeTab}
      onSelect={(index) => track("extras_tab", { tab: index === 2 ? "credits" : "changelog" })}
      onTabChange={(index) => {
        const targetPath = TAB_PATHS[index - 1];
        if (targetPath && targetPath !== pathname) {
          navigate(targetPath);
        }
      }}
    />
  );
};

export default Extras;
