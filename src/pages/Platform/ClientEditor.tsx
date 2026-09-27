import React, { useState, useEffect, useMemo } from 'react';
import { Tenant } from '../../types/tenant';
import { ImageUploader } from './ImageUploader';
import { darkenHex } from '../../lib/colorExtractor';
import { getDefaultCompleteDataJson } from '../../lib/templateBuilder';
import { Save, ExternalLink, Code, Palette, Image as ImageIcon, AlertTriangle, ArrowLeft, Phone, Mail, MapPin, Check, Globe, Share2, Search, Sparkles } from 'lucide-react';
import { generateSeoMetadata } from '../../lib/seoManager';

interface ClientEditorProps {
  initialTenant?: Tenant | null;
  onSave: (tenant: Tenant) => Promise<void>;
  onCancel: () => void;
}

export const ClientEditor: React.FC<ClientEditorProps> = ({ initialTenant, onSave, onCancel }) => {
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(initialTenant?.phone || '');
  const [email, setEmail] = useState(initialTenant?.email || '');
  const [location, setLocation] = useState(initialTenant?.location || '');
  const [status, setStatus] = useState<'active' | 'draft' | 'pitched'>('active');

  // Media Assets
  const [media, setMedia] = useState<Record<string, string>>({
    logo: '',
    heroBg: '',
    aboutImage: '',
    founderImage: '',
    servicesCard: '',
    vector: '',
    howWeWorkVector: '',
    faqVector: '',
  });

  // Colors & Custom CSS
  const [primaryColor, setPrimaryColor] = useState('#0B1D33');
  const [primaryHoverColor, setPrimaryHoverColor] = useState('#12365A');
  const [secondaryColor, setSecondaryColor] = useState('#344B63');
  const [accentColor, setAccentColor] = useState('#AEB8C2');
  const [customCss, setCustomCss] = useState('');
  const [colorNotice, setColorNotice] = useState<string | null>(null);

  // SEO & Social Meta
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoTwitterHandle, setSeoTwitterHandle] = useState('');
  const [seoGeoPlacename, setSeoGeoPlacename] = useState('');
  const [seoNotice, setSeoNotice] = useState<string | null>(null);

  // CompleteData JSON Editor
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'media' | 'theme' | 'seo' | 'json'>('media');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialTenant) {
      setSlug(initialTenant.slug);
      setName(initialTenant.name);
      setPhone(initialTenant.phone || '');
      setEmail(initialTenant.email || '');
      setLocation(initialTenant.location || '');
      setStatus(initialTenant.status || 'active');
      setMedia({
        logo: initialTenant.media?.logo || '',
        heroBg: initialTenant.media?.heroBg || '',
        aboutImage: initialTenant.media?.aboutImage || '',
        founderImage: initialTenant.media?.founderImage || '',
        servicesCard: initialTenant.media?.servicesCard || initialTenant.media?.serviceCard1 || '',
        vector: initialTenant.media?.vector || '',
        howWeWorkVector: initialTenant.media?.howWeWorkVector || '',
        faqVector: initialTenant.media?.faqVector || '',
        ...(initialTenant.media || {}),
      });
      setPrimaryColor(initialTenant.colors?.primary || '#0B1D33');
      setPrimaryHoverColor(initialTenant.colors?.primaryHover || '#12365A');
      setSecondaryColor(initialTenant.colors?.secondary || '#344B63');
      setAccentColor(initialTenant.colors?.accent || '#AEB8C2');
      setCustomCss(initialTenant.customCss || initialTenant.colors?.customCss || '');
      setSeoTitle(initialTenant.seo?.title || '');
      setSeoDescription(initialTenant.seo?.description || '');
      setSeoKeywords(initialTenant.seo?.keywords || '');
      setSeoTwitterHandle(initialTenant.seo?.twitterHandle || '');
      setSeoGeoPlacename(initialTenant.seo?.geoPlacename || '');
      setJsonText(JSON.stringify(initialTenant.completeData, null, 2));
    } else {
      // New Client Defaults
      setSlug('');
      setName('');
      setPhone('');
      setEmail('');
      setLocation('');
      setSeoTitle('');
      setSeoDescription('');
      setSeoKeywords('');
      setSeoTwitterHandle('');
      setSeoGeoPlacename('');
      setJsonText(getDefaultCompleteDataJson());
    }
  }, [initialTenant]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialTenant) {
      const generatedSlug = val.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleLogoColorExtracted = (hex: string) => {
    const hoverHex = darkenHex(hex, 18);
    setPrimaryColor(hex);
    setPrimaryHoverColor(hoverHex);

    // Sync into custom CSS variables so CSS pasting and colors are in sync
    const generatedRootCss = `:root {\n  --primary-hex: ${hex};\n  --primary-hover-hex: ${hoverHex};\n  --cta-hex: ${hoverHex};\n}`;
    setCustomCss((prev) => {
      if (!prev || prev.includes('--primary-hex')) {
        return generatedRootCss;
      }
      return `${generatedRootCss}\n\n${prev}`;
    });

    setColorNotice(`Applied logo color ${hex} to brand palette and CSS!`);
    setTimeout(() => setColorNotice(null), 3500);
  };

  // Helper to parse CSS custom properties when user pastes CSS
  const handleCustomCssChange = (val: string) => {
    setCustomCss(val);
    if (!val) return;

    const primaryMatch = val.match(/--primary(?:-hex)?\s*:\s*([#\w]+)/i);
    if (primaryMatch && primaryMatch[1].startsWith('#')) {
      setPrimaryColor(primaryMatch[1]);
    }

    const hoverMatch = val.match(/--(?:primary-hover(?:-hex)?|cta(?:-hex)?)\s*:\s*([#\w]+)/i);
    if (hoverMatch && hoverMatch[1].startsWith('#')) {
      setPrimaryHoverColor(hoverMatch[1]);
    }

    const secondaryMatch = val.match(/--secondary(?:-hex)?\s*:\s*([#\w]+)/i);
    if (secondaryMatch && secondaryMatch[1].startsWith('#')) {
      setSecondaryColor(secondaryMatch[1]);
    }

    const accentMatch = val.match(/--accent(?:-hex)?\s*:\s*([#\w]+)/i);
    if (accentMatch && accentMatch[1].startsWith('#')) {
      setAccentColor(accentMatch[1]);
    }
  };

  // Extract all services defined in current JSON (any number of services!)
  const detectedServices = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const list = parsed?.services?.services;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((s: any, idx: number) => {
          const rawNum = s.number !== undefined && s.number !== null ? String(s.number) : String(idx + 1);
          const numPad = !isNaN(Number(rawNum)) ? rawNum.padStart(2, '0') : rawNum;
          return {
            index: idx,
            number: numPad,
            rawNumber: rawNum,
            title: s.title || `Service ${idx + 1}`,
            tag: s.tag || '',
            image: s.image || '',
            key: `service_${numPad}`,
          };
        });
      }
    } catch {}
    return [
      { index: 0, number: '01', rawNumber: '01', title: 'Architectural Shingles', tag: 'Specialty', image: '', key: 'service_01' },
      { index: 1, number: '02', rawNumber: '02', title: 'Full Roof Replacement', tag: 'Replacement', image: '', key: 'service_02' },
      { index: 2, number: '03', rawNumber: '03', title: 'Roof Repair & Maintenance', tag: 'Emergency', image: '', key: 'service_03' },
      { index: 3, number: '04', rawNumber: '04', title: 'Gutters & Downspouts', tag: 'Protection', image: '', key: 'service_04' },
    ];
  }, [jsonText]);

  const handleServiceCardImageChange = (idx: number, serviceNum: string, dataUrl: string) => {
    const rawNum = String(serviceNum);
    const numPad = !isNaN(Number(rawNum)) ? rawNum.padStart(2, '0') : rawNum;

    setMedia((prev) => ({
      ...prev,
      [`service_${numPad}`]: dataUrl,
      [`service_${rawNum}`]: dataUrl,
      [`serviceCard_${idx + 1}`]: dataUrl,
      [`serviceCard${idx + 1}`]: dataUrl,
      ...(idx === 0 ? { servicesCard: dataUrl, serviceCard1: dataUrl } : {}),
      ...(idx === 1 ? { serviceCard2: dataUrl } : {}),
      ...(idx === 2 ? { serviceCard3: dataUrl } : {}),
      ...(idx === 3 ? { serviceCard4: dataUrl } : {}),
    }));

    // Also update the image property inside completeData JSON directly
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed?.services?.services && Array.isArray(parsed.services.services)) {
        parsed.services.services = parsed.services.services.map((s: any, i: number) => {
          if (
            i === idx ||
            String(s.number) === rawNum ||
            String(s.number) === numPad ||
            (!isNaN(Number(s.number)) && String(s.number).padStart(2, '0') === numPad)
          ) {
            return { ...s, image: dataUrl };
          }
          return s;
        });
        setJsonText(JSON.stringify(parsed, null, 2));
      }
    } catch {}
  };

  const validateJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonError(null);
      return parsed;
    } catch (err: any) {
      setJsonError(err.message);
      return null;
    }
  };

  // Inspect current parsed JSON for quick preview
  const jsonSummary = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText);
      return {
        phone: parsed?.footer?.contact?.phone || parsed?.contact?.phone || 'Not set',
        email: parsed?.footer?.contact?.email || parsed?.contact?.email || 'Not set',
        city: parsed?.footer?.company?.subTitle || parsed?.city || 'Not set',
      };
    } catch {
      return null;
    }
  }, [jsonText]);

  // Live SEO Metadata calculation for previews
  const liveSeo = useMemo(() => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(jsonText);
    } catch {}

    const dummyTenant: any = {
      slug: slug || 'client-pitch',
      name: name || 'Client Business Name',
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      location: location.trim() || undefined,
      media,
      seo: {
        title: seoTitle.trim() || undefined,
        description: seoDescription.trim() || undefined,
        keywords: seoKeywords.trim() || undefined,
        twitterHandle: seoTwitterHandle.trim() || undefined,
        geoPlacename: seoGeoPlacename.trim() || undefined,
      },
      completeData: parsed,
    };

    return generateSeoMetadata(
      dummyTenant,
      parsed,
      media,
      slug || 'client-pitch',
      typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://maxqualityroofing.com'
    );
  }, [slug, name, phone, email, location, media, seoTitle, seoDescription, seoKeywords, seoTwitterHandle, seoGeoPlacename, jsonText]);

  const handleAutoGenerateSeo = () => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(jsonText);
    } catch {}

    const auto = generateSeoMetadata(
      { slug, name, phone: phone.trim() || undefined, email: email.trim() || undefined, location: location.trim() || undefined, media, completeData: parsed } as any,
      parsed,
      media,
      slug
    );

    setSeoTitle(auto.title);
    setSeoDescription(auto.description);
    setSeoKeywords(auto.keywords);
    setSeoTwitterHandle(auto.twitterSite);
    setSeoGeoPlacename(auto.geoPlacename);
    setSeoNotice('Auto-generated SEO metadata from client brand & location!');
    setTimeout(() => setSeoNotice(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      alert('Client URL slug is required');
      return;
    }
    if (!name.trim()) {
      alert('Client business name is required');
      return;
    }

    const parsedData = validateJson();
    if (!parsedData) {
      alert(`Invalid JSON: ${jsonError}`);
      setActiveTab('json');
      return;
    }

    setIsSaving(true);
    try {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
      const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://maxqualityroofing.com';
      const isClientFlagship = cleanSlug === 'max-quality-roofing';

      const fallbackPhone = parsedData?.footer?.contact?.phone || parsedData?.contact?.phone || initialTenant?.phone || '';
      const isFlagshipPhone = fallbackPhone.includes('406') && fallbackPhone.includes('217-1720');
      const safePhone = phone.trim() || (!isClientFlagship && isFlagshipPhone ? '' : fallbackPhone);

      const fallbackEmail = parsedData?.footer?.contact?.email || parsedData?.contact?.email || initialTenant?.email || '';
      const isFlagshipEmail = fallbackEmail.includes('maxqualityroofing');
      const safeEmail = email.trim() || (!isClientFlagship && isFlagshipEmail ? '' : fallbackEmail);

      const fallbackLocation = parsedData?.footer?.company?.subTitle || parsedData?.footer?.serviceAreas?.items?.[0] || initialTenant?.location || '';
      const isFlagshipLocation = fallbackLocation.includes('Great Falls') || fallbackLocation.includes('Cascade County');
      const safeLocation = location.trim() || (!isClientFlagship && isFlagshipLocation ? '' : fallbackLocation);

      const tenantToSave: Tenant = {
        slug: cleanSlug,
        name: name.trim(),
        phone: safePhone,
        email: safeEmail,
        location: safeLocation,
        status,
        media,
        colors: {
          primary: primaryColor,
          primaryHover: primaryHoverColor,
          secondary: secondaryColor,
          accent: accentColor,
          customCss,
        },
        customCss,
        seo: {
          title: seoTitle.trim() || undefined,
          description: seoDescription.trim() || undefined,
          keywords: seoKeywords.trim() || undefined,
          twitterHandle: seoTwitterHandle.trim() || undefined,
          geoPlacename: seoGeoPlacename.trim() || undefined,
          canonicalUrl: `${origin}/${cleanSlug}`,
        },
        completeData: parsedData,
      };

      await onSave(tenantToSave);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm max-w-5xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Client List
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {initialTenant ? `Edit Client: ${initialTenant.name}` : 'Create New Client Pitch'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure client identity, branding assets, custom colors, and JSON website data.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-mono font-medium border border-slate-200 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Preview: /{slug}
            </a>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Core Slug & Name */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Client Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Apex Roofing Pros"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pitch URL Slug *
            </label>
            <div className="flex items-center">
              <span className="bg-slate-100 text-slate-500 px-2.5 py-2 rounded-l-lg text-xs font-mono border border-r-0 border-slate-300">
                /
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                placeholder="apex-roofing"
                className="w-full bg-white border border-slate-300 rounded-r-lg px-3 py-2 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pitch Status
            </label>
            <select
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            >
              <option value="active">Active (Ready to Pitch)</option>
              <option value="pitched">Pitched</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Client Direct Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. (555) 234-5678"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Client Direct Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. info@apexroofing.com"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Service City / Area
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Austin, TX"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs transition-colors border-b-2 ${
              activeTab === 'media'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Branding Assets & Services ({7 + detectedServices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs transition-colors border-b-2 ${
              activeTab === 'theme'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Colors & Custom CSS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs transition-colors border-b-2 ${
              activeTab === 'seo'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> SEO & Social Meta
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs transition-colors border-b-2 ${
              activeTab === 'json'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Complete Data JSON
          </button>
        </div>

        {/* TAB 1: BRANDING IMAGES */}
        {activeTab === 'media' && (
          <div className="space-y-8">
            <p className="text-xs text-slate-500">
              Upload custom images and vector graphics for this client. If left blank, the website automatically falls back to default high-res stock assets.
            </p>

            {/* Section 1: Core Brand Assets */}
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">Core Brand Imagery</h3>
                <p className="text-xs text-slate-500">
                  Client logo, hero background, and team showcase imagery.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ImageUploader
                  label="Logo"
                  sublabel="Primary client logo (auto-extracts colors!)"
                  value={media.logo}
                  onChange={(val) => setMedia({ ...media, logo: val })}
                  isLogo={true}
                  onColorExtracted={handleLogoColorExtracted}
                />

                <ImageUploader
                  label="Hero Background"
                  sublabel="Top hero banner background image"
                  value={media.heroBg}
                  onChange={(val) => setMedia({ ...media, heroBg: val })}
                />

                <ImageUploader
                  label="About Section Image"
                  sublabel="About the company showcase photo"
                  value={media.aboutImage}
                  onChange={(val) => setMedia({ ...media, aboutImage: val })}
                />

                <ImageUploader
                  label="Founder / Owner Photo"
                  sublabel="Owner / CEO leadership portrait"
                  value={media.founderImage}
                  onChange={(val) => setMedia({ ...media, founderImage: val })}
                />
              </div>
            </div>

            {/* Section 2: Section Vector Graphics */}
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-slate-900">Section Vectors & Graphics</h3>
                <p className="text-xs text-slate-500">
                  Custom vector illustrations and badges for the How We Work and FAQ CTA sections.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageUploader
                  label="How We Work Vector"
                  sublabel="Floating graphic in How We Work CTA box"
                  value={media.howWeWorkVector}
                  onChange={(val) => setMedia({ ...media, howWeWorkVector: val })}
                />

                <ImageUploader
                  label="FAQ CTA Vector Graphic"
                  sublabel="Graphic in FAQ knowledge card CTA banner"
                  value={media.faqVector}
                  onChange={(val) => setMedia({ ...media, faqVector: val })}
                />

                <ImageUploader
                  label="General Badge / Vector"
                  sublabel="Fallback decorative vector or trust badge"
                  value={media.vector}
                  onChange={(val) => setMedia({ ...media, vector: val })}
                />
              </div>
            </div>

            {/* Section 3: Dynamic Service Card Images */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Dynamic Service Card Images</h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold">
                      {detectedServices.length} {detectedServices.length === 1 ? 'Service' : 'Services'} detected in JSON
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Every service defined in your JSON is dynamically loaded here. Upload an image to replace the card graphic for that specific service.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('json')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
                >
                  <Code className="w-3.5 h-3.5" /> Edit / Add Services in JSON &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {detectedServices.map((s) => {
                  const serviceVal =
                    media[`service_${s.number}`] ||
                    media[`service_${s.rawNumber}`] ||
                    media[`serviceCard_${s.index + 1}`] ||
                    media[`serviceCard${s.index + 1}`] ||
                    (s.index === 0 ? media.servicesCard : undefined) ||
                    s.image ||
                    '';

                  return (
                    <ImageUploader
                      key={s.key || `service_${s.index}`}
                      label={`Service ${s.number}: ${s.title}`}
                      sublabel={s.tag ? `[${s.tag}] Card Image` : 'Service Card Photo'}
                      value={serviceVal}
                      onChange={(val) => handleServiceCardImageChange(s.index, s.number, val)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: THEME, COLORS & CUSTOM CSS */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            {colorNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{colorNotice}</span>
              </div>
            )}

            <div>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900">Color Palette</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These colors skin the client website navbar, CTA buttons, badges, and accents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <label className="block text-xs text-slate-700 mb-1.5 font-semibold">Primary Brand</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setPrimaryHoverColor(darkenHex(e.target.value, 18));
                      }}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <label className="block text-xs text-slate-700 mb-1.5 font-semibold">Primary Hover / CTA</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryHoverColor}
                      onChange={(e) => setPrimaryHoverColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={primaryHoverColor}
                      onChange={(e) => setPrimaryHoverColor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <label className="block text-xs text-slate-700 mb-1.5 font-semibold">Secondary Tone</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <label className="block text-xs text-slate-700 mb-1.5 font-semibold">Metallic Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Live Palette Visual Preview */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-4">
                <span className="text-xs text-slate-600 font-semibold">Palette Preview:</span>
                <span
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  Primary Button
                </span>
                <span
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs"
                  style={{ backgroundColor: primaryHoverColor }}
                >
                  Hover CTA
                </span>
                <span
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold"
                  style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor }}
                >
                  Secondary Accent
                </span>
              </div>
            </div>

            {/* Custom CSS Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-800">Custom CSS / Variables Pasting</label>
                <span className="text-[11px] text-slate-400 font-mono">{"Paste :root { ... } or custom CSS"}</span>
              </div>
              <textarea
                value={customCss}
                onChange={(e) => handleCustomCssChange(e.target.value)}
                placeholder={":root {\n  --primary-hex: #0047AB;\n  --cta-hex: #003380;\n}\n\n.hero-badge {\n  border-radius: 9999px;\n}"}
                rows={6}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs font-mono text-emerald-400 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* TAB 3: CLIENT SEO & SOCIAL META */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/60 border border-blue-200/80 rounded-xl p-4">
              <div>
                <h3 className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Client-Specific SEO & Social Share Metadata
                </h3>
                <p className="text-xs text-blue-800/80 mt-0.5">
                  Every tag, canonical URL, OpenGraph preview, and Schema.org rich snippet dynamically adapts to this client.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutoGenerateSeo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-Generate from Brand
              </button>
            </div>

            {seoNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {seoNotice}
              </div>
            )}

            {/* PREVIEWS ROW: GOOGLE SEARCH & SOCIAL CARD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Google Snippet Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-600" /> Google Search Preview
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                    Canonical: /{slug || 'pitch'}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold">
                      {name.charAt(0) || 'R'}
                    </div>
                    <div className="text-[11px] text-slate-700 truncate font-medium">
                      {liveSeo.ogSiteName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {liveSeo.canonicalUrl}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer line-clamp-1">
                    {liveSeo.title}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {liveSeo.description}
                  </div>
                </div>
              </div>

              {/* OpenGraph / Social Share Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" /> OpenGraph & Social Preview
                  </span>
                  <span className="text-[10px] text-slate-500">iMessage / WhatsApp / Facebook / LinkedIn</span>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <div className="h-28 bg-slate-800 relative flex items-center justify-center overflow-hidden">
                    {liveSeo.ogImage ? (
                      <img src={liveSeo.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">Default Brand Hero Asset</span>
                    )}
                    <span className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                      1200 x 630
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 space-y-0.5">
                    <div className="text-[10px] uppercase font-mono text-slate-400">
                      {typeof window !== 'undefined' ? window.location.host : 'pitchengine.com'}
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">
                      {liveSeo.ogTitle}
                    </div>
                    <div className="text-[11px] text-slate-600 line-clamp-1">
                      {liveSeo.ogDescription}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INPUT FIELDS */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Custom SEO Overrides (Leave blank to use auto-generated branding)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Page Title (&lt;title&gt;)</label>
                    <span className="text-[10px] text-slate-400 font-mono">{liveSeo.title.length} chars</span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={liveSeo.title}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Twitter / X Handle</label>
                    <span className="text-[10px] text-slate-400 font-mono">twitter:site</span>
                  </div>
                  <input
                    type="text"
                    value={seoTwitterHandle}
                    onChange={(e) => setSeoTwitterHandle(e.target.value)}
                    placeholder={liveSeo.twitterSite}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Meta Description</label>
                  <span className="text-[10px] text-slate-400 font-mono">{liveSeo.description.length} / 160 chars</span>
                </div>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={liveSeo.description}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SEO Keywords</label>
                  <input
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder={liveSeo.keywords}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Geo Placename (City, State)</label>
                  <input
                    type="text"
                    value={seoGeoPlacename}
                    onChange={(e) => setSeoGeoPlacename(e.target.value)}
                    placeholder={liveSeo.geoPlacename}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* SCHEMA.ORG STRUCTURED DATA PREVIEW */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-blue-400" />
                  Generated Schema.org JSON-LD (RoofingContractor)
                </span>
                <span className="text-[10px] text-emerald-400 font-sans">
                  Active for Google Rich Results
                </span>
              </div>
              <pre className="text-sky-300 overflow-x-auto max-h-48 text-[11px] leading-relaxed">
                {JSON.stringify(liveSeo.schemaJson, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 4: COMPLETE DATA JSON EDITOR */}
        {activeTab === 'json' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-900">Client Website JSON Data</label>
                <p className="text-[11px] text-slate-500">
                  This single JSON file controls all text, phone numbers, emails, addresses, services, and FAQ copy for this client.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const formatted = JSON.stringify(JSON.parse(jsonText), null, 2);
                      setJsonText(formatted);
                      setJsonError(null);
                    } catch (err: any) {
                      setJsonError(err.message);
                    }
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 border border-slate-200 rounded-lg transition-colors font-medium"
                >
                  Format JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset JSON back to default baseline template?')) {
                      setJsonText(getDefaultCompleteDataJson());
                      setJsonError(null);
                    }
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-rose-50 text-xs text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg transition-colors font-medium"
                >
                  Reset Template
                </button>
              </div>
            </div>

            {/* Quick detected fields summary */}
            {jsonSummary && (
              <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Detected in JSON:</span>
                <span className="inline-flex items-center gap-1 font-mono text-slate-900">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {jsonSummary.phone}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-900">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {jsonSummary.email}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-900">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {jsonSummary.city}
                </span>
              </div>
            )}

            {jsonError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>JSON Syntax Error: {jsonError}</span>
              </div>
            )}

            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                try {
                  JSON.parse(e.target.value);
                  setJsonError(null);
                } catch (err: any) {
                  setJsonError(err.message);
                }
              }}
              rows={16}
              spellCheck={false}
              className={`w-full bg-slate-900 border rounded-xl p-3.5 text-xs font-mono leading-relaxed placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors ${
                jsonError ? 'border-rose-400 text-rose-200' : 'border-slate-700 text-sky-200'
              }`}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving...' : initialTenant ? 'Update Client' : 'Create Client Pitch'}
          </button>
        </div>
      </form>
    </div>
  );
};

