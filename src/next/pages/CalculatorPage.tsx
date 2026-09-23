import { useMessages } from "../../i18n";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * CalculatorPage is the /next redesign's calculator page (spec §3).
// * Minimal until Task 3 replaces it with the picker, calculator, overview and graph cards.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const CalculatorPage = () => <h1>{useMessages().next.calculator.calculatorLabel}</h1>;

export default CalculatorPage;
