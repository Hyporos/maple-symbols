import { lazy, Suspense, useEffect } from "react";
import Header from "./components/Header";
import Selector from "./components/Selector";
import Footer from "./components/Footer";
import SEO from "./components/SEO";
import { ErrorBoundary } from "react-error-boundary";
import { BreakpointProvider } from "./contexts/BreakpointContext";
import { useRouter } from "./contexts/RouterContext";

// Heavy calculator sections are lazily loaded to keep initial parse cost low.
const Calculator = lazy(() => import("./components/Calculator/Calculator"));
const Tools = lazy(() => import("./components/Calculator/Tools"));
const Overview = lazy(() => import("./components/Calculator/Overview"));
const Graph = lazy(() => import("./components/Calculator/Graph"));
import Handbook from "./components/Handbook/Handbook";
import Extras from "./components/Extras/Extras";

function PageContent() {
  const { path: pathname } = useRouter();

  if (pathname === "/handbook") {
    return (
      <>
        <SEO
          title="Symbol Handbook | Maple Symbols"
          description="Complete Arcane and Sacred Symbol reference: experience tables, meso upgrade costs, and daily/weekly quest ratios for every MapleStory region."
          url="https://maplesymbols.com/handbook"
        />
        <Selector />
        <Handbook />
      </>
    );
  }

  if (pathname === "/changelog" || pathname === "/credits") {
    const isChangelog = pathname === "/changelog";

    return (
      <>
        <SEO
          title={isChangelog ? "Changelog | Maple Symbols" : "Credits | Maple Symbols"}
          description={
            isChangelog
              ? "Full version history and feature updates for Maple Symbols, the MapleStory Arcane and Sacred Symbol calculator."
              : "Attributions and acknowledgements for Maple Symbols."
          }
          url={
            isChangelog ? "https://maplesymbols.com/changelog" : "https://maplesymbols.com/credits"
          }
        />
        <Extras />
      </>
    );
  }

  return (
    <>
      <SEO />
      <Selector />
      <Calculator />
      <Tools />
      <Overview />
      <Graph />
    </>
  );
}

function App() {
  // Warn Samsung Internet users that its built-in dark theme will break colors.
  useEffect(() => {
    if (navigator.userAgent.match(/samsung/i)) {
      alert(
        "Your browser (Samsung Internet) may not show this website " +
          "correctly. Please consider using a standards-compliant " +
          "browser instead.\n\n" +
          "We recommend Firefox, Microsoft Edge, or Google Chrome."
      );
    }
  }, []);

  return (
    <BreakpointProvider>
      <div className="flex min-h-screen flex-col">
        <Header />

        <ErrorBoundary
          fallback={
            <div className="flex flex-1 items-center justify-center text-tertiary">
              Something went wrong. Please refresh.
            </div>
          }
        >
          <Suspense fallback={null}>
            <PageContent />
          </Suspense>
        </ErrorBoundary>

        <Footer />
      </div>
    </BreakpointProvider>
  );
}

export default App;
