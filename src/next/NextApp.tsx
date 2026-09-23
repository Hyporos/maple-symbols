import { useEffect } from "react";
import { BreakpointProvider } from "../contexts/BreakpointContext";
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
