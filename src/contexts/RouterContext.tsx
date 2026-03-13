import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * Lightweight SPA router built on the History API.
// * navigate() calls pushState so the URL changes immediately in the same
// * React render cycle — no full-page reload, no React Router overhead.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

interface RouterContextValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue>({
  path: "/",
  navigate: () => {},
});

const normalize = (p: string) => p.replace(/\/+$/, "") || "/";

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => normalize(window.location.pathname));
  const [, startTransition] = useTransition();

  // Keep in sync when user presses back/forward.
  useEffect(() => {
    const onPopState = () => {
      startTransition(() => setPath(normalize(window.location.pathname)));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const normalized = normalize(to);
    if (normalized !== normalize(window.location.pathname)) {
      window.history.pushState(null, "", to);
    }
    startTransition(() => setPath(normalized));
  }, []);

  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);
