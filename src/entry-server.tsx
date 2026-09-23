// ---------------------------------------------------------------------------
// entry-server.tsx — Renders one page to HTML at build time (docs/REGIONS.md §4).
//
// `vite build --ssr` bundles this for Node; scripts/prerender.mjs calls renderPage
// for every page of every edition and writes the result into that page's HTML file,
// so search engines that run little or no JavaScript (Naver, Baidu, Bing) read the
// whole page. The browser then hydrates it (src/main.tsx). Rendered as a phone
// (BreakpointContext) and with an empty calculator (the store skips its saves).
// ---------------------------------------------------------------------------

import { prerender } from "react-dom/static";
import App from "./App";
import { RouterProvider } from "./contexts/RouterContext";
import { createInitialSymbols } from "./lib/data";
import { splitPath } from "./lib/routes";
import { useAppStore } from "./state/store";

export { EDITIONS, hrefFor, ROUTES } from "./lib/routes";

/** The HTML inside #root for one site path ("/", "/kms/handbook", …). */
export async function renderPage(path: string): Promise<string> {
  const { region } = splitPath(path).edition;
  // The store is a module singleton: reset it to this page's server before each page.
  useAppStore.setState({
    ...useAppStore.getInitialState(),
    region,
    regionOverride: null,
    saves: {},
    symbols: createInitialSymbols(region),
  });
  // prerender (unlike renderToString) waits for the lazy calculator sections.
  const { prelude } = await prerender(
    <RouterProvider initialPath={path}>
      <App />
    </RouterProvider>
  );
  return new Response(prelude).text();
}
