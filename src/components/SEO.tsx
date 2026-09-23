import { useLayoutEffect } from "react";
import {
  alternatesFor,
  editionFor,
  EDITIONS,
  isIndexable,
  OG_IMAGE,
  routeFor,
  servedLocale,
  SITE_NAME,
  urlFor,
} from "../lib/routes";

const ROOT = routeFor("/");
const ROOT_URL = urlFor("/");

interface SEOProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  imageAlt?: string;
}

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
// * SEO updates document head synchronously via useLayoutEffect so the title
// * and meta tags change in the same frame as the page render — no async
// * batching, no visible freeze.
// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――

const setMeta = (selector: string, attr: string, val: string) => {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, val);
};

/** Keep the head's hreflang links and robots meta in step with the page (they start in the built HTML). */
const setAlternates = (pathname: string) => {
  const edition = editionFor(pathname);
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  document.head.querySelector('meta[name="robots"]')?.remove();
  if (!isIndexable(edition)) {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex";
    document.head.appendChild(robots);
    return;
  }
  for (const { hreflang, href } of alternatesFor(routeFor(pathname).path)) {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = hreflang;
    link.href = href;
    document.head.appendChild(link);
  }
};

const setOrCreateLdJson = (json: object[]) => {
  let el = document.head.querySelector<HTMLScriptElement>("script[data-seo-ld]");
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-seo-ld", "");
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(json);
};

function SEO({
  title = ROOT.title,
  description = ROOT.description,
  url = ROOT_URL,
  image = OG_IMAGE.url,
  imageAlt = OG_IMAGE.alt,
}: SEOProps) {
  useLayoutEffect(() => {
    const pathname = new URL(url).pathname;
    const locale = servedLocale(editionFor(pathname));
    // Every edition's calculator is a root: it carries the WebApplication data.
    const isRoot = EDITIONS.some((e) => urlFor("/", e) === url);
    document.documentElement.lang = locale;
    setAlternates(pathname);

    document.title = title;

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[property="og:image"]', "content", image);
    setMeta('meta[property="og:image:alt"]', "content", imageAlt);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:url"]', "content", url);
    setMeta('meta[name="twitter:image"]', "content", image);
    setMeta('meta[name="twitter:image:alt"]', "content", imageAlt);
    setMeta('link[rel="canonical"]', "href", url);

    const webPage = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url,
      name: title,
      description,
      inLanguage: locale,
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: ROOT_URL },
    };

    if (isRoot) {
      const webApp = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url,
        description: ROOT.description,
        applicationCategory: "GameApplication",
        operatingSystem: "Web",
        inLanguage: locale,
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@type": "Person", name: "Hyporos" },
        about: { "@type": "VideoGame", name: "MapleStory", genre: "MMORPG", gamePlatform: "PC" },
      };
      // WebSite carries the site name for the brand line in results. No potentialAction:
      // Google retired the sitelinks search box in Nov 2024 and the app has no search (SEO-13).
      const webSite = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: ROOT_URL,
      };
      setOrCreateLdJson([webApp, webSite, webPage]);
    } else {
      setOrCreateLdJson([webPage]);
    }
  }, [title, description, url, image, imageAlt]);

  return null;
}

export default SEO;
