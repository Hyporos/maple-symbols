import { useLayoutEffect } from "react";
import { OG_IMAGE, routeFor, SITE_NAME, SITE_URL, urlFor } from "../lib/routes";

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
    const isRoot = url === ROOT_URL;

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
      inLanguage: "en",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: ROOT_URL },
    };

    if (isRoot) {
      const webApp = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url: ROOT_URL,
        description:
          "MapleStory Arcane and Sacred Symbol calculator. Track progress, estimate completion, and plan your leveling strategy.",
        applicationCategory: "GameApplication",
        operatingSystem: "Web",
        inLanguage: "en",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@type": "Person", name: "Hyporos" },
        about: { "@type": "VideoGame", name: "MapleStory", genre: "MMORPG", gamePlatform: "PC" },
      };
      const webSite = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: ROOT_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      };
      setOrCreateLdJson([webApp, webSite, webPage]);
    } else {
      setOrCreateLdJson([webPage]);
    }
  }, [title, description, url, image, imageAlt]);

  return null;
}

export default SEO;
