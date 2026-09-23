import { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { RouterProvider } from "./contexts/RouterContext";
import { useAppStore } from "./state/store";
import { NEXT_UI, splitNext } from "./next/routing";
import { splitPath } from "./lib/routes";
import "./global.css";

/** Loads the player's saves once the page has rendered (the store skips it at import). */
function RestoreSaves() {
  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);
  return null;
}

const container = document.getElementById("root") as HTMLElement;
const app = (
  <RouterProvider>
    <RestoreSaves />
    <App />
  </RouterProvider>
);

// Built pages arrive with their HTML already in #root (scripts/prerender.mjs); the dev
// server's do not. A preview serves the calculator's prebuilt HTML for /next (an unknown
// path outside NEXT_UI's own build), so render it fresh instead of hydrating that mismatch.
const isNext = NEXT_UI && splitNext(splitPath(window.location.pathname).rest).next;
if (container.hasChildNodes() && !isNext) ReactDOM.hydrateRoot(container, app);
else {
  container.replaceChildren();
  ReactDOM.createRoot(container).render(app);
}
