import { describe, it, expect, beforeEach } from 'vitest';
import { generateSeoMetadata, updateClientSeo, injectSeoIntoHtml } from '../seoManager';
import { Tenant } from '../../types/tenant';

describe('seoManager', () => {
  beforeEach(() => {
    // Reset document head for clean DOM tests
    document.head.innerHTML = `
      <title>Max Quality Roofing | Architectural Asphalt Shingle Specialist | Great Falls, MT</title>
      <meta name="description" content="Default description" />
      <meta name="keywords" content="default, keywords" />
      <meta name="author" content="Max Quality Roofing" />
      <link rel="canonical" href="https://maxqualityroofing.com/" />
      <meta name="geo.region" content="US-MT" />
      <meta name="geo.placename" content="Great Falls, MT" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Max Quality Roofing" />
      <meta property="og:title" content="Default OG Title" />
      <meta property="og:description" content="Default OG Desc" />
      <meta property="og:image" content="/logo.webp" />
      <meta property="og:url" content="https://maxqualityroofing.com/" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@MaxQualityRoof" />
      <meta name="twitter:title" content="Default Twitter Title" />
      <meta name="twitter:description" content="Default Twitter Desc" />
      <meta name="twitter:image" content="/logo.webp" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <script type="application/ld+json">{"@type": "Default"}</script>
    `;
  });

  describe('generateSeoMetadata', () => {
    it('generates flagship metadata for root/default client', () => {
      const metadata = generateSeoMetadata(
        null,
        undefined,
        undefined,
        'max-quality-roofing',
        'https://maxqualityroofing.com'
      );

      expect(metadata.canonicalUrl).toBe('https://maxqualityroofing.com/');
      expect(metadata.title).toContain('Max Quality Roofing');
      expect(metadata.ogSiteName).toBe('Max Quality Roofing');
      expect(metadata.geoRegion).toBe('US-MT');
      expect(metadata.geoPlacename).toContain('Great Falls');
      expect(metadata.schemaJson['@graph'][0]['@type']).toBe('RoofingContractor');
      expect(metadata.schemaJson['@graph'][0].name).toBe('Max Quality Roofing');
    });

    it('generates 100% client-specific metadata for a custom tenant', () => {
      const customTenant: Tenant = {
        slug: 'austin-elite-roofing',
        name: 'Austin Elite Roofing',
        status: 'active',
        media: {
          logo: '/clients/austin/logo.webp',
          heroBg: '/clients/austin/hero.webp',
        },
        completeData: {
          hero: {
            headlines: ['Austin Elite Roofing.', 'Engineered For Hill Country Storms.'],
            description: 'Premier residential and commercial roofing contractor serving Austin, TX and surrounding Travis County communities.',
          },
          footer: {
            contact: {
              phone: '(512) 555-0199',
              email: 'info@austineliteroofing.com',
            },
            serviceAreas: {
              items: ['Austin, TX', 'Round Rock, TX', 'Travis County'],
            },
          },
          services: {
            services: [
              { title: 'Metal Standing Seam' },
              { title: 'Architectural Shingles' },
              { title: 'Storm Damage Restoration' },
            ],
          },
        },
      };

      const metadata = generateSeoMetadata(
        customTenant,
        customTenant.completeData,
        customTenant.media,
        customTenant.slug,
        'https://pitchengine.com'
      );

      // Check client-specific URL, Title, and Geo
      expect(metadata.canonicalUrl).toBe('https://pitchengine.com/austin-elite-roofing');
      expect(metadata.title).toContain('Austin Elite Roofing');
      expect(metadata.title).toContain('Austin, TX');
      expect(metadata.geoRegion).toBe('US-TX');
      expect(metadata.geoPlacename).toContain('Austin');

      // Check client-specific OG & Twitter tags
      expect(metadata.ogSiteName).toBe('Austin Elite Roofing');
      expect(metadata.ogTitle).toContain('Austin Elite Roofing');
      expect(metadata.ogUrl).toBe('https://pitchengine.com/austin-elite-roofing');
      expect(metadata.ogImage).toBe('https://pitchengine.com/clients/austin/hero.webp');
      expect(metadata.twitterTitle).toContain('Austin Elite Roofing');
      expect(metadata.twitterSite).toBe('@AustinEliteRoofing');

      // Check client-specific Schema.org JSON-LD
      const schemaBusiness = metadata.schemaJson['@graph'][0];
      expect(schemaBusiness.name).toBe('Austin Elite Roofing');
      expect(schemaBusiness.telephone).toBe('(512) 555-0199');
      expect(schemaBusiness.email).toBe('info@austineliteroofing.com');
      expect(schemaBusiness.address.addressLocality).toBe('Austin');
      expect(schemaBusiness.address.addressRegion).toBe('TX');
      expect(schemaBusiness.hasOfferCatalog.itemListElement).toHaveLength(3);
      expect(schemaBusiness.hasOfferCatalog.itemListElement[0].itemOffered.name).toBe('Metal Standing Seam');
    });

    it('honors explicit custom SEO overrides when configured', () => {
      const customTenant: Tenant = {
        slug: 'custom-seo-roofing',
        name: 'Custom SEO Roofing',
        media: {},
        completeData: {},
        seo: {
          title: 'Custom Title Override - Best Roofers in Town',
          description: 'Custom description tailored for Google CTR and conversion optimization.',
          keywords: 'custom, keywords, override, test',
          twitterHandle: '@CustomRoofX',
          geoPlacename: 'Miami, FL',
        },
      };

      const metadata = generateSeoMetadata(
        customTenant,
        customTenant.completeData,
        customTenant.media,
        customTenant.slug,
        'https://pitchengine.com'
      );

      expect(metadata.title).toBe('Custom Title Override - Best Roofers in Town');
      expect(metadata.description).toBe('Custom description tailored for Google CTR and conversion optimization.');
      expect(metadata.keywords).toBe('custom, keywords, override, test');
      expect(metadata.twitterSite).toBe('@CustomRoofX');
      expect(metadata.geoPlacename).toBe('Miami, FL');
    });

    it('guarantees zero flagship leaks when generating metadata for minimal custom tenant without location or phone', () => {
      const minimalTenant: Tenant = {
        slug: 'minimal-custom-client',
        name: 'Minimal Custom Roofing',
        media: {},
        completeData: {},
      };

      const metadata = generateSeoMetadata(
        minimalTenant,
        minimalTenant.completeData,
        minimalTenant.media,
        minimalTenant.slug,
        'https://pitchengine.com'
      );

      // Verify no flagship leaks in title, geo, or schema
      expect(metadata.title).not.toContain('Great Falls');
      expect(metadata.title).not.toContain('MT');
      expect(metadata.title).toBe('Minimal Custom Roofing | Architectural Asphalt Shingle Specialist');
      expect(metadata.geoPlacename).not.toContain('Great Falls');
      expect(metadata.geoPosition).toBe('');
      expect(metadata.icbm).toBe('');

      // Verify no flagship telephone or email
      const businessSchema = metadata.schemaJson['@graph'][0];
      expect(businessSchema.telephone).not.toContain('406');
      expect(businessSchema.telephone).not.toContain('217-1720');
      expect(businessSchema.email).not.toContain('maxqualityroofing');
      expect(businessSchema.geo).toBeUndefined();
      expect(businessSchema.address).toBeUndefined();
    });
  });

  describe('updateClientSeo (Browser DOM mutation)', () => {
    it('mutates all head meta tags, canonical link, and JSON-LD schema dynamically', () => {
      const customTenant: Tenant = {
        slug: 'phoenix-roof-pros',
        name: 'Phoenix Roof Pros',
        media: {
          logo: '/phoenix-logo.png',
        },
        completeData: {
          footer: {
            serviceAreas: { items: ['Phoenix, AZ'] },
            contact: { phone: '(602) 555-1234' },
          },
        },
      };

      updateClientSeo(customTenant, customTenant.completeData, customTenant.media, 'phoenix-roof-pros');

      // 1. Title
      expect(document.title).toContain('Phoenix Roof Pros');

      // 2. Canonical
      const canonical = document.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toContain('/phoenix-roof-pros');

      // 3. Meta Description & Keywords
      const desc = document.querySelector('meta[name="description"]');
      expect(desc?.getAttribute('content')).toContain('Phoenix Roof Pros');

      // 4. OpenGraph
      const ogSiteName = document.querySelector('meta[property="og:site_name"]');
      expect(ogSiteName?.getAttribute('content')).toBe('Phoenix Roof Pros');

      const ogTitle = document.querySelector('meta[property="og:title"]');
      expect(ogTitle?.getAttribute('content')).toContain('Phoenix Roof Pros');

      // 5. Twitter Card
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      expect(twitterTitle?.getAttribute('content')).toContain('Phoenix Roof Pros');

      // 6. Favicon
      const favicon = document.querySelector('link[rel="icon"]');
      expect(favicon?.getAttribute('href')).toBe('/phoenix-logo.png');

      // 7. Schema.org JSON-LD
      const schemaScript = document.getElementById('pitchengine-dynamic-schema');
      expect(schemaScript).toBeInTheDocument();
      const parsedSchema = JSON.parse(schemaScript?.textContent || '{}');
      expect(parsedSchema['@graph'][0].name).toBe('Phoenix Roof Pros');
    });
  });

  describe('injectSeoIntoHtml (Server/Crawler HTML Pre-rendering)', () => {
    it('replaces all static tags in index.html with client-specific metadata', () => {
      const rawHtml = `
        <!doctype html>
        <html>
        <head>
          <title>Max Quality Roofing | Architectural Asphalt Shingle Specialist | Great Falls, MT</title>
          <meta name="description" content="Old max description" />
          <meta name="keywords" content="old, max, keywords" />
          <meta name="author" content="Max Quality Roofing" />
          <link rel="canonical" href="https://maxqualityroofing.com/" />
          <meta name="geo.region" content="US-MT" />
          <meta name="geo.placename" content="Great Falls, MT" />
          <meta property="og:site_name" content="Max Quality Roofing" />
          <meta property="og:title" content="Max Quality Roofing | Title" />
          <meta property="og:description" content="Old OG desc" />
          <meta property="og:image" content="/logo.webp" />
          <meta property="og:url" content="https://maxqualityroofing.com/" />
          <meta name="twitter:site" content="@MaxQualityRoof" />
          <meta name="twitter:title" content="Old Twitter Title" />
          <meta name="twitter:description" content="Old Twitter Desc" />
          <meta name="twitter:image" content="/logo.webp" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <script type="application/ld+json">{"@type": "OldSchema"}</script>
        </head>
        <body><div id="root"></div></body>
        </html>
      `;

      const metadata = generateSeoMetadata(
        {
          slug: 'denver-roof-specialists',
          name: 'Denver Roof Specialists',
          media: { logo: '/denver-logo.webp' },
          completeData: {
            footer: { serviceAreas: { items: ['Denver, CO'] } },
          },
        } as any,
        undefined,
        undefined,
        'denver-roof-specialists',
        'https://pitchengine.com'
      );

      const injectedHtml = injectSeoIntoHtml(rawHtml, metadata);

      // Verify replacements
      expect(injectedHtml).toContain('<title>Denver Roof Specialists');
      expect(injectedHtml).toContain('https://pitchengine.com/denver-roof-specialists');
      expect(injectedHtml).toContain('Denver Roof Specialists');
      expect(injectedHtml).toContain('US-CO');
      expect(injectedHtml).toContain('Denver, CO');
      expect(injectedHtml).toContain('Denver Roof Specialists Services Catalog');
      expect(injectedHtml).not.toContain('https://maxqualityroofing.com/');
    });
  });
});
