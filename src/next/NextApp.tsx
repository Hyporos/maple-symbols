import { useEffect } from "react";
import { BreakpointProvider } from "../contexts/BreakpointContext";
import { useAppStore } from "../state/store";
import { useNextRoute } from "./routing";
import NextShell from "./shell/NextShell";
import CalculatorPage from "./pages/CalculatorPage";
import HandbookPage from "./pages/HandbookPage";
import ExtrasPage from "./pages/ExtrasPage";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * NextApp is the redesigned interface at /next: the shell and the page the URL names.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const NextApp = () => {
  const { path } = useNextRoute();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  // The current UI (src/components) has no Grand tab and never filters Calculator/Tools's
  // selection by mode, so leaving a Grand symbol selected when the player navigates back to "/"
  // would show Tallahart/Geardock there. Folding back to Sacred on unmount keeps that fix inside
  // src/next: deleting this folder removes it along with everything else /next added.
  useEffect(() => {
    return () => {
      const { symbols, selectedId, setMode } = useAppStore.getState();
      const symbol = symbols.find((s) => s.id === selectedId);
      if (symbol?.type === "grand") setMode("sacred");
    };
  }, []);

  return (
    <BreakpointProvider>
      <div data-testid="next-app">
        <NextShell>
          {path === "/handbook" ? (
            <HandbookPage />
          ) : path === "/changelog" || path === "/credits" ? (
            <ExtrasPage />
          ) : (
            <CalculatorPage />
          )}
        </NextShell>
      </div>
    </BreakpointProvider>
  );
};

export default NextApp;
