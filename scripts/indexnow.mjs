// ---------------------------------------------------------------------------
// indexnow.mjs — Tells IndexNow engines (Bing, Naver, Yandex, Seznam…) that the
// site's pages changed, so they recrawl without waiting (docs/SEO.md §5).
//
// Run by hand after a release reaches production: `pnpm indexnow`. It reads the
// live sitemap (index), collects every page URL, and POSTs them in one request to
// api.indexnow.org with the key whose file sits at the site root
// (public/<key>.txt, which proves the site is ours). `--dry-run` prints the
// request instead of sending it.
// ---------------------------------------------------------------------------

const SITE = "https://maplesymbols.com";
const KEY = "6ac832e798949809df731e3ffe349221";
const dryRun = process.argv.includes("--dry-run");

const locs = (xml) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

async function fetchText(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`indexnow: ${url} returned ${response.status}`);
  return response.text();
}

// 2.0 serves a sitemap index (one sitemap per edition); 1.x served the page list itself.
const root = await fetchText(`${SITE}/sitemap.xml`);
const urlList = root.includes("<sitemapindex")
  ? (await Promise.all(locs(root).map(async (s) => locs(await fetchText(s))))).flat()
  : locs(root);
if (urlList.length === 0) throw new Error("indexnow: the sitemaps list no pages");

const body = {
  host: new URL(SITE).host,
  key: KEY,
  keyLocation: `${SITE}/${KEY}.txt`,
  urlList,
};

if (dryRun) {
  console.log(JSON.stringify(body, null, 2));
} else {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  // 200 and 202 both mean accepted (202: the key is still being checked).
  console.log(`indexnow: ${response.status} for ${urlList.length} URLs`);
  if (response.status !== 200 && response.status !== 202) process.exit(1);
}
