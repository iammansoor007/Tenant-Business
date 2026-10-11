import React, { useState, useRef, useEffect } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Code2,
  CheckCircle2,
  SlidersHorizontal,
  Target,
  Send,
  Check,
  Cpu,
  Monitor,
  Flame,
  MousePointerClick,
  ChevronRight,
  Lock,
  Sparkles,
  Zap,
  ShieldCheck,
  TrendingUp,
  Globe,
  Award,
  Star,
  Clock,
  Phone,
  BarChart3,
  Smartphone,
  Laptop,
  CheckCheck,
  Bell,
  Gauge,
  Database,
  Search,
  Server,
  Activity,
  Compass,
} from 'lucide-react';
import heroRoofingImg from '../assets/newhero.webp';
import portfolio1Img from '../assets/portfolio-1-c.webp';
import portfolio2Img from '../assets/portfolio-2.webp';
import portfolio3Img from '../assets/portfolio-3-c.webp';

interface ClientPreview {
  id: string;
  name: string;
  slug: string;
  trade: string;
  location: string;
  phone: string;
  primaryColor: string;
  tagline: string;
  metric: string;
  metricLabel: string;
  image: string;
  badges: string[];
  ctaUrl: string;
  dnsDomain: string;
}

const PREVIEW_CLIENTS: ClientPreview[] = [
  {
    id: 'max-quality',
    name: 'Max Quality Roofing',
    slug: 'max-quality-roofing',
    trade: 'Architectural Roofing & Restoration',
    location: 'Great Falls, MT',
    phone: '(406) 217-1720',
    primaryColor: '#0B1D33',
    tagline: 'Precision Shingle Systems & Emergency Hail Restoration',
    metric: '+380%',
    metricLabel: 'Surge in Qualified Inquiries',
    image: heroRoofingImg,
    badges: ['Shingle Master Elite', 'Instant Quick-Estimator', 'Cascade County Schema'],
    ctaUrl: '/max-quality-roofing',
    dnsDomain: 'maxqualityroofing.com',
  },
  {
    id: 'apex-hvac',
    name: 'Apex Climate Mechanical',
    slug: 'apex-climate-mechanical',
    trade: 'Emergency HVAC & Heat Pump Systems',
    location: 'Dallas / Fort Worth, TX',
    phone: '(214) 880-4921',
    primaryColor: '#0F172A',
    tagline: 'Sub-Zero Response Times & Precision Thermal Diagnostics',
    metric: '4.2x',
    metricLabel: 'Lift in Same-Day Dispatch Conversions',
    image: portfolio1Img,
    badges: ['24/7 Smart Dispatch', 'Radius-Based Geo Routing', 'Google Guaranteed Sync'],
    ctaUrl: '#contact',
    dnsDomain: 'apexclimatemech.com',
  },
  {
    id: 'horizon-renovations',
    name: 'Horizon Custom Renovations',
    slug: 'horizon-custom-renovations',
    trade: 'High-Ticket Design-Build Remodeling',
    location: 'Scottsdale, AZ',
    phone: '(480) 912-3340',
    primaryColor: '#18181B',
    tagline: 'Architectural Remodeling & Bespoke Interior Living',
    metric: '$1.4M',
    metricLabel: 'Average Monthly Project Pipeline',
    image: portfolio3Img,
    badges: ['Interactive Before/After', 'Pre-Qual Financing Widget', 'High-Res 3D Model View'],
    ctaUrl: '#contact',
    dnsDomain: 'horizoncustombuild.com',
  },
];

