import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Tenant, TenantMedia, TenantColors } from '../types/tenant';
import { fetchTenantBySlug } from '../lib/apiClient';
import defaultCompleteData from '../data/completeData.json';
import { hexToHsl, darkenHex } from '../lib/colorExtractor';
import { updateClientSeo } from '../lib/seoManager';
import { usePitchTracker } from '../lib/pitchTracker';

interface TenantContextValue {
  tenant: Tenant | null;
  completeData: Record<string, any>;
  media: TenantMedia;
  colors?: TenantColors;
  isLoading: boolean;
  isCustomTenant: boolean;
  isFlagship: boolean;
  slug: string;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  completeData: defaultCompleteData,
  media: {},
  isLoading: false,
  isCustomTenant: false,
  isFlagship: true,
  slug: 'max-quality-roofing',
});

// Helper to parse CSS custom properties from custom CSS string
function parseCssVariables(css: string): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!css) return vars;
  const regex = /(--[\w-]+)\s*:\s*([^;\}]+)/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    const key = match[1].trim();
    const val = match[2].trim();
    vars[key] = val;
  }
  return vars;
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): string {
  if (!hex || typeof hex !== 'string') return '11, 29, 51';
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return '11, 29, 51';
  const num = parseInt(c, 16);
  if (isNaN(num)) return '11, 29, 51';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export const TenantProvider: React.FC<{
  forcedSlug?: string;
  tenantSlug?: string;
  children: React.ReactNode;
}> = ({ forcedSlug, tenantSlug, children }) => {
  const params = useParams<{ clientId?: string }>();
  const querySlug = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('client') ||
       new URLSearchParams(window.location.search).get('pitch') ||
       new URLSearchParams(window.location.search).get('tenant') ||
       new URLSearchParams(window.location.search).get('t'))
    : null;
  const activeSlug = forcedSlug || tenantSlug || params.clientId || querySlug || 'max-quality-roofing';
  const isCustomRoute = activeSlug !== 'max-quality-roofing';

  // Automatically track prospect link visits, time spent, device, IP, and scroll
  usePitchTracker(activeSlug);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isCustomRoute);

  useEffect(() => {
    let isMounted = true;
    if (isCustomRoute) {
      setIsLoading(true);
    }

    fetchTenantBySlug(activeSlug)
      .then((loadedTenant) => {
        if (!isMounted) return;
        setTenant(loadedTenant);
      })
      .catch((err) => {
        console.warn('Error loading tenant:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSlug]);

  // Inject Custom Colors & CSS dynamically
  useEffect(() => {
    const colors = tenant?.colors;
    const customCss = tenant?.customCss || colors?.customCss || '';
    const root = document.documentElement;
    const parsedCustomVars = parseCssVariables(customCss);

    // Pasted CSS variables take top priority over color picker values
    const effectivePrimary = parsedCustomVars['--primary-hex'] || parsedCustomVars['--primary-color'] || (parsedCustomVars['--primary']?.startsWith('#') ? parsedCustomVars['--primary'] : undefined) || colors?.primary;
    const effectivePrimaryHover = parsedCustomVars['--primary-hover-hex'] || parsedCustomVars['--primary-hover'] || colors?.primaryHover;
    const effectiveCta = parsedCustomVars['--cta-hex'] || parsedCustomVars['--cta'] || effectivePrimaryHover || effectivePrimary;
    const effectiveSecondary = parsedCustomVars['--secondary-hex'] || parsedCustomVars['--secondary-color'] || (parsedCustomVars['--secondary']?.startsWith('#') ? parsedCustomVars['--secondary'] : undefined) || colors?.secondary;
    const effectiveAccent = parsedCustomVars['--accent-hex'] || parsedCustomVars['--accent-color'] || (parsedCustomVars['--accent']?.startsWith('#') ? parsedCustomVars['--accent'] : undefined) || colors?.accent;
    const effectiveNavy = parsedCustomVars['--navy-color'] || parsedCustomVars['--navy-hex'] || (effectivePrimary ? darkenHex(effectivePrimary, 35) : undefined);
    const effectiveNavySurface = parsedCustomVars['--navy-surface'] || (effectivePrimary ? darkenHex(effectivePrimary, 20) : undefined);
    const effectiveDarkBg = parsedCustomVars['--dark-bg'] || parsedCustomVars['--background-hex'];
    const effectiveCardBg = parsedCustomVars['--card-bg'];
    const effectiveBorder = parsedCustomVars['--border-color'] || parsedCustomVars['--border'];
    const effectiveHeading = parsedCustomVars['--heading-color'];
    const effectiveBodyText = parsedCustomVars['--body-text-color'];

    if (effectivePrimary) {
      const primaryHsl = hexToHsl(effectivePrimary);
      root.style.setProperty('--primary-hex', effectivePrimary);
      root.style.setProperty('--primary-rgb', hexToRgb(effectivePrimary));
      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--ring', primaryHsl);
    } else {
      root.style.removeProperty('--primary-hex');
      root.style.removeProperty('--primary-rgb');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--ring');
    }

    if (effectivePrimaryHover) {
      root.style.setProperty('--primary-hover-hex', effectivePrimaryHover);
      root.style.setProperty('--primary-hover-rgb', hexToRgb(effectivePrimaryHover));
    } else if (effectivePrimary) {
      const fallbackHover = darkenHex(effectivePrimary, 15);
      root.style.setProperty('--primary-hover-hex', fallbackHover);
      root.style.setProperty('--primary-hover-rgb', hexToRgb(fallbackHover));
    } else {
      root.style.removeProperty('--primary-hover-hex');
      root.style.removeProperty('--primary-hover-rgb');
    }

    if (effectiveCta) {
      root.style.setProperty('--cta-hex', effectiveCta);
      root.style.setProperty('--cta-rgb', hexToRgb(effectiveCta));
    } else {
      root.style.removeProperty('--cta-hex');
      root.style.removeProperty('--cta-rgb');
    }

    if (effectiveSecondary) {
      const secondaryHsl = hexToHsl(effectiveSecondary);
      root.style.setProperty('--secondary-hex', effectiveSecondary);
      root.style.setProperty('--secondary-rgb', hexToRgb(effectiveSecondary));
      root.style.setProperty('--secondary', secondaryHsl);
    } else {
      root.style.removeProperty('--secondary-hex');
      root.style.removeProperty('--secondary-rgb');
      root.style.removeProperty('--secondary');
    }

    if (effectiveAccent) {
      const accentHsl = hexToHsl(effectiveAccent);
      root.style.setProperty('--accent-hex', effectiveAccent);
      root.style.setProperty('--accent-rgb', hexToRgb(effectiveAccent));
      root.style.setProperty('--accent', accentHsl);
    } else {
      root.style.removeProperty('--accent-hex');
      root.style.removeProperty('--accent-rgb');
      root.style.removeProperty('--accent');
    }

    if (effectiveNavy) {
      root.style.setProperty('--navy-color', effectiveNavy);
      root.style.setProperty('--navy-rgb', hexToRgb(effectiveNavy));
    } else {
      root.style.removeProperty('--navy-color');
      root.style.removeProperty('--navy-rgb');
    }

    if (effectiveNavySurface) {
      root.style.setProperty('--navy-surface', effectiveNavySurface);
    } else {
      root.style.removeProperty('--navy-surface');
    }

    if (effectiveDarkBg) {
      root.style.setProperty('--dark-bg', effectiveDarkBg);
      root.style.setProperty('--section-bg', effectiveDarkBg);
      root.style.setProperty('--dark-bg-rgb', hexToRgb(effectiveDarkBg));
      root.style.setProperty('--background', hexToHsl(effectiveDarkBg));
    } else {
      root.style.removeProperty('--dark-bg');
      root.style.removeProperty('--section-bg');
      root.style.removeProperty('--dark-bg-rgb');
      root.style.removeProperty('--background');
    }

    if (effectiveCardBg) {
      root.style.setProperty('--card-bg', effectiveCardBg);
      root.style.setProperty('--card-bg-rgb', hexToRgb(effectiveCardBg));
      root.style.setProperty('--card', hexToHsl(effectiveCardBg));
    } else {
      root.style.removeProperty('--card-bg');
      root.style.removeProperty('--card-bg-rgb');
      root.style.removeProperty('--card');
    }

    if (effectiveBorder) {
      root.style.setProperty('--border-color', effectiveBorder);
      root.style.setProperty('--border-rgb', hexToRgb(effectiveBorder));
      root.style.setProperty('--border', hexToHsl(effectiveBorder));
      root.style.setProperty('--muted', hexToHsl(effectiveBorder));
    } else {
      root.style.removeProperty('--border-color');
      root.style.removeProperty('--border-rgb');
      root.style.removeProperty('--border');
      root.style.removeProperty('--muted');
    }

    if (effectiveHeading) {
      root.style.setProperty('--heading-color', effectiveHeading);
      root.style.setProperty('--foreground', hexToHsl(effectiveHeading));
    } else {
      root.style.removeProperty('--heading-color');
      root.style.removeProperty('--foreground');
    }

    if (effectiveBodyText) {
      root.style.setProperty('--body-text-color', effectiveBodyText);
    } else {
      root.style.removeProperty('--body-text-color');
    }

    // Apply any additional arbitrary CSS variables defined in customCss (e.g. font family, border-radius, etc.)
    Object.entries(parsedCustomVars).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });

    // Dynamic custom CSS style block (placed at end of head so it cascades over all other sheets)
    const styleId = 'pitchengine-dynamic-custom-css';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement | null;
    if (customCss && customCss.trim()) {
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
      }
      styleTag.innerHTML = customCss;
      document.head.appendChild(styleTag);
    } else if (styleTag) {
      styleTag.remove();
    }

    return () => {
      // Cleanup styles when unmounting or switching
      root.style.removeProperty('--primary-hex');
      root.style.removeProperty('--primary-rgb');
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-hover-hex');
      root.style.removeProperty('--primary-hover-rgb');
      root.style.removeProperty('--secondary-hex');
      root.style.removeProperty('--secondary-rgb');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--cta-hex');
      root.style.removeProperty('--cta-rgb');
      root.style.removeProperty('--accent-hex');
      root.style.removeProperty('--accent-rgb');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--navy-color');
      root.style.removeProperty('--navy-rgb');
      root.style.removeProperty('--navy-surface');
      root.style.removeProperty('--dark-bg');
      root.style.removeProperty('--section-bg');
      root.style.removeProperty('--dark-bg-rgb');
      root.style.removeProperty('--background');
      root.style.removeProperty('--card-bg');
      root.style.removeProperty('--card-bg-rgb');
      root.style.removeProperty('--card');
      root.style.removeProperty('--border-color');
      root.style.removeProperty('--border-rgb');
      root.style.removeProperty('--border');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--heading-color');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--body-text-color');
      root.style.removeProperty('--ring');
      const tag = document.getElementById(styleId);
      if (tag) tag.remove();
    };
  }, [tenant]);

  // Use tenant's completeData directly when custom tenant is active
  const mergedCompleteData = useMemo(() => {
    if (tenant?.completeData) return tenant.completeData;
    return defaultCompleteData;
  }, [tenant]);

  const media: TenantMedia = useMemo(() => {
    const raw = tenant?.media || {};
    const cd = (mergedCompleteData || {}) as any;
    const cdMedia = cd.media || {};

    const resolvedLogo =
      raw.logo ||
      raw.logoUrl ||
      cd.navbar?.logo ||
      cd.navbar?.logoUrl ||
      cd.logo ||
      cdMedia.logo ||
      '';

    const resolvedHeroBg =
      raw.heroBg ||
      raw.hero_bg ||
      raw.heroImage ||
      raw.backgroundImage ||
      raw.bg ||
      cd.hero?.heroBg ||
      cd.hero?.image ||
      cd.hero?.heroImage ||
      cd.hero?.backgroundImage ||
      cd.hero?.bg ||
      cdMedia.heroBg ||
      '';

    const resolvedAbout =
      raw.aboutImage ||
      raw.about_image ||
      raw.about ||
      cd.about?.image ||
      cd.about?.aboutImage ||
      cdMedia.aboutImage ||
      '';

    const resolvedFounder =
      raw.founderImage ||
      raw.founder_image ||
      raw.ceoImage ||
      raw.ownerImage ||
      cd.leadership?.ceo?.image ||
      cd.leadership?.founderImage ||
      cd.leadership?.image ||
      cdMedia.founderImage ||
      '';

    const resolvedHowWeWork =
      raw.howWeWorkVector ||
      raw.vector ||
      cd.howWeWork?.vector ||
      cd.howWeWork?.image ||
      cdMedia.howWeWorkVector ||
      '';

    const resolvedFaq =
      raw.faqVector ||
      raw.vector ||
      cd.faq?.vector ||
      cd.faq?.image ||
      cdMedia.faqVector ||
      '';

    return {
      ...cdMedia,
      ...raw,
      ...(resolvedLogo ? { logo: resolvedLogo } : {}),
      ...(resolvedHeroBg ? { heroBg: resolvedHeroBg } : {}),
      ...(resolvedAbout ? { aboutImage: resolvedAbout } : {}),
      ...(resolvedFounder ? { founderImage: resolvedFounder } : {}),
      ...(resolvedHowWeWork ? { howWeWorkVector: resolvedHowWeWork } : {}),
      ...(resolvedFaq ? { faqVector: resolvedFaq } : {}),
    };
  }, [tenant, mergedCompleteData]);

  // ─── DYNAMIC CLIENT SEO & METADATA SYNCHRONIZATION ───
  // Automatically keeps 100% of Primary SEO, Canonical, OG, Twitter, Favicon, and Schema.org in sync
  useEffect(() => {
    updateClientSeo(tenant, mergedCompleteData, media, activeSlug);
  }, [tenant, mergedCompleteData, media, activeSlug]);

  const isFlagship = !isCustomRoute && (!tenant || tenant.slug === 'max-quality-roofing');

  const value = useMemo(
    () => ({
      tenant,
      completeData: mergedCompleteData,
      media,
      colors: tenant?.colors,
      isLoading,
      isCustomTenant: (!!tenant && tenant.slug !== 'max-quality-roofing') || isCustomRoute,
      isFlagship,
      slug: activeSlug,
    }),
    [tenant, mergedCompleteData, media, isLoading, isCustomRoute, isFlagship, activeSlug]
  );

  // PREVENT FLASH OF ROOT DATA: If on a custom client route and still loading, show clean light loader
  if (isCustomRoute && isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 select-none font-sans">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 animate-ping" />
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">
          Loading Pitch Presentation...
        </p>
      </div>
    );
  }

  // PREVENT FALLBACK: If on a custom client route and tenant was NOT found, show 404 instead of root site!
  if (isCustomRoute && !isLoading && !tenant) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 p-4 text-center select-none font-sans">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-600 font-bold font-mono text-xl shadow-sm">
          404
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Pitch Not Found</h1>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          No client pitch was found for &ldquo;<span className="text-blue-600 font-mono font-medium">{activeSlug}</span>&rdquo;.
        </p>
        <a
          href="/platform"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm"
        >
          Open Agency Platform
        </a>
      </div>
    );
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

// ─── HOOKS ───
export function useTenant() {
  return useContext(TenantContext);
}

export function useTenantData() {
  const { completeData } = useContext(TenantContext);
  return completeData;
}

export function useTenantMedia(): TenantMedia {
  const { media } = useContext(TenantContext);
  return media;
}
