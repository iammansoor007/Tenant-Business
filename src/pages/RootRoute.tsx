import React, { useState, useEffect } from 'react';
import Index from './Index';
import AgencyHome from './AgencyHome';
import { TenantProvider } from '../context/TenantContext';
import { fetchTenantByDomain } from '../lib/apiClient';
import { Tenant } from '../types/tenant';

export const RootRoute: React.FC = () => {
  const [matchedTenant, setMatchedTenant] = useState<Tenant | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    return host !== 'localhost' && host !== '127.0.0.1';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hostname = window.location.hostname.toLowerCase();

    // Fast path: local development is always agency home on root path
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      setIsCheckingDomain(false);
      return;
    }

    let isMounted = true;
    fetchTenantByDomain(hostname)
      .then((tenant) => {
        if (!isMounted) return;
        setMatchedTenant(tenant);
      })
      .catch((err) => {
        console.warn('Error checking domain routing:', err);
      })
      .finally(() => {
        if (isMounted) setIsCheckingDomain(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isCheckingDomain) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-slate-400 font-sans">
        <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3" />
        <p className="text-xs tracking-widest uppercase text-slate-500 font-medium">Loading Site...</p>
      </div>
    );
  }

  // If a client's dedicated custom domain was detected, show their website
  if (matchedTenant) {
    return (
      <TenantProvider forcedSlug={matchedTenant.slug}>
        <Index />
      </TenantProvider>
    );
  }

  // Check if link was accessed via query param (e.g. yourdomain.com/?client=apex-roofing or ?pitch=apex-roofing)
  const querySlug = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('client') ||
       new URLSearchParams(window.location.search).get('pitch') ||
       new URLSearchParams(window.location.search).get('tenant') ||
       new URLSearchParams(window.location.search).get('t'))
    : null;

  if (querySlug) {
    return (
      <TenantProvider forcedSlug={querySlug}>
        <Index />
      </TenantProvider>
    );
  }

  // Root domain on agency host: render Agency Content
  return <AgencyHome />;
};

export default RootRoute;
