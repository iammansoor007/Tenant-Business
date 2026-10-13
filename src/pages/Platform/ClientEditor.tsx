import React, { useState, useEffect, useMemo } from 'react';
import { Tenant } from '../../types/tenant';
import { ImageUploader } from './ImageUploader';
import { darkenHex } from '../../lib/colorExtractor';
import { getDefaultCompleteDataJson } from '../../lib/templateBuilder';
import { Save, ExternalLink, Code, Palette, Image as ImageIcon, AlertTriangle, ArrowLeft, Phone, Mail, MapPin, Check, Globe, Share2, Search, Sparkles, FileJson, Copy, CheckCheck, RefreshCw, Layers, Sliders, HelpCircle, Eye, Braces, Wand2 } from 'lucide-react';
import { generateSeoMetadata } from '../../lib/seoManager';

export const CSS_TEMPLATES: Record<string, { label: string; badge: string; css: string }> = {
  modernNavy: {
    label: 'Deep Navy & Crisp White',
    badge: 'Default',
    css: `:root {\n  --primary-hex: #0B1D33;\n  --primary-hover-hex: #12365A;\n  --cta-hex: #12365A;\n  --secondary-hex: #344B63;\n  --accent-hex: #AEB8C2;\n  --navy-color: #06111F;\n  --card-bg: #FFFFFF;\n  --dark-bg: #F4F6F8;\n}`,
  },
  solarGold: {
    label: 'Solar Gold & Charcoal',
    badge: 'High Energy',
    css: `:root {\n  --primary-hex: #111827;\n  --primary-hover-hex: #1F2937;\n  --cta-hex: #F59E0B;\n  --secondary-hex: #374151;\n  --accent-hex: #FBBF24;\n  --navy-color: #0B0F19;\n  --card-bg: #FFFFFF;\n  --dark-bg: #F9FAFB;\n}`,
  },
  emeraldContractor: {
    label: 'Emerald Forest & Slate',
    badge: 'Eco Trust',
    css: `:root {\n  --primary-hex: #064E3B;\n  --primary-hover-hex: #047857;\n  --cta-hex: #059669;\n  --secondary-hex: #1F2937;\n  --accent-hex: #6EE7B7;\n  --navy-color: #022C22;\n  --card-bg: #FFFFFF;\n  --dark-bg: #F0FDF4;\n}`,
  },
  crimsonIndustrial: {
    label: 'Crimson Red & Gunmetal',
    badge: 'Heavy Duty',
    css: `:root {\n  --primary-hex: #7F1D1D;\n  --primary-hover-hex: #991B1B;\n  --cta-hex: #DC2626;\n  --secondary-hex: #374151;\n  --accent-hex: #FCA5A5;\n  --navy-color: #1A0A0A;\n  --card-bg: #FFFFFF;\n  --dark-bg: #FEF2F2;\n}`,
  },
  darkLuxeCyan: {
    label: 'Obsidian & Electric Cyan',
    badge: 'Dark Luxe',
    css: `:root {\n  --primary-hex: #0F172A;\n  --primary-hover-hex: #0284C7;\n  --cta-hex: #0EA5E9;\n  --secondary-hex: #334155;\n  --accent-hex: #38BDF8;\n  --navy-color: #020617;\n  --card-bg: #FFFFFF;\n  --dark-bg: #F8FAFC;\n}`,
  },
  terracottaWarmth: {
    label: 'Terracotta Tile & Earth',
    badge: 'Tile & Clay',
    css: `:root {\n  --primary-hex: #7C2D12;\n  --primary-hover-hex: #9A3412;\n  --cta-hex: #EA580C;\n  --secondary-hex: #431407;\n  --accent-hex: #FDBA74;\n  --navy-color: #1C0A04;\n  --card-bg: #FFFFFF;\n  --dark-bg: #FFF7ED;\n}`,
  },
};

