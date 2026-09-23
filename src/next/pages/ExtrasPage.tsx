import { useMessages } from "../../i18n";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * ExtrasPage is the /next redesign's changelog/credits page (spec §3).
// * Minimal until Task 5 replaces it with the Changelog and Credits tabs.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const ExtrasPage = () => <h1>{useMessages().next.extras.label}</h1>;

export default ExtrasPage;
