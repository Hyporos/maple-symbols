import { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { RouterProvider } from "./contexts/RouterContext";
import { useAppStore } from "./state/store";
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
// server's do not.
if (container.hasChildNodes()) ReactDOM.hydrateRoot(container, app);
else ReactDOM.createRoot(container).render(app);
