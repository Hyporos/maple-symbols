import { lazy, Suspense, useEffect } from "react";
import Header from "./components/Header";
import Selector from "./components/Selector";
import Footer from "./components/Footer";
import SEO from "./components/SEO";
import { ErrorBoundary } from "react-error-boundary";
import { BreakpointProvider } from "./contexts/BreakpointContext";
import { useRouter } from "./contexts/RouterContext";
import { ROUTES, routeFor, urlFor } from "./lib/routes";
import { notFoundPath, track } from "./lib/analytics";

// Heavy calculator sections are lazily loaded to keep initial parse cost low.
const Calculator = lazy(() => import("./components/Calculator/Calculator"));
const Tools = lazy(() => import("./components/Calculator/Tools"));
const Overview = lazy(() => import("./components/Calculator/Overview"));
const Graph = lazy(() => import("./components/Calculator/Graph"));
import Handbook from "./components/Handbook/Handbook";
import Extras from "./components/Extras/Extras";

function PageContent() {
  const { path: pathname } = useRouter();
  // Unknown paths resolve to the calculator page.
  const route = routeFor(pathname);
  const isKnownPath = ROUTES.some((r) => r.path === pathname);

  // Evidence for SEO-3: do unknown URLs get real traffic? (docs/ANALYTICS.md §3)
  useEffect(() => {
    if (!isKnownPath) track("not_found", { path: notFoundPath(pathname) });
  }, [pathname, isKnownPath]);
  const seo = <SEO title={route.title} description={route.description} url={urlFor(route.path)} />;

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
