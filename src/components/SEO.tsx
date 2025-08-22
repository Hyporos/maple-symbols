import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "MapleStory Arcane & Sacred Symbol Calculator",
  description = "The ultimate MapleStory symbol calculator for Arcane and Sacred symbols. Calculate daily and weekly quest requirements, track progress, estimate completion dates, and optimize your symbol leveling strategy.",
  url = "https://maplesymbols.com/",
  image = "https://github.com/Hyporos/maple-symbols/blob/main/public/main/favicon.png?raw=true",
  type = "website"
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Maple Symbols Calculator",
    "url": url,
    "description": description,
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "Hyporos"
    },
    "about": {
      "@type": "VideoGame",
      "name": "MapleStory",
      "genre": "MMORPG"
    },
    "featureList": [
      "Arcane Symbol Calculator",
      "Sacred Symbol Calculator", 
      "Daily Quest Tracker",
      "Progress Estimation",
      "Mesos Cost Calculator",
      "Symbol Level Planner"
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={url} />
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
