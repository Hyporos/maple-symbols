import { render, type RenderResult } from "@testing-library/react";
import App from "../App";
import { RouterProvider } from "../contexts/RouterContext";
// App loads NextApp lazily. Importing it here first means the lazy import finds it already
// transformed, so a page test's first findBy does not time out while a busy machine (the
// pre-commit hook's related-tests run) compiles the whole /next tree.
import "./NextApp";

/** Render the whole app at a path (a /next page test's starting point). */
export function renderNextAt(path: string): RenderResult {
  window.history.replaceState(null, "", path);
  return render(
    <RouterProvider>
      <App />
    </RouterProvider>
  );
}
