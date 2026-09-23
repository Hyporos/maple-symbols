import { lazy, Suspense, useEffect } from "react";
import Header from "./components/Header";
import Selector from "./components/Selector";
import Footer from "./components/Footer";
import SEO from "./components/SEO";
import { ErrorBoundary } from "react-error-boundary";
import { BreakpointProvider } from "./contexts/BreakpointContext";
import { useRouter } from "./contexts/RouterContext";
import { isKnownPath, pageMetaFor, routeFor } from "./lib/routes";
import { useEdition } from "./hooks/useEdition";
import { notFoundPath, track } from "./lib/analytics";
import { useMessages } from "./i18n";

// Heavy calculator sections are lazily loaded to keep initial parse cost low.
const Calculator = lazy(() => import("./components/Calculator/Calculator"));
const Tools = lazy(() => import("./components/Calculator/Tools"));
const Overview = lazy(() => import("./components/Calculator/Overview"));
const Graph = lazy(() => import("./components/Calculator/Graph"));
import Handbook from "./components/Handbook/Handbook";
import Extras from "./components/Extras/Extras";

function PageContent() {
  const { path: pathname } = useRouter();
  const { edition } = useEdition();
  // Unknown paths resolve to the calculator page of their edition.
  const route = routeFor(pathname);
  const known = isKnownPath(pathname);

  // Evidence for SEO-3: do unknown URLs get real traffic? (docs/ANALYTICS.md §3)
  useEffect(() => {
    if (!known) track("not_found", { path: notFoundPath(pathname) });
  }, [pathname, known]);
  const meta = pageMetaFor(route.path, edition);
  const seo = <SEO title={meta.title} description={meta.description} url={meta.url} />;

  if (route.path === "/handbook") {
    return (
      <>
        {seo}
        <Selector />
        <Handbook />
      </>
    );
  }

  if (route.path === "/changelog" || route.path === "/credits") {
    return (
      <>
        {seo}
        <Extras />
      </>
    );
  }

  return (
    <>
      {seo}
      <Selector />
      <Calculator />
      <Tools />
      <Overview />
      <Graph />
    </>
  );
}

function App() {
  const m = useMessages().shell;

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
          onError={() => track("error_shown", { route: routeFor(window.location.pathname).path })}
          fallback={
            <div className="flex flex-1 items-center justify-center text-tertiary">
              {m.errorFallback}
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