export const CSS_VARIABLES_INFO = [
  { name: '--primary-hex', desc: 'Main brand color for navbar, headings & borders', sample: '#0B1D33' },
  { name: '--primary-hover-hex', desc: 'Hover state for primary buttons & active items', sample: '#12365A' },
  { name: '--cta-hex', desc: 'High-converting estimate & call CTA buttons', sample: '#12365A' },
  { name: '--secondary-hex', desc: 'Secondary tags, subtitle accents, minor badges', sample: '#344B63' },
  { name: '--accent-hex', desc: 'Metallic highlights, gradients, fine borders', sample: '#AEB8C2' },
  { name: '--navy-color', desc: 'Deep background for hero banner & footer container', sample: '#06111F' },
  { name: '--card-bg', desc: 'Background color for services & portfolio cards', sample: '#FFFFFF' },
  { name: '--dark-bg', desc: 'Base website background color for light sections', sample: '#F4F6F8' },
  { name: '--heading-color', desc: 'Text color used on all main section titles', sample: '#17212B' },
  { name: '--body-text-color', desc: 'Text color used on body paragraphs', sample: '#17212B' },
  { name: '--border-color', desc: 'Border and divider lines color', sample: '#D9E0E7' },
  { name: '--font-heading', desc: 'Heading font family (e.g. Montserrat, Cinzel, Inter)', sample: "'Cinzel', serif" },
  { name: '--font-body', desc: 'Body font family (e.g. Montserrat, Inter, Roboto)', sample: "'Montserrat', sans-serif" },
  { name: '--radius', desc: 'Border radius for cards and buttons (e.g. 10px, 16px)', sample: '10px' },
];

