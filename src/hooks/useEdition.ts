// ---------------------------------------------------------------------------
// useEdition.ts — The site version (edition) the URL is on, and the page inside it.
// "/kms/handbook" is the KMS edition's "/handbook"; the root is GMS (docs/REGIONS.md §2).
// ---------------------------------------------------------------------------

import { useRouter } from "../contexts/RouterContext";
import { splitPath, type Edition } from "../lib/routes";

export function useEdition(): { edition: Edition; path: string } {
  const { edition, rest } = splitPath(useRouter().path);
  return { edition, path: rest };
}