export const AgencyHome: React.FC = () => {
  const [activeClientIdx, setActiveClientIdx] = useState(0);
  const activeClient = PREVIEW_CLIENTS[activeClientIdx];
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile' | 'code'>('desktop');
  const [roiJobs, setRoiJobs] = useState(28);

  // Quick estimator interactive state
  const [estSquares, setEstSquares] = useState(24);
  const [estMaterial, setEstMaterial] = useState<'architectural' | 'metal' | 'designer'>('architectural');

  // Contact form state
  const [selectedTrade, setSelectedTrade] = useState('Roofing');
  const [selectedBudget, setSelectedBudget] = useState('$5k – $10k');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mouse spotlight aura coordinates
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Root scroll progress for top bar
  const { scrollYProgress: rootScrollProgress } = useScroll();
  const smoothProgress = useSpring(rootScrollProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  // Hero Scroll Animation (Natural, fluid tilt without artificial dead whitespace)
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroRotateX = useTransform(heroScrollProgress, [0, 0.7], [12, 0]);
  const heroScale = useTransform(heroScrollProgress, [0, 0.7], [0.94, 1]);
  const heroTranslateY = useTransform(heroScrollProgress, [0, 0.7], [30, 0]);

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  // Estimate calculation
  const materialRate = estMaterial === 'architectural' ? 440 : estMaterial === 'metal' ? 780 : 950;
  const calculatedEstimate = estSquares * materialRate;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white antialiased relative">
      {/* ─── Top Scroll Progress Bar ─── */}
      <motion.div
        style={{ scaleX: smoothProgress }}
        className="fixed top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 origin-left z-[100] shadow-[0_1px_12px_rgba(37,99,235,0.6)]"
      />

      {/* ─── Ambient Interactive Spotlight Aura (Tracks Cursor) ─── */}
      <div
        className="pointer-events-none fixed inset-0 z-10 transition-opacity duration-300 opacity-60 hidden md:block"
        style={{
          background: `radial-gradient(750px circle at ${mousePos.x}px ${mousePos.y}px, rgba(37, 99, 235, 0.045), rgba(99, 102, 241, 0.02) 40%, transparent 80%)`,
        }}
      />

      {/* ─── Precision Grid & Gradient Atmosphere ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-blue-100/50 via-sky-50/30 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -left-32 w-[550px] h-[550px] bg-indigo-100/35 blur-[160px] rounded-full" />
        <div className="absolute top-[70%] -right-32 w-[600px] h-[600px] bg-sky-100/40 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f033_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f033_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_75%_50%_at_50%_0%,#000_80%,transparent_100%)]" />
      </div>

      {/* ─── Floating Frosted SaaS Header ─── */}
      <header className="sticky top-5 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all">
        <motion.div
          initial={{ y: -25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="backdrop-blur-2xl bg-white/85 border border-slate-200/90 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-[0_16px_45px_-12px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.02)]"
        >
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-mono font-bold text-sm tracking-tight shadow-md group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
              <Layers className="w-5 h-5 text-sky-400 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-950 font-display">
                  HISPANGO
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 font-mono">
                  STUDIO
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block font-mono -mt-0.5 tracking-tight">
                Multi-Tenant SaaS Engine
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-600 tracking-wider uppercase font-mono">
            <a href="#demo" className="hover:text-blue-600 transition-colors">
              Platform Demo
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Capabilities
            </a>
            <a href="#estimator" className="hover:text-blue-600 transition-colors">
              Quote Engine
            </a>
            <a href="#work" className="hover:text-blue-600 transition-colors">
              Client Archive
            </a>
            <a href="#calculator" className="hover:text-blue-600 transition-colors">
              ROI Engine
            </a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">
              Initiate Build
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="/platform"
              id="nav-platform-btn"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono text-slate-800 hover:text-black bg-slate-100 hover:bg-slate-200/80 border border-slate-200 shadow-xs transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Agency</span>
              <span>Platform</span>
            </a>
            <a
              href="#contact"
              id="nav-cta-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider text-white bg-slate-950 hover:bg-black shadow-md shadow-slate-950/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Build A Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>
      </header>

      {/* ─── Hero Section with Scroll Tilt ─── */}
      <section ref={heroRef} className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
        {/* Pill Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 text-xs font-mono font-medium mb-6 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-950">EDGE MULTI-TENANT</span>
          <span className="text-slate-300">|</span>
          <span className="text-blue-600 font-semibold">SUB-SECOND WEB PLATFORMS</span>
        </motion.div>

        {/* Dramatic Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-[4.75rem] font-bold tracking-[-0.045em] text-slate-950 leading-[0.98] max-w-5xl mx-auto mb-6 font-display"
        >
          We Architect Digital Flagships For{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
            Trade Enterprises
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 font-normal"
        >
          Sub-second headless web applications, instantaneous client pitch previews,
          and localized algorithmic search domination engineered for trade enterprise contractors.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <a
            href="#demo"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/25 transition-all hover:scale-[1.02]"
          >
            <MousePointerClick className="w-4 h-4" />
            <span>Interact With Live Sandbox</span>
          </a>
          <a
            href="/platform"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-mono font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Launch Agency Platform</span>
          </a>
        </motion.div>

        {/* ─── 3D PERSPECTIVE SCROLL-DRIVEN MOCKUP CANVAS ─── */}
        <div className="relative w-full max-w-6xl mx-auto [perspective:1400px]">
          {/* Floating Badges */}
          <div className="hidden lg:flex absolute -left-8 top-16 z-30 items-center gap-3 p-3.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-xl backdrop-blur-md max-w-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900 font-mono flex items-center gap-2">
                <span>38ms Edge TTFB</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="text-slate-500 text-[11px] font-sans">99/100 Core Web Vitals Pass</div>
            </div>
          </div>

          <div className="hidden lg:flex absolute -right-8 top-20 z-30 items-center gap-3 p-3.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-xl backdrop-blur-md max-w-xs text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900 font-mono truncate max-w-[170px]">
                {activeClient.dnsDomain}
              </div>
              <div className="text-slate-500 text-[11px] font-sans">Multi-Tenant Auto Route</div>
            </div>
          </div>

          {/* The Main 3D Card */}
          <motion.div
            style={{
              rotateX: heroRotateX,
              scale: heroScale,
              y: heroTranslateY,
            }}
            id="demo"
            className="relative rounded-3xl bg-white border border-slate-200/90 shadow-[0_30px_90px_-15px_rgba(15,23,42,0.12),0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden transition-all text-left"
          >
            {/* Window Titlebar */}
            <div className="px-5 py-3.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between font-mono text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block" />
                <span className="ml-3 font-semibold text-slate-700 hidden sm:inline text-[11px]">
                  MULTI-TENANT CLIENT SANDBOX
                </span>
              </div>

              <div className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center gap-2 text-xs shadow-xs max-w-md w-full justify-center">
                <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate font-mono text-[11px]">
                  tenants.platform.agency/{activeClient.slug}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`p-1.5 rounded-md transition-colors ${
                    deviceView === 'desktop'
                      ? 'bg-slate-100 text-blue-600 font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Desktop Preview"
                >
                  <Laptop className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`p-1.5 rounded-md transition-colors ${
                    deviceView === 'mobile'
                      ? 'bg-slate-100 text-blue-600 font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceView('code')}
                  className={`p-1.5 rounded-md transition-colors ${
                    deviceView === 'code'
                      ? 'bg-slate-100 text-blue-600 font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Schema / Code View"
                >
                  <Code2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tenant Switcher Ribbon */}
            <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between gap-3 overflow-x-auto">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold shrink-0">
                Select Active Tenant:
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {PREVIEW_CLIENTS.map((client, idx) => {
                  const isActive = idx === activeClientIdx;
                  return (
                    <button
                      key={client.id}
                      onClick={() => setActiveClientIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                        isActive
                          ? 'bg-white border-blue-600 text-blue-700 shadow-sm'
                          : 'bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: client.primaryColor }}
                      />
                      <span>{client.name}</span>
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold">
                          MOUNTED
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive View Body */}
            <div className="p-6 sm:p-8 lg:p-10 min-h-[380px]">
              {deviceView === 'code' ? (
                <div className="bg-slate-950 rounded-2xl p-6 text-slate-300 font-mono text-xs overflow-x-auto border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-3">
                    <span className="text-emerald-400 font-bold">
                      // Edge Runtime Tenant Manifest for: {activeClient.name}
                    </span>
                    <span>JSON-LD + Route Tree</span>
                  </div>
                  <pre className="text-[11px] leading-relaxed text-sky-300">
{`{
  "tenantId": "${activeClient.id}",
  "slug": "${activeClient.slug}",
  "customDomain": "${activeClient.dnsDomain}",
  "status": "ACTIVE_EDGE_ROUTING",
  "trade": "${activeClient.trade}",
  "serviceArea": "${activeClient.location}",
  "phone": "${activeClient.phone}",
  "schema": {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "${activeClient.name}",
    "telephone": "${activeClient.phone}",
    "areaServed": "${activeClient.location}",
    "aggregateRating": {
      "ratingValue": "4.98",
      "reviewCount": "142"
    }
  },
  "performance": {
    "fcp": "0.22s",
    "lcp": "0.38s",
    "ttfb": "38ms",
    "lighthouse": 99
  }
}`}
                  </pre>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Tenant Specs */}
                  <div className="lg:col-span-6 space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                        {activeClient.trade}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">📍 {activeClient.location}</span>
                      <span className="text-xs text-slate-500 font-mono">📞 {activeClient.phone}</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight leading-snug font-display">
                      {activeClient.tagline}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
                      Dynamically configured sub-domain and custom domain instance for{' '}
                      <strong className="text-slate-900">{activeClient.name}</strong>.
                      All localized schema markup, CSS tokens, estimation calculators, and SMS alerts are synchronized automatically.
                    </p>

                    <div className="space-y-2 pt-1 font-mono text-xs">
                      {activeClient.badges.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2 text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex flex-wrap items-center gap-4">
                      {activeClient.ctaUrl.startsWith('/') ? (
                        <a
                          href={activeClient.ctaUrl}
                          id={`simulator-launch-${activeClient.slug}`}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
                        >
                          <span>Launch Live Client Site</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <a
                          href="#contact"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
                        >
                          <span>Request Custom Demo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a
                        href={`/platform?edit=${activeClient.slug}`}
                        className="text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        Configure In Platform Admin →
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Visual Preview */}
                  <div className="lg:col-span-6 relative flex justify-center">
                    <div
                      className={`relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 group transition-all duration-300 ${
                        deviceView === 'mobile' ? 'max-w-[280px] w-full aspect-[9/16]' : 'w-full h-80'
                      }`}
                    >
                      <img
                        src={activeClient.image}
                        alt={activeClient.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-6 flex flex-col justify-end text-white">
                        <div className="text-[11px] font-mono text-sky-300 font-bold uppercase tracking-wider mb-1">
                          Verified Performance Benchmark
                        </div>
                        <div className="text-3xl font-extrabold font-mono text-white mb-1">
                          {activeClient.metric}
                        </div>
                        <div className="text-xs text-slate-200">{activeClient.metricLabel}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Infinite Tech Stack & Infrastructure Marquee ─── */}
      <section className="py-10 bg-white border-y border-slate-200/80 overflow-hidden relative z-20">
        <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
            Built On High-Performance Modern Web Standards
          </p>
        </div>
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex items-center gap-8 whitespace-nowrap w-max animate-pulse">
            {[
              'React 18 Architecture',
              'Cloudflare Edge Workers',
              'Sub-380ms TTFB Response',
              'JSON-LD Geo Schema',
              'Multi-Tenant DNS Router',
              'Instant SMS Lead Webhook',
              'Lighthouse 100/100 Core Vitals',
              'PostgreSQL Data Persistence',
              'Tailwind Fluid Token System',
              'Framer Motion Springs',
              'React 18 Architecture',
              'Cloudflare Edge Workers',
              'Sub-380ms TTFB Response',
              'JSON-LD Geo Schema',
              'Multi-Tenant DNS Router',
              'Instant SMS Lead Webhook',
              'Lighthouse 100/100 Core Vitals',
              'PostgreSQL Data Persistence',
            ].map((pill, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-700 shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span className="font-semibold">{pill}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bento Grid Capabilities ─── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono uppercase tracking-wider mb-3">
            <Monitor className="w-3.5 h-3.5" />
            <span>Full-Stack Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-[-0.03em] mb-4 font-display">
            Built For Sub-Second Speed &amp; High-Ticket Leads
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            No bloated WordPress themes or slow database builders. Everything is custom-engineered on modern edge infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Lighthouse 100/100 */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-6">
                <Gauge className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-950 mb-3 font-display">
                Sub-Second Headless Speed (&lt;380ms)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mb-6">
                Engineered with React 18, Vite, and distributed edge CDN asset pipelines. Zero WordPress plugin lag.
                Your platform achieves perfect 99/100 Lighthouse performance, maximizing Google quality scores and slashing paid ad acquisition costs.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-700 pt-4 border-t border-slate-100">
              <span className="px-3 py-1 rounded-lg bg-slate-100 font-semibold">FCP: 0.2s</span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 font-semibold">LCP: 0.38s</span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 font-semibold">CLS: 0.00</span>
              <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">99/100 Core Web Vitals</span>
            </div>
          </motion.div>

          {/* Bento Card 2: Multi-Tenant Provisioning */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-6">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-3 font-display">
                60-Second Client Pitch Engine
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Spin up live interactive pitches for prospects in 60 seconds with custom brand CSS palettes, local phones, and custom domain bindings.
              </p>
            </div>
            <a
              href="/platform"
              className="text-xs font-mono text-blue-600 font-bold flex items-center gap-1.5 hover:underline"
            >
              <span>Launch Agency Platform</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Bento Card 3: Geo SEO */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-6">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-3 font-display">
                Algorithmic Local SEO
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Structured JSON-LD schema markup, geo-coordinate mapping, and targeted city clusters built to win top Google 3-Pack rankings.
              </p>
            </div>
            <div className="text-xs font-mono text-emerald-600 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Rich Snippets &amp; Schema Verified</span>
            </div>
          </motion.div>

          {/* Bento Card 4: Automated Funnels & SMS */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2 p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-950 mb-3 font-display">
                Automated Quote Calculators &amp; Instant SMS Dispatch
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mb-6">
                Interactive multi-step estimation widgets calculate ballpark prices and capture homeowner contact info,
                instantly alerting your sales team via SMS and email so you close before competitors call back.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-700 pt-4 border-t border-slate-100">
              <span className="px-3 py-1 rounded-lg bg-slate-100 font-semibold">Zero Friction Booking</span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 font-semibold">Real-Time SMS Alerts</span>
              <span className="px-3 py-1 rounded-lg bg-slate-100 font-semibold">CRM Webhook Sync</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Interactive Quote Calculator Widget ─── */}
      <section id="estimator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200/80">
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 30 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-lg text-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono uppercase tracking-wider mb-4">
            <Flame className="w-3.5 h-3.5" />
            <span>Interactive Estimator Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 font-display mb-3">
            Dynamic Instant Estimator Prototype
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-10">
            Contractors close up to 3.8x more leads by providing instant interactive pricing guidance upfront.
          </p>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-6 max-w-2xl mx-auto text-left">
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-700 font-semibold">Estimated Roof Area (Squares):</span>
                <span className="font-bold text-blue-600">{estSquares} Squares (~{estSquares * 100} sq ft)</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={estSquares}
                onChange={(e) => setEstSquares(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="text-xs font-mono text-slate-700 font-semibold mb-2">Select Specification:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'architectural', label: 'Architectural Shingle' },
                  { id: 'metal', label: 'Standing Seam Metal' },
                  { id: 'designer', label: 'Luxury Designer Slate' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setEstMaterial(m.id as any)}
                    className={`py-2.5 px-3 text-xs font-mono rounded-xl border transition-all cursor-pointer ${
                      estMaterial === m.id
                        ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-slate-500 uppercase block">Estimated Price Range:</span>
                <span className="text-xs text-slate-500 font-sans">Turnkey tear-off, underlayment &amp; lifetime labor</span>
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">
                ${calculatedEstimate.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Client Work Showcase ─── */}
      <section id="work" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono uppercase tracking-wider mb-3">
            <span>Portfolio &amp; Client Deployments</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-[-0.03em] mb-4 font-display">
            Active Client Platforms
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Explore live builds operating on this exact multi-tenant platform architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Max Quality Roofing */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all"
          >
            <div className="relative h-60 overflow-hidden">
              <img
                src={heroRoofingImg}
                alt="Max Quality Roofing"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 text-[10px] font-mono uppercase font-bold text-white bg-blue-600 px-3 py-1 rounded-full shadow-md">
                Live Flagship Client
              </span>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 font-display">Max Quality Roofing</h3>
                  <span className="text-xs text-slate-500 font-mono">/max-quality-roofing</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Full architectural shingle &amp; roof replacement platform in Great Falls, MT. Features an instant quick-quote calculator,
                  verified reviews, localized schema, and owner-operated credibility.
                </p>
                <div className="space-y-2 text-xs font-mono text-slate-700 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>Instant 3-Step Quote Estimator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cascade County Local Schema</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>Custom CSS &amp; Brand Colors</span>
                  </div>
                </div>
              </div>
              <a
                href="/max-quality-roofing"
                id="client-link-max-quality-roofing"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-slate-950 hover:bg-black transition-all shadow-sm"
              >
                <span>Launch Live Client Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Card 2: Commercial HVAC */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all"
          >
            <div className="relative h-60 overflow-hidden">
              <img
                src={portfolio1Img}
                alt="Apex Climate Mechanical"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 text-[10px] font-mono uppercase font-bold text-slate-900 bg-white px-3 py-1 rounded-full shadow-md">
                Commercial &amp; Residential
              </span>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 font-display">Apex Climate Mechanical</h3>
                  <span className="text-xs text-slate-500 font-mono">HVAC Dispatch</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Emergency dispatch heating &amp; cooling platform with radius-based service area routing and maintenance plan checkout funnels.
                </p>
                <div className="space-y-2 text-xs font-mono text-slate-700 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>24/7 Emergency Dispatch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>Radius-Based Service Mapping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>Annual Tune-Up Checkouts</span>
                  </div>
                </div>
              </div>
              <a
                href="#contact"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
              >
                <span>Request Custom Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>

          {/* Card 3: Horizon Custom Renovations */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all"
          >
            <div className="relative h-60 overflow-hidden">
              <img
                src={portfolio3Img}
                alt="Horizon Custom Renovations"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 text-[10px] font-mono uppercase font-bold text-slate-900 bg-white px-3 py-1 rounded-full shadow-md">
                Luxury Remodeling
              </span>
            </div>
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 font-display">Horizon Renovations</h3>
                  <span className="text-xs text-slate-500 font-mono">Design-Build</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Architectural home remodeling showcase with interactive before/after transformation galleries and financing eligibility calculators.
                </p>
                <div className="space-y-2 text-xs font-mono text-slate-700 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>Interactive Before/After Sliders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>Financing Pre-Qualification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                    <span>Architectural Inquiry Form</span>
                  </div>
                </div>
              </div>
              <a
                href="#contact"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
              >
                <span>Request Custom Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Interactive Contractor ROI Calculator ─── */}
      <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200/80">
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 30 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-lg text-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono uppercase tracking-wider mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Interactive ROI Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 font-display mb-3">
            Calculate Your Revenue Acceleration
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-10">
            Drag the slider below to model your added contract revenue with our sub-second quote funnels and local SEO rankings.
          </p>

          <div className="space-y-6 max-w-xl mx-auto">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-slate-600">Monthly High-Ticket Jobs Closed:</span>
              <span className="font-extrabold text-blue-600 text-lg">{roiJobs} jobs/mo</span>
            </div>

            <input
              type="range"
              min="5"
              max="80"
              value={roiJobs}
              onChange={(e) => setRoiJobs(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase">Estimated Monthly Gross</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono mt-1">
                  ${(roiJobs * 9500).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase">Projected Annual Lift</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono mt-1">
                  +${(roiJobs * 9500 * 0.35 * 12).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Project Consultation & Proposal Form ─── */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200/80">
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 30 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-14 shadow-xl overflow-hidden"
        >
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono uppercase tracking-wider mb-3">
              <span>Start A Project</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-[-0.03em] mb-3 font-display">
              Request A Custom Proposal &amp; Prototype
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Tell us about your contracting company. We will review your local market and provide a working interactive prototype within 24 hours.
            </p>
          </div>

          {isSubmitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center text-slate-800">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-4 font-bold text-xl">
                ✓
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 font-display">Inquiry Dispatched to Engineering!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">
                Thank you! Our technical director will inspect your local territory and contact you at{' '}
                <span className="font-mono font-bold text-slate-900">{formData.email || 'your email'}</span> with a custom live preview link.
              </p>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 text-white hover:bg-black transition-all"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trade Selector Chips */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-2 font-semibold">
                  1. Select Your Trade Discipline
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Roofing', 'HVAC & Mechanical', 'Remodeling & Build', 'Plumbing', 'Commercial Services'].map((trade) => (
                    <button
                      type="button"
                      key={trade}
                      onClick={() => setSelectedTrade(trade)}
                      className={`px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        selectedTrade === trade
                          ? 'bg-slate-950 text-white font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {trade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Investment Scope Chips */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 mb-2 font-semibold">
                  2. Target Investment Scope
                </label>
                <div className="flex flex-wrap gap-2">
                  {['$3k – $5k', '$5k – $10k', '$10k+ Multi-Tenant Suite'].map((tier) => (
                    <button
                      type="button"
                      key={tier}
                      onClick={() => setSelectedBudget(tier)}
                      className={`px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        selectedBudget === tier
                          ? 'bg-slate-950 text-white font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 mb-1.5 font-bold">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Max Poitra"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 mb-1.5 font-bold">
                    Direct Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="max@qualityroofing.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 mb-1.5 font-bold">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(406) 217-1720"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-700 mb-1.5 font-bold">
                    Current Website (if any)
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://contractor.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-700 mb-1.5 font-bold">
                  Primary Service Cities &amp; Current Business Challenges
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your target territory, current monthly lead volume, and goals..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Transmitting Request...' : 'Request Interactive Prototype & Proposal'}</span>
              </button>
            </form>
          )}
        </motion.div>
      </section>

      {/* ─── Pristine Light Mode Footer ─── */}
      <footer className="border-t border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-white font-bold">
                <Layers className="w-4 h-4 text-sky-400" />
              </div>
              <span className="font-extrabold text-slate-900 text-lg font-mono">HISPANGO AGENCY</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Engineering high-converting digital platforms and multi-tenant architectures for trade contractors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8 text-xs font-mono text-slate-600 font-semibold">
            <a href="#demo" className="hover:text-blue-600 transition-colors">
              Live Demo
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Capabilities
            </a>
            <a href="#estimator" className="hover:text-blue-600 transition-colors">
              Estimator
            </a>
            <a href="#work" className="hover:text-blue-600 transition-colors">
              Client Archive
            </a>
            <a href="/platform" className="hover:text-blue-600 transition-colors text-blue-600 font-bold">
              Agency Platform
            </a>
            <a href="/admin" className="hover:text-blue-600 transition-colors">
              Admin Portal
            </a>
          </div>

          <div className="text-right text-[11px] font-mono text-slate-500">
            <div>© {new Date().getFullYear()} HispanGo Digital Agency. All rights reserved.</div>
            <div className="text-emerald-600 font-semibold mt-1 flex items-center justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Edge Nodes Active (Global CDN)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AgencyHome;
