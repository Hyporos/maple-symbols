import { useMessages } from "../../i18n";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * HandbookPage is the /next redesign's handbook page (spec §3).
// * Minimal until Task 4 replaces it with the Experience/Meso/Ratio tabs.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const HandbookPage = () => <h1>{useMessages().next.handbook.label}</h1>;

export default HandbookPage;
