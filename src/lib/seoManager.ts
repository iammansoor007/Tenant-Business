import { Tenant, TenantMedia } from '../types/tenant';

export interface SeoMetadata {
  title: string;
  description: string;
  keywords: string;
  author: string;
  canonicalUrl: string;
  robots: string;
  geoRegion: string;
  geoPlacename: string;
  geoPosition?: string;
  icbm?: string;
  ogType: string;
  ogSiteName: string;
  ogLocale: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageSecureUrl: string;
  ogImageAlt: string;
  ogUrl: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterImageAlt: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
  schemaJson: Record<string, any>;
}

// US State code lookup helper
const STATE_CODES: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
  ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT',
  vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI',
  wyoming: 'WY'
};

function extractStateCode(locationStr: string, isFlagship = false): string {
  if (!locationStr) return isFlagship ? 'MT' : '';
  const clean = locationStr.trim();
  // Check for 2-letter state code like "Great Falls, MT"
  const match2Letter = clean.match(/,\s*([A-Za-z]{2})(?:\s|$)/);
  if (match2Letter) return match2Letter[1].toUpperCase();

  // Check state names
  const lower = clean.toLowerCase();
  for (const [name, code] of Object.entries(STATE_CODES)) {
    if (lower.includes(name)) return code;
  }
  return isFlagship ? 'MT' : '';
}

function extractCity(locationStr: string, isFlagship = false): string {
  if (!locationStr) return isFlagship ? 'Great Falls' : '';
  const parts = locationStr.split(',');
  if (parts.length > 0 && parts[0].trim()) {
    return parts[0].trim();
  }
  return isFlagship ? 'Great Falls' : '';
}

function toAbsoluteUrl(urlPath: string, origin: string): string {
  if (!urlPath) return `${origin}/logo.webp`;
  if (urlPath.startsWith('http://') || urlPath.startsWith('https://') || urlPath.startsWith('data:')) {
    return urlPath;
  }
  const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  return `${origin}${cleanPath}`;
}