export const SCHEMA_TYPES = [
  { value: 'RoofingContractor', label: 'Roofing Contractor' },
  { value: 'GeneralContractor', label: 'General Contractor' },
  { value: 'HomeAndConstructionBusiness', label: 'Home & Construction Business' },
  { value: 'LocalBusiness', label: 'Local Business' },
  { value: 'ProfessionalService', label: 'Professional Service' },
  { value: 'MovingCompany', label: 'Moving & Junk Hauling Company' },
  { value: 'HVACBusiness', label: 'HVAC Contractor' },
  { value: 'Plumber', label: 'Plumbing Contractor' },
];

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
  const [customDomain, setCustomDomain] = useState(initialTenant?.customDomain || '');
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

  // Schema.org Structured Data
  const [schemaType, setSchemaType] = useState('RoofingContractor');
  const [customSchemaJson, setCustomSchemaJson] = useState('');
  const [schemaNotice, setSchemaNotice] = useState<string | null>(null);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [selectedCssTemplate, setSelectedCssTemplate] = useState<string>('');

  // CompleteData JSON Editor
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonSyncNotice, setJsonSyncNotice] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'media' | 'theme' | 'seo' | 'json'>('media');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialTenant) {
      setSlug(initialTenant.slug);
      setName(initialTenant.name);
      setPhone(initialTenant.phone || '');
      setEmail(initialTenant.email || '');
      setLocation(initialTenant.location || '');
      setCustomDomain(initialTenant.customDomain || '');
      setStatus(initialTenant.status || 'active');
      const cd = (initialTenant.completeData || {}) as any;
      const cdMedia = cd.media || {};
      const resolvedLogo = initialTenant.media?.logo || cd.navbar?.logo || cd.navbar?.logoUrl || cd.logo || cdMedia.logo || '';
      const resolvedHeroBg = initialTenant.media?.heroBg || initialTenant.media?.hero_bg || cd.hero?.heroBg || cd.hero?.image || cd.hero?.heroImage || cd.hero?.backgroundImage || cd.hero?.bg || cdMedia.heroBg || '';
      const resolvedAbout = initialTenant.media?.aboutImage || cd.about?.image || cd.about?.aboutImage || cdMedia.aboutImage || '';
      const resolvedFounder = initialTenant.media?.founderImage || cd.leadership?.ceo?.image || cd.leadership?.founderImage || cdMedia.founderImage || '';
      const resolvedServicesCard = initialTenant.media?.servicesCard || initialTenant.media?.serviceCard1 || cd.services?.services?.[0]?.image || cdMedia.servicesCard || '';
      const resolvedHowWeWork = initialTenant.media?.howWeWorkVector || initialTenant.media?.vector || cd.howWeWork?.vector || cd.howWeWork?.image || cdMedia.howWeWorkVector || '';
      const resolvedFaq = initialTenant.media?.faqVector || initialTenant.media?.vector || cd.faq?.vector || cd.faq?.image || cdMedia.faqVector || '';
      const resolvedVector = initialTenant.media?.vector || cd.vector || cdMedia.vector || '';

      setMedia({
        ...cdMedia,
        ...(initialTenant.media || {}),
        logo: resolvedLogo,
        heroBg: resolvedHeroBg,
        aboutImage: resolvedAbout,
        founderImage: resolvedFounder,
        servicesCard: resolvedServicesCard,
        howWeWorkVector: resolvedHowWeWork,
        faqVector: resolvedFaq,
        vector: resolvedVector,
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
      setSchemaType(initialTenant.seo?.schemaType || 'RoofingContractor');
      setCustomSchemaJson(
        initialTenant.seo?.customSchemaJson
          ? (typeof initialTenant.seo.customSchemaJson === 'string'
              ? initialTenant.seo.customSchemaJson
              : JSON.stringify(initialTenant.seo.customSchemaJson, null, 2))
          : ''
      );
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
      setSchemaType('RoofingContractor');
      setCustomSchemaJson('');
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

  const handleApplyCssTemplate = (templateKey: string) => {
    setSelectedCssTemplate(templateKey);
    const tmpl = CSS_TEMPLATES[templateKey];
    if (tmpl) {
      handleCustomCssChange(tmpl.css);
      setColorNotice(`Applied "${tmpl.label}" CSS template!`);
      setTimeout(() => setColorNotice(null), 3000);
    }
  };

  const handleInsertCssVar = (varName: string, sample: string) => {
    const toInsert = `  ${varName}: ${sample};`;
    setCustomCss((prev) => {
      if (!prev) return `:root {\n${toInsert}\n}`;
      if (prev.includes(varName)) {
        return prev;
      }
      if (prev.includes(':root {')) {
        return prev.replace(':root {', `:root {\n${toInsert}`);
      }
      return `${prev}\n\n:root {\n${toInsert}\n}`;
    });
    setCopiedVar(varName);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const handleFormatSchemaJson = () => {
    if (!customSchemaJson.trim()) return;
    try {
      const parsed = JSON.parse(customSchemaJson);
      setCustomSchemaJson(JSON.stringify(parsed, null, 2));
      setSchemaError(null);
      setSchemaNotice('Schema JSON-LD formatted successfully!');
      setTimeout(() => setSchemaNotice(null), 2500);
    } catch (err: any) {
      setSchemaError(`JSON Format Error: ${err.message}`);
    }
  };

  const handleLoadDefaultSchema = () => {
    const generated = liveSeo.schemaJson;
    setCustomSchemaJson(JSON.stringify(generated, null, 2));
    setSchemaError(null);
    setSchemaNotice('Loaded auto-generated Schema.org template ready for customization!');
    setTimeout(() => setSchemaNotice(null), 3000);
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

  const handleMediaChange = (field: string, val: string) => {
    setMedia((prev) => {
      const nextMedia = { ...prev, [field]: val };
      try {
        const parsed = JSON.parse(jsonText);
        if (!parsed.media) parsed.media = {};
        parsed.media[field] = val;

        if (field === 'logo') {
          if (!parsed.navbar) parsed.navbar = {};
          parsed.navbar.logo = val;
          if (!parsed.footer) parsed.footer = {};
          parsed.footer.logo = val;
        } else if (field === 'heroBg') {
          if (!parsed.hero) parsed.hero = {};
          parsed.hero.heroBg = val;
          parsed.hero.image = val;
        } else if (field === 'aboutImage') {
          if (!parsed.about) parsed.about = {};
          parsed.about.image = val;
          parsed.about.aboutImage = val;
        } else if (field === 'founderImage') {
          if (!parsed.leadership) parsed.leadership = {};
          if (!parsed.leadership.ceo) parsed.leadership.ceo = {};
          parsed.leadership.ceo.image = val;
        } else if (field === 'howWeWorkVector') {
          if (!parsed.howWeWork) parsed.howWeWork = {};
          parsed.howWeWork.vector = val;
        } else if (field === 'faqVector') {
          if (!parsed.faq) parsed.faq = {};
          parsed.faq.vector = val;
        } else if (field === 'vector') {
          if (!parsed.howWeWork) parsed.howWeWork = {};
          parsed.vector = val;
        }

        setJsonText(JSON.stringify(parsed, null, 2));
      } catch {}
      return nextMedia;
    });
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

    const isClientFlagship = (slug || '').toLowerCase() === 'max-quality-roofing';
    const parsedName = parsed?.footer?.company?.name || parsed?.header?.title || parsed?.name;
    const isTemplateName = parsedName === 'MAX QUALITY ROOFING' || parsedName === 'Max Quality Roofing';
    const effectiveName = name.trim() || (!isClientFlagship && !isTemplateName && parsedName ? parsedName : '') || 'Client Business Name';

    const rawJsonPhone = parsed?.footer?.contact?.phone || parsed?.contact?.phone || parsed?.navbar?.cta?.phone;
    const isTemplatePhone = rawJsonPhone?.includes('406') && rawJsonPhone?.includes('217-1720');
    const effectivePhone = phone.trim() || (!isClientFlagship && isTemplatePhone ? undefined : rawJsonPhone);

    const rawJsonEmail = parsed?.footer?.contact?.email || parsed?.contact?.email;
    const isTemplateEmail = rawJsonEmail?.includes('maxqualityroofing');
    const effectiveEmail = email.trim() || (!isClientFlagship && isTemplateEmail ? undefined : rawJsonEmail);

    const rawJsonLoc = parsed?.footer?.serviceAreas?.items?.[0] || parsed?.footer?.company?.subTitle || parsed?.city;
    const isTemplateLoc = rawJsonLoc?.includes('Great Falls') || rawJsonLoc?.includes('Cascade County');
    const effectiveLocation = location.trim() || (!isClientFlagship && isTemplateLoc ? undefined : rawJsonLoc);

    const dummyTenant: any = {
      slug: slug || 'client-pitch',
      name: effectiveName,
      phone: effectivePhone || undefined,
      email: effectiveEmail || undefined,
      location: effectiveLocation || undefined,
      media,
      seo: {
        title: seoTitle.trim() || undefined,
        description: seoDescription.trim() || undefined,
        keywords: seoKeywords.trim() || undefined,
        twitterHandle: seoTwitterHandle.trim() || undefined,
        geoPlacename: seoGeoPlacename.trim() || undefined,
        schemaType: (schemaType && schemaType !== 'RoofingContractor') ? schemaType : (isClientFlagship ? 'RoofingContractor' : undefined),
        customSchemaJson: customSchemaJson.trim() ? customSchemaJson.trim() : undefined,
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
  }, [slug, name, phone, email, location, media, seoTitle, seoDescription, seoKeywords, seoTwitterHandle, seoGeoPlacename, schemaType, customSchemaJson, jsonText]);

  // Two-way sync: extracts client identity, contacts, locations, media, and SEO from JSON
  const handleSyncFromJson = () => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err: any) {
      alert(`Invalid JSON format: ${err.message}`);
      return;
    }

    if (!parsed || typeof parsed !== 'object') {
      alert('Parsed JSON must be an object.');
      return;
    }

    const isClientFlagship = (slug || '').toLowerCase() === 'max-quality-roofing';

    // 1. Business Name
    const extractedName =
      parsed?.footer?.company?.name ||
      parsed?.header?.title ||
      parsed?.navbar?.logoAlt?.replace(/\s*Logo$/i, '') ||
      parsed?.name;
    const isRoofingTemplateName = extractedName === 'MAX QUALITY ROOFING' || extractedName === 'Max Quality Roofing';
    if (extractedName && typeof extractedName === 'string' && extractedName.trim() && (!isRoofingTemplateName || isClientFlagship)) {
      setName(extractedName.trim());
      if (!initialTenant && !slug) {
        const generatedSlug = extractedName.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');
        setSlug(generatedSlug);
      }
    }

    // 2. Phone
    const extractedPhone = parsed?.footer?.contact?.phone || parsed?.contact?.phone || parsed?.navbar?.cta?.phone;
    const isTemplatePhone = extractedPhone?.includes('406') && extractedPhone?.includes('217-1720');
    if (extractedPhone && typeof extractedPhone === 'string' && (!isTemplatePhone || isClientFlagship)) {
      setPhone(extractedPhone.trim());
    }

    // 3. Email
    const extractedEmail = parsed?.footer?.contact?.email || parsed?.contact?.email;
    const isTemplateEmail = extractedEmail?.includes('maxqualityroofing');
    if (extractedEmail && typeof extractedEmail === 'string' && (!isTemplateEmail || isClientFlagship)) {
      setEmail(extractedEmail.trim());
    }

    // 4. Location
    const rawLoc = parsed?.footer?.serviceAreas?.items?.[0] || parsed?.footer?.company?.subTitle || parsed?.city;
    const isTemplateLoc = rawLoc?.includes('Great Falls') || rawLoc?.includes('Cascade County');
    if (rawLoc && typeof rawLoc === 'string' && (!isTemplateLoc || isClientFlagship)) {
      setLocation(rawLoc.trim());
    }

    // 5. Media
    const extractedLogo = parsed?.navbar?.logo || parsed?.footer?.logo || parsed?.media?.logo || parsed?.logo;
    const extractedHeroBg = parsed?.hero?.heroBg || parsed?.hero?.image || parsed?.media?.heroBg;
    const extractedAbout = parsed?.about?.image || parsed?.about?.aboutImage || parsed?.media?.aboutImage;
    const extractedFounder = parsed?.leadership?.ceo?.image || parsed?.media?.founderImage;

    setMedia((prev) => ({
      ...prev,
      ...(extractedLogo ? { logo: extractedLogo } : {}),
      ...(extractedHeroBg ? { heroBg: extractedHeroBg } : {}),
      ...(extractedAbout ? { aboutImage: extractedAbout } : {}),
      ...(extractedFounder ? { founderImage: extractedFounder } : {}),
    }));

    // 6. Schema & SEO Overrides
    const effectiveName = (!isRoofingTemplateName && extractedName) ? extractedName : (name || 'Client Business');
    const effectiveLoc = (!isTemplateLoc && rawLoc) ? rawLoc : location;
    const effectivePhone = (!isTemplatePhone && extractedPhone) ? extractedPhone : phone;
    const effectiveEmail = (!isTemplateEmail && extractedEmail) ? extractedEmail : email;

    const auto = generateSeoMetadata(
      {
        slug: slug || 'client-pitch',
        name: effectiveName,
        phone: effectivePhone || undefined,
        email: effectiveEmail || undefined,
        location: effectiveLoc || undefined,
        media: {
          ...media,
          ...(extractedLogo ? { logo: extractedLogo } : {}),
        },
        completeData: parsed,
      } as any,
      parsed,
      media,
      slug
    );

    const detectedSchema = auto.schemaJson?.['@graph']?.[0]?.['@type'] || parsed?.seo?.schemaType || parsed?.schemaType;
    if (detectedSchema) {
      setSchemaType(detectedSchema);
    }

    const customTitle = parsed?.meta?.title || parsed?.seo?.title;
    const customDesc = parsed?.meta?.description || parsed?.seo?.description;
    const customKeywords = parsed?.meta?.keywords || parsed?.seo?.keywords;
    const customPlacename = parsed?.seo?.geoPlacename;

    setSeoTitle(customTitle || auto.title);
    setSeoDescription(customDesc || auto.description);
    setSeoKeywords(customKeywords || auto.keywords);
    setSeoTwitterHandle(auto.twitterSite);
    setSeoGeoPlacename(customPlacename || auto.geoPlacename);

    setJsonSyncNotice('Successfully extracted and synced client identity, contacts, media & SEO from JSON!');
    setTimeout(() => setJsonSyncNotice(null), 4500);
  };

  const handleAutoGenerateSeo = () => {
    let parsed: any = null;
    try {
      parsed = JSON.parse(jsonText);
    } catch {}

    const isClientFlagship = (slug || '').toLowerCase() === 'max-quality-roofing';
    const parsedName = parsed?.footer?.company?.name || parsed?.header?.title || parsed?.name;
    const isTemplateName = parsedName === 'MAX QUALITY ROOFING' || parsedName === 'Max Quality Roofing';
    const effectiveName = name.trim() || (!isClientFlagship && !isTemplateName && parsedName ? parsedName : '') || 'Client Business';

    const rawJsonPhone = parsed?.footer?.contact?.phone || parsed?.contact?.phone || parsed?.navbar?.cta?.phone;
    const isTemplatePhone = rawJsonPhone?.includes('406') && rawJsonPhone?.includes('217-1720');
    const effectivePhone = phone.trim() || (!isClientFlagship && isTemplatePhone ? undefined : rawJsonPhone);

    const rawJsonEmail = parsed?.footer?.contact?.email || parsed?.contact?.email;
    const isTemplateEmail = rawJsonEmail?.includes('maxqualityroofing');
    const effectiveEmail = email.trim() || (!isClientFlagship && isTemplateEmail ? undefined : rawJsonEmail);

    const rawJsonLoc = parsed?.footer?.serviceAreas?.items?.[0] || parsed?.footer?.company?.subTitle || parsed?.city;
    const isTemplateLoc = rawJsonLoc?.includes('Great Falls') || rawJsonLoc?.includes('Cascade County');
    const effectiveLocation = location.trim() || (!isClientFlagship && isTemplateLoc ? undefined : rawJsonLoc);

    const auto = generateSeoMetadata(
      {
        slug,
        name: effectiveName,
        phone: effectivePhone || undefined,
        email: effectiveEmail || undefined,
        location: effectiveLocation || undefined,
        media,
        completeData: parsed
      } as any,
      parsed,
      media,
      slug
    );

    const detectedSchema = auto.schemaJson?.['@graph']?.[0]?.['@type'];
    if (detectedSchema) {
      setSchemaType(detectedSchema);
    }

    const customTitle = parsed?.meta?.title || parsed?.seo?.title;
    const customDesc = parsed?.meta?.description || parsed?.seo?.description;
    const customKeywords = parsed?.meta?.keywords || parsed?.seo?.keywords;
    const customPlacename = parsed?.seo?.geoPlacename;

    setSeoTitle(customTitle || auto.title);
    setSeoDescription(customDesc || auto.description);
    setSeoKeywords(customKeywords || auto.keywords);
    setSeoTwitterHandle(auto.twitterSite);
    setSeoGeoPlacename(customPlacename || auto.geoPlacename);
    setSeoNotice('Auto-generated SEO metadata from client brand & location!');
    setTimeout(() => setSeoNotice(null), 3500);
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

      if (!parsedData.media) parsedData.media = {};
      Object.assign(parsedData.media, media);
      if (media.logo) {
        if (!parsedData.navbar) parsedData.navbar = {};
        parsedData.navbar.logo = media.logo;
        if (!parsedData.footer) parsedData.footer = {};
        parsedData.footer.logo = media.logo;
      }
      if (media.heroBg) {
        if (!parsedData.hero) parsedData.hero = {};
        parsedData.hero.heroBg = media.heroBg;
        parsedData.hero.image = media.heroBg;
      }
      if (media.aboutImage) {
        if (!parsedData.about) parsedData.about = {};
        parsedData.about.image = media.aboutImage;
        parsedData.about.aboutImage = media.aboutImage;
      }
      if (media.founderImage) {
        if (!parsedData.leadership) parsedData.leadership = {};
        if (!parsedData.leadership.ceo) parsedData.leadership.ceo = {};
        parsedData.leadership.ceo.image = media.founderImage;
      }
      if (media.howWeWorkVector) {
        if (!parsedData.howWeWork) parsedData.howWeWork = {};
        parsedData.howWeWork.vector = media.howWeWorkVector;
      }
      if (media.faqVector) {
        if (!parsedData.faq) parsedData.faq = {};
        parsedData.faq.vector = media.faqVector;
      }

      const tenantToSave: Tenant = {
        slug: cleanSlug,
        name: name.trim(),
        phone: safePhone,
        email: safeEmail,
        location: safeLocation,
        customDomain: customDomain.trim() ? customDomain.toLowerCase().trim() : undefined,
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
          schemaType: schemaType || 'RoofingContractor',
          customSchemaJson: customSchemaJson.trim() ? customSchemaJson.trim() : undefined,
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
        {jsonSyncNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {jsonSyncNotice}
            </div>
          </div>
        )}

        {/* Core Slug & Name */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800">Basic Client Identity</span>
            <button
              type="button"
              onClick={handleSyncFromJson}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              Sync Info from complete.json
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Custom Domain (Optional)
              </label>
              <span className="text-[10px] text-slate-400">e.g. maxqualityroofing.com</span>
            </div>
            <div className="flex items-center">
              <span className="bg-slate-100 text-slate-500 px-2.5 py-2 rounded-l-lg text-xs font-mono border border-r-0 border-slate-300">
                https://
              </span>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase().trim().replace(/^https?:\/\//, ''))}
                placeholder="clientdomain.com"
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
                  onChange={(val) => handleMediaChange('logo', val)}
                  isLogo={true}
                  onColorExtracted={handleLogoColorExtracted}
                />

                <ImageUploader
                  label="Hero Background"
                  sublabel="Top hero banner background image"
                  value={media.heroBg}
                  onChange={(val) => handleMediaChange('heroBg', val)}
                />

                <ImageUploader
                  label="About Section Image"
                  sublabel="About the company showcase photo"
                  value={media.aboutImage}
                  onChange={(val) => handleMediaChange('aboutImage', val)}
                />

                <ImageUploader
                  label="Founder / Owner Photo"
                  sublabel="Owner / CEO leadership portrait"
                  value={media.founderImage}
                  onChange={(val) => handleMediaChange('founderImage', val)}
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
                  onChange={(val) => handleMediaChange('howWeWorkVector', val)}
                />

                <ImageUploader
                  label="FAQ CTA Vector Graphic"
                  sublabel="Graphic in FAQ knowledge card CTA banner"
                  value={media.faqVector}
                  onChange={(val) => handleMediaChange('faqVector', val)}
                />

                <ImageUploader
                  label="General Badge / Vector"
                  sublabel="Fallback decorative vector or trust badge"
                  value={media.vector}
                  onChange={(val) => handleMediaChange('vector', val)}
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

            {/* Pre-Built Theme CSS Templates */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    Pre-Built CSS Theme Templates
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Click any curated theme to instantly apply its CSS variables and palette.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.entries(CSS_TEMPLATES).map(([key, tmpl]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyCssTemplate(key)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedCssTemplate === key
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        {tmpl.badge}
                      </span>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">
                        {tmpl.label}
                      </p>
                    </div>
                    <span className="text-[10px] text-blue-600 font-semibold mt-2 block">
                      Apply Template &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom CSS Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-xs font-semibold text-slate-800">Custom CSS / Variables Overrides</label>
                  <p className="text-[11px] text-slate-500">Override site design tokens with custom CSS or CSS variables.</p>
                </div>
                {customCss && (
                  <button
                    type="button"
                    onClick={() => handleCustomCssChange('')}
                    className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    Clear Custom CSS
                  </button>
                )}
              </div>
              <textarea
                value={customCss}
                onChange={(e) => handleCustomCssChange(e.target.value)}
                placeholder={":root {\n  --primary-hex: #0047AB;\n  --cta-hex: #003380;\n}\n\n.hero-badge {\n  border-radius: 9999px;\n}"}
                rows={7}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs font-mono text-emerald-400 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors leading-relaxed"
              />
            </div>

            {/* CSS Variables Reference Cheat Sheet */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Braces className="w-3.5 h-3.5 text-indigo-600" />
                    Available CSS Variables Reference
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    All core design tokens used across the client pitch site. Click &ldquo;+ Insert&rdquo; to add any variable to your custom CSS box.
                  </p>
                </div>
                {copiedVar && (
                  <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Check className="w-3 h-3" /> Inserted {copiedVar}!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {CSS_VARIABLES_INFO.map((v) => (
                  <div
                    key={v.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <code className="font-mono font-bold text-indigo-600 text-[11px] truncate">
                          {v.name}
                        </code>
                        {v.name.includes('hex') && (
                          <span
                            className="w-3 h-3 rounded-full border border-slate-200 inline-block shrink-0 shadow-xs"
                            style={{ backgroundColor: v.sample }}
                          />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{v.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInsertCssVar(v.name, v.sample)}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[10px] font-semibold text-slate-700 transition-colors shrink-0 cursor-pointer"
                    >
                      + Insert
                    </button>
                  </div>
                ))}
              </div>
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

            {/* SCHEMA.ORG STRUCTURED DATA EDITOR */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Braces className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Schema.org Structured Data (JSON-LD)</h3>
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                      Google Rich Snippets
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Controls how Google, Bing, Apple Maps, and AI bots index business type, contact points, location, services, and ratings.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Business Type:</label>
                  <select
                    value={schemaType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setSchemaType(newType);
                      if (customSchemaJson.trim()) {
                        try {
                          const parsed = JSON.parse(customSchemaJson);
                          if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
                            const biz = parsed['@graph'].find((item: any) => item['@id']?.includes('#business') || item.telephone || item.name);
                            if (biz) biz['@type'] = newType;
                          } else {
                            parsed['@type'] = newType;
                          }
                          setCustomSchemaJson(JSON.stringify(parsed, null, 2));
                        } catch {}
                      }
                    }}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {SCHEMA_TYPES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Notice / Alert */}
              {schemaNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{schemaNotice}</span>
                </div>
              )}
              {schemaError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-mono">{schemaError}</span>
                </div>
              )}

              {/* Mode Bar & Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  {customSchemaJson.trim() ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      Custom JSON-LD Active (Overrides default)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Dynamic Auto-Generated Active ({schemaType})
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!customSchemaJson.trim() ? (
                    <button
                      type="button"
                      onClick={handleLoadDefaultSchema}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors font-medium flex items-center gap-1.5 shadow-sm"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      Customize JSON-LD
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleFormatSchemaJson}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs rounded-lg transition-colors font-medium flex items-center gap-1"
                      >
                        <Code className="w-3.5 h-3.5 text-blue-600" />
                        Format JSON
                      </button>
                      <button
                        type="button"
                        onClick={handleLoadDefaultSchema}
                        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs rounded-lg transition-colors font-medium flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                        Reload Template
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomSchemaJson('');
                          setSchemaError(null);
                          setSchemaNotice('Reverted to dynamic auto-generated Schema.org structured data.');
                          setTimeout(() => setSchemaNotice(null), 2500);
                        }}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs rounded-lg transition-colors font-medium flex items-center gap-1"
                      >
                        Reset to Dynamic Auto
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Schema JSON Editor or Read-Only Preview */}
              {customSchemaJson.trim() ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs text-slate-600 font-medium">
                    <span>Edit JSON-LD Schema</span>
                    <span className="text-[11px] text-slate-500 font-mono">schema.org / {schemaType}</span>
                  </div>
                  <textarea
                    rows={12}
                    value={customSchemaJson}
                    onChange={(e) => {
                      setCustomSchemaJson(e.target.value);
                      if (schemaError) {
                        try {
                          JSON.parse(e.target.value);
                          setSchemaError(null);
                        } catch {}
                      }
                    }}
                    placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "${schemaType}",\n  "name": "${name || 'Business Name'}"\n}`}
                    className="w-full bg-slate-900 text-sky-300 border border-slate-800 rounded-xl p-3.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-inner"
                    spellCheck={false}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    💡 Tip: You can edit or add properties such as <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">address</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">telephone</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">openingHoursSpecification</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">aggregateRating</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">makesOffer</code>.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-blue-400" />
                      Active Live JSON-LD Preview ({schemaType})
                    </span>
                    <span className="text-[10px] text-emerald-400 font-sans">
                      Automatically Synced with Client Information
                    </span>
                  </div>
                  <pre className="text-sky-300 overflow-x-auto max-h-56 text-[11px] leading-relaxed">
                    {JSON.stringify(liveSeo.schemaJson, null, 2)}
                  </pre>
                </div>
              )}
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
                  onClick={handleSyncFromJson}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-xs text-white rounded-lg shadow-xs transition-colors font-semibold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sync Form Fields from JSON
                </button>
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

            {jsonSyncNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {jsonSyncNotice}
              </div>
            )}

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

