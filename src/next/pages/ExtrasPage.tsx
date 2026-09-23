import { useRouter } from "../../contexts/RouterContext";
import { useMessages } from "../../i18n";
import ChangelogPanel from "../extras/ChangelogPanel";
import CreditsPanel from "../extras/CreditsPanel";
import { nextHref, useNextRoute } from "../routing";
import { Card, Tabs } from "../ui";

type ExtrasTab = "changelog" | "credits";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * ExtrasPage is the /next redesign's changelog/credits page (spec §3): one Card with Tabs,
// * whose value follows the URL ("/changelog" or "/credits") so switching tabs navigates.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ExtrasPage = () => {
  const messages = useMessages();
  const { navigate } = useRouter();
  const { edition, path } = useNextRoute();
  const tab: ExtrasTab = path === "/credits" ? "credits" : "changelog";

  const handleChange = (value: ExtrasTab) => {
    navigate(nextHref(value === "credits" ? "/credits" : "/changelog", edition));
  };

  const tabs = [
    { value: "changelog" as const, label: messages.extras.changelogTab },
    { value: "credits" as const, label: messages.extras.creditsTab },
  ];

  return (
    <Card label={messages.next.extras.label} as="section" className="mx-auto mt-8 max-w-[860px]">
      <Tabs
        label={messages.next.extras.label}
        idPrefix="extras"
        tabs={tabs}
        value={tab}
        onChange={handleChange}
      />
      <div
        role="tabpanel"
        id={`extras-panel-${tab}`}
        aria-labelledby={`extras-tab-${tab}`}
        className="pt-5"
      >
        {tab === "changelog" ? <ChangelogPanel /> : <CreditsPanel />}
      </div>
    </Card>
  );
};

export default ExtrasPage;