export function generateSeoMetadata(
  tenant?: Tenant | null,
  completeData?: Record<string, any>,
  media?: TenantMedia,
  slug?: string,
  explicitOrigin?: string
): SeoMetadata {
  const origin = explicitOrigin || (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://maxqualityroofing.com');
  const activeSlug = slug || tenant?.slug || 'max-quality-roofing';
  const isRoot = !activeSlug || activeSlug === 'max-quality-roofing';

  // 1. Business & Brand Identity
  const isFlagship = !tenant || activeSlug === 'max-quality-roofing' || tenant.slug === 'max-quality-roofing';

  const rawName = tenant?.name || completeData?.header?.title || completeData?.navbar?.logoAlt?.replace(/\s*Logo$/i, '') || (isFlagship ? 'Max Quality Roofing' : 'Roofing Contractor');
  const name = rawName.trim();
  const rawLocation =
    tenant?.location ||
    tenant?.completeData?.footer?.serviceAreas?.items?.[0] ||
    (!isFlagship
      ? (completeData?.footer?.serviceAreas?.items?.[0]?.includes('Great Falls') ? '' : completeData?.footer?.serviceAreas?.items?.[0])
      : completeData?.footer?.serviceAreas?.items?.[0]) ||
    (!isFlagship
      ? (completeData?.navbar?.stats?.[0]?.value?.includes('Great Falls') ? '' : completeData?.navbar?.stats?.[0]?.value)
      : completeData?.navbar?.stats?.[0]?.value) ||
    (isFlagship ? 'Great Falls, MT' : '');
  
  const city = extractCity(rawLocation, isFlagship);
  const stateCode = extractStateCode(rawLocation, isFlagship);
  const cityAndState = (city && stateCode) ? `${city}, ${stateCode}` : (city || stateCode || (isFlagship ? 'Great Falls, MT' : ''));

  const phone =
    tenant?.phone ||
    (!isFlagship
      ? (completeData?.footer?.contact?.phone?.includes('406') && completeData?.footer?.contact?.phone?.includes('217-1720') ? '' : completeData?.footer?.contact?.phone)
      : completeData?.footer?.contact?.phone) ||
    (isFlagship ? '(406) 217-1720' : '');

  const email =
    tenant?.email ||
    (!isFlagship
      ? (completeData?.footer?.contact?.email?.includes('maxqualityroofing') ? '' : completeData?.footer?.contact?.email)
      : completeData?.footer?.contact?.email) ||
    (isFlagship ? 'maxqualityroofing@gmail.com' : '');

  const headlineTagline =
    Array.isArray(completeData?.hero?.headlines)
      ? completeData?.hero?.headlines.join(' ')
      : 'Architectural Asphalt Shingle Specialist';

  const brandTagline =
    completeData?.footer?.bottom?.tagline ||
    headlineTagline ||
    'Architectural Asphalt Shingle Specialist';

  // 2. Canonical URL
  const canonicalUrl = tenant?.seo?.canonicalUrl || (isRoot ? `${origin}/` : `${origin}/${activeSlug}`);

  // 3. Primary SEO Title
  const baseTitle = cityAndState
    ? `${name} | Architectural Asphalt Shingle Specialist | ${cityAndState}`
    : `${name} | Architectural Asphalt Shingle Specialist`;
  const title = tenant?.seo?.title || baseTitle;

  // 4. Meta Description
  const rawHeroDesc = completeData?.hero?.description;
  const cleanHeroDesc = (!isFlagship && tenant?.location && rawHeroDesc)
    ? rawHeroDesc
        .replace(/Great Falls, Montana and surrounding communities/gi, `${tenant.location} and surrounding communities`)
        .replace(/Great Falls, Montana/gi, tenant.location)
        .replace(/Montana weather/gi, `${tenant.state || "local"} weather`)
    : rawHeroDesc;
  const defaultDesc = cleanHeroDesc
    ? `${name}: ${cleanHeroDesc}`
    : `${name} delivers owner-operated residential roofing solutions, architectural asphalt shingle installations, roof replacement, and leak repair${cityAndState ? ` across ${cityAndState} and surrounding areas.` : '.'}`;
  const description = (tenant?.seo?.description || defaultDesc).slice(0, 320);

  // 5. Meta Keywords
  const defaultKeywords = cityAndState
    ? `${name}, roofing contractor ${cityAndState}, ${stateCode ? `${stateCode} roofing contractor, ` : ''}roof replacement, emergency leak detection, architectural shingles, ${city ? `${city} roofer, ` : ''}residential roofing, Shingle Master`
    : `${name}, roofing contractor, roof replacement, emergency leak detection, architectural shingles, residential roofing, Shingle Master`;
  const keywords = tenant?.seo?.keywords || defaultKeywords;

  // 6. Geo & Local SEO
  const geoRegion = tenant?.seo?.geoRegion || (stateCode ? `US-${stateCode}` : (isFlagship ? 'US-MT' : ''));
  const geoPlacename = tenant?.seo?.geoPlacename || cityAndState || (isFlagship ? 'Great Falls, MT' : '');
  const geoPosition = isFlagship ? '47.5053;-111.3008' : (tenant?.seo?.geoPosition || '');
  const icbm = isFlagship ? '47.5053, -111.3008' : (tenant?.seo?.icbm || '');

  // 7. Visual Assets (Logo / Hero)
  const logoPath = tenant?.media?.logo || media?.logo || '/logo.webp';
  const heroPath = tenant?.media?.heroBg || media?.heroBg || logoPath;
  const ogImageUrl = tenant?.seo?.ogImage ? toAbsoluteUrl(tenant.seo.ogImage, origin) : toAbsoluteUrl(heroPath || logoPath, origin);
  const faviconUrl = tenant?.media?.logo || media?.logo || '/favicon.svg';

  // 8. OpenGraph & Twitter
  const ogTitle = tenant?.seo?.ogTitle || `${name} | Architectural Asphalt Shingle Specialist`;
  const ogDescription = tenant?.seo?.ogDescription || description;
  const twitterHandle = tenant?.seo?.twitterHandle || `@${name.replace(/[^a-zA-Z0-9]/g, '')}`;
  const twitterTitle = tenant?.seo?.twitterTitle || ogTitle;
  const twitterDescription = tenant?.seo?.twitterDescription || description;

  // 9. Offer Catalog Services
  const detectedServices: string[] = [];
  if (Array.isArray(completeData?.services?.services)) {
    completeData?.services?.services.forEach((s: any) => {
      if (s?.title) detectedServices.push(s.title);
    });
  }
  if (detectedServices.length === 0 && Array.isArray(completeData?.navbar?.services)) {
    completeData?.navbar?.services.forEach((s: any) => {
      if (s?.title) detectedServices.push(s.title);
    });
  }
  const servicesList = detectedServices.length > 0
    ? detectedServices
    : [
        'Architectural Asphalt Shingles',
        'Full Roof Replacement',
        'Roof Repair & Maintenance',
        'Emergency Leak Detection',
        'Free Roof Inspections'
      ];

  // 10. Service Areas
  const serviceAreas: string[] = (!isFlagship && tenant?.location)
    ? [cityAndState, `${city} Area`, 'Surrounding Communities']
    : (Array.isArray(completeData?.footer?.serviceAreas?.items)
        ? completeData?.footer?.serviceAreas?.items
        : [cityAndState, `${city} Area`, 'Surrounding Communities']);

  // 11. Schedule
  const scheduleSpecs = Array.isArray(completeData?.footer?.contact?.schedule)
    ? completeData?.footer?.contact?.schedule.map((item: any) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: item.days?.includes('Mon') ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] : ['Saturday', 'Sunday'],
        opens: '07:00',
        closes: '19:00',
      }))
    : [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '07:00',
          closes: '19:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday'],
          opens: '08:00',
          closes: '17:00',
        },
      ];

  // 12. Schema.org JSON-LD
  const schemaJson = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RoofingContractor',
        '@id': `${canonicalUrl}#business`,
        name,
        alternateName: `${name} LLC`,
        description,
        url: canonicalUrl,
        logo: toAbsoluteUrl(logoPath, origin),
        image: ogImageUrl,
        telephone: phone,
        email,
        priceRange: '$$',
        currenciesAccepted: 'USD',
        paymentAccepted: 'Cash, Credit Card, Check, Insurance',
        ...(city || stateCode ? {
          address: {
            '@type': 'PostalAddress',
            ...(city ? { addressLocality: city } : {}),
            ...(stateCode ? { addressRegion: stateCode } : {}),
            addressCountry: 'US',
          },
        } : {}),
        ...(isFlagship ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: 47.5053,
            longitude: -111.3008,
          },
        } : (tenant?.seo?.geoPosition ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: parseFloat(tenant.seo.geoPosition.split(';')[0] || '0'),
            longitude: parseFloat(tenant.seo.geoPosition.split(';')[1] || '0'),
          },
        } : {})),
        areaServed: serviceAreas.map((area) => ({
          '@type': 'AdministrativeArea',
          name: area,
        })),
        openingHoursSpecification: scheduleSpecs,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${name} Services Catalog`,
          itemListElement: servicesList.map((serviceName) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: serviceName,
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${canonicalUrl}#website`,
        url: canonicalUrl,
        name,
        description: `Official website of ${name}. Owner-operated residential roofing contractor serving ${cityAndState} and surrounding areas.`,
        publisher: { '@id': `${canonicalUrl}#business` },
      },
    ],
  };

  return {
    title,
    description,
    keywords,
    author: name,
    canonicalUrl,
    robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    geoRegion,
    geoPlacename,
    geoPosition,
    icbm,
    ogType: 'website',
    ogSiteName: name,
    ogLocale: 'en_US',
    ogTitle,
    ogDescription,
    ogImage: ogImageUrl,
    ogImageSecureUrl: ogImageUrl,
    ogImageAlt: `${name} – ${brandTagline}`,
    ogUrl: canonicalUrl,
    twitterCard: 'summary_large_image',
    twitterSite: twitterHandle,
    twitterCreator: twitterHandle,
    twitterTitle,
    twitterDescription,
    twitterImage: ogImageUrl,
    twitterImageAlt: `${name} – ${cityAndState}`,
    faviconUrl,
    appleTouchIconUrl: faviconUrl,
    schemaJson,
  };
}

