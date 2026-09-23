import { render, type RenderResult } from "@testing-library/react";
import App from "../App";
import { RouterProvider } from "../contexts/RouterContext";

/** Render the whole app at a path (a /next page test's starting point). */
export function renderNextAt(path: string): RenderResult {
  window.history.replaceState(null, "", path);
  return render(
    <RouterProvider>
      <App />
    </RouterProvider>
  );
}