// ─── DOM HELPER (Runs in React Browser Context) ───
function setMeta(attr: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string, type?: string) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  if (type) el.setAttribute('type', type);
}

export function updateClientSeo(
  tenant?: Tenant | null,
  completeData?: Record<string, any>,
  media?: TenantMedia,
  slug?: string
): SeoMetadata {
  const metadata = generateSeoMetadata(tenant, completeData, media, slug);

  if (typeof document === 'undefined') return metadata;

  // 1. Document Title
  document.title = metadata.title;

  // 2. Primary SEO Meta Tags
  setMeta('name', 'description', metadata.description);
  setMeta('name', 'keywords', metadata.keywords);
  setMeta('name', 'author', metadata.author);
  setMeta('name', 'robots', metadata.robots);
  setLink('canonical', metadata.canonicalUrl);

  // 3. Geo / Local SEO
  setMeta('name', 'geo.region', metadata.geoRegion);
  setMeta('name', 'geo.placename', metadata.geoPlacename);
  if (metadata.geoPosition) setMeta('name', 'geo.position', metadata.geoPosition);
  if (metadata.icbm) setMeta('name', 'ICBM', metadata.icbm);

  // 4. OpenGraph Tags
  setMeta('property', 'og:type', metadata.ogType);
  setMeta('property', 'og:site_name', metadata.ogSiteName);
  setMeta('property', 'og:locale', metadata.ogLocale);
  setMeta('property', 'og:title', metadata.ogTitle);
  setMeta('property', 'og:description', metadata.ogDescription);
  setMeta('property', 'og:image', metadata.ogImage);
  setMeta('property', 'og:image:secure_url', metadata.ogImageSecureUrl);
  setMeta('property', 'og:image:alt', metadata.ogImageAlt);
  setMeta('property', 'og:url', metadata.ogUrl);

  // 5. Twitter / X Card Tags
  setMeta('name', 'twitter:card', metadata.twitterCard);
  setMeta('name', 'twitter:site', metadata.twitterSite);
  setMeta('name', 'twitter:creator', metadata.twitterCreator);
  setMeta('name', 'twitter:title', metadata.twitterTitle);
  setMeta('name', 'twitter:description', metadata.twitterDescription);
  setMeta('name', 'twitter:image', metadata.twitterImage);
  setMeta('name', 'twitter:image:alt', metadata.twitterImageAlt);

  // 6. Favicon & Apple Touch Icon
  setLink('icon', metadata.faviconUrl);
  setLink('apple-touch-icon', metadata.appleTouchIconUrl);

  // 7. Schema.org Dynamic JSON-LD (Replace or inject clean dynamic node)
  const schemaId = 'pitchengine-dynamic-schema';
  let scriptEl = document.getElementById(schemaId) as HTMLScriptElement | null;
  if (!scriptEl) {
    // Remove static default script if it exists without id
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((s) => {
      if (s.id !== schemaId) s.remove();
    });

    scriptEl = document.createElement('script');
    scriptEl.id = schemaId;
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(metadata.schemaJson, null, 2);

  return metadata;
}

// ─── HTML INJECTION HELPER (Runs on Server / Vite Middleware for Scrapers) ───
export function injectSeoIntoHtml(html: string, metadata: SeoMetadata): string {
  let output = html;

  const escapeXml = (unsafe: string) =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  // Title
  output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeXml(metadata.title)}</title>`);

  // Canonical
  output = output.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeXml(metadata.canonicalUrl)}" />`
  );

  // Description
  output = output.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeXml(metadata.description)}" />`
  );

  // Keywords
  output = output.replace(
    /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="keywords" content="${escapeXml(metadata.keywords)}" />`
  );

  // Author
  output = output.replace(
    /<meta\s+name="author"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="author" content="${escapeXml(metadata.author)}" />`
  );

  // Geo
  output = output.replace(
    /<meta\s+name="geo\.region"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="geo.region" content="${escapeXml(metadata.geoRegion)}" />`
  );
  output = output.replace(
    /<meta\s+name="geo\.placename"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="geo.placename" content="${escapeXml(metadata.geoPlacename)}" />`
  );

  // Open Graph
  output = output.replace(
    /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:site_name" content="${escapeXml(metadata.ogSiteName)}" />`
  );
  output = output.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeXml(metadata.ogTitle)}" />`
  );
  output = output.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeXml(metadata.ogDescription)}" />`
  );
  output = output.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeXml(metadata.ogImage)}" />`
  );
  output = output.replace(
    /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:secure_url" content="${escapeXml(metadata.ogImageSecureUrl)}" />`
  );
  output = output.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeXml(metadata.ogUrl)}" />`
  );
  output = output.replace(
    /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:alt" content="${escapeXml(metadata.ogImageAlt)}" />`
  );

  // Twitter
  output = output.replace(
    /<meta\s+name="twitter:site"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:site" content="${escapeXml(metadata.twitterSite)}" />`
  );
  output = output.replace(
    /<meta\s+name="twitter:creator"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:creator" content="${escapeXml(metadata.twitterCreator)}" />`
  );
  output = output.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeXml(metadata.twitterTitle)}" />`
  );
  output = output.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeXml(metadata.twitterDescription)}" />`
  );
  output = output.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeXml(metadata.twitterImage)}" />`
  );
  output = output.replace(
    /<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image:alt" content="${escapeXml(metadata.twitterImageAlt)}" />`
  );

  // Favicon
  output = output.replace(
    /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="icon" href="${escapeXml(metadata.faviconUrl)}" />`
  );

  // Schema.org JSON-LD
  output = output.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="pitchengine-dynamic-schema" type="application/ld+json">\n${JSON.stringify(metadata.schemaJson, null, 2)}\n  </script>`
  );

  return output;
}
