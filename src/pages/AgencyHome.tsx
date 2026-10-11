import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Check,
  Cpu,
  Monitor,
  Flame,
  MousePointerClick,
  ChevronRight,
  Lock,
  Sparkles,
  Zap,
  Globe,
  SlidersHorizontal,
  Clock,
  Phone,
  Send,
  Sliders,
  Maximize2,
  Shield,
  Compass,
} from 'lucide-react';
import heroRoofingImg from '../assets/newhero.webp';
import portfolio1Img from '../assets/portfolio-1-c.webp';
import portfolio2Img from '../assets/portfolio-2.webp';
import portfolio3Img from '../assets/portfolio-3-c.webp';

interface ProjectItem {
  number: string;
  title: string;
  slug: string;
  discipline: string;
  location: string;
  year: string;
  stats: string;
  statsLabel: string;
  image: string;
  tags: string[];
  isLive: boolean;
  liveUrl: string;
  description: string;
}

const PROJECTS: ProjectItem[] = [
  {
    number: '01',
    title: 'Max Quality Roofing',
    slug: 'max-quality-roofing',
    discipline: 'Architectural Roofing Web Platform',
    location: 'Great Falls, MT',
    year: '2026',
    stats: '+380%',
    statsLabel: 'Qualified Estimate Surge',
    image: heroRoofingImg,
    tags: ['Architectural Shingle System', '3-Step Quote Estimator', 'Great Falls Schema'],
    isLive: true,
    liveUrl: '/max-quality-roofing',
    description:
      'Flagship production platform engineered for high-wind Montana climate. Features interactive quick-quote calculation, Shingle Master credibility signals, and localized Cascade County search dominance.',
  },
  {
    number: '02',
    title: 'Apex Climate Mechanical',
    slug: 'apex-climate-mechanical',
    discipline: 'Commercial & Emergency HVAC',
    location: 'Dallas / Fort Worth, TX',
    year: '2026',
    stats: '4.2x',
    statsLabel: 'Lift in Same-Day Dispatches',
    image: portfolio1Img,
    tags: ['24/7 Dispatch Portal', 'Radius-Based Routing', 'Google Guaranteed'],
    isLive: false,
    liveUrl: '#contact',
    description:
      'High-velocity heating and cooling emergency dispatch portal built to route commercial and residential calls within a 60-mile radius with instant technician scheduling.',
  },
  {
    number: '03',
    title: 'Horizon Custom Renovations',
    slug: 'horizon-custom-renovations',
    discipline: 'Luxury Design-Build Atelier',
    location: 'Scottsdale, AZ',
    year: '2025',
    stats: '$1.4M',
    statsLabel: 'Average Custom Project Pipeline',
    image: portfolio3Img,
    tags: ['Interactive Before/After', 'Financing Flow', '3D Architectural Showcase'],
    isLive: false,
    liveUrl: '#contact',
    description:
      'High-end residential design-build portfolio featuring interactive transformation sliders, architectural planning calculators, and private homeowner consultation flows.',
  },
  {
    number: '04',
    title: 'Titan Structural & Framing',
    slug: 'titan-structural',
    discipline: 'Commercial Framing & Hauling',
    location: 'Denver, CO',
    year: '2025',
    stats: '99.8%',
    statsLabel: 'Lighthouse Efficiency Index',
    image: portfolio2Img,
    tags: ['Sub-Trade Verification', 'Equipment Logistics', 'Multi-Tenant Edge'],
    isLive: false,
    liveUrl: '#contact',
    description:
      'Industrial construction and material logistics platform built with strict sub-second performance budgets and localized commercial contractor bid solicitation workflows.',
  },
];

export const AgencyHome: React.FC = () => {
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const activeProject = PROJECTS[activeProjectIdx];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#0A0A0A] font-sans selection:bg-[#0A0A0A] selection:text-white antialiased">
      {/* ─── Studio Top Bar ─── */}
      <div className="border-b border-[#E7E5E4] px-4 sm:px-8 py-2.5 text-[11px] font-mono uppercase tracking-widest text-[#78716C] flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>HISPANGO STUDIO // DIGITAL PLATFORMS FOR TRADE CONTRACTORS</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <span>EDGE NODES: GLOBAL ACTIVE</span>
          <span>EST 2026</span>
          <span className="text-[#0A0A0A] font-bold">ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>

      {/* ─── Main Architectural Header ─── */}
      <header className="sticky top-0 z-50 bg-[#FAFAF9]/90 backdrop-blur-md border-b border-[#E7E5E4] px-4 sm:px-8 py-5 transition-all">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          {/* Studio Brand */}
          <a href="/" className="group flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] text-white flex items-center justify-center font-mono font-bold text-sm tracking-tighter group-hover:scale-105 transition-transform">
              H
            </div>
            <div>
              <div className="font-extrabold tracking-[-0.04em] text-lg text-[#0A0A0A] font-mono leading-none">
                HISPANGO
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#78716C]">
                Digital Systems
              </span>
            </div>
          </a>

          {/* Minimalist Studio Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-xs font-mono uppercase tracking-wider text-[#57534E]">
            <a href="#work" className="hover:text-[#0A0A0A] transition-colors">
              Selected Work
            </a>
            <a href="#simulator" className="hover:text-[#0A0A0A] transition-colors">
              Live Engine
            </a>
            <a href="#disciplines" className="hover:text-[#0A0A0A] transition-colors">
              Disciplines
            </a>
            <a href="#protocol" className="hover:text-[#0A0A0A] transition-colors">
              Protocol
            </a>
            <a href="#contact" className="hover:text-[#0A0A0A] transition-colors">
              Initiate Build
            </a>
          </nav>

          {/* Action Button Group */}
          <div className="flex items-center gap-3">
            <a
              href="/platform"
              id="nav-platform-btn"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-[#0A0A0A] bg-white border border-[#D6D3D1] hover:border-[#0A0A0A] transition-all shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Agency Platform</span>
            </a>
            <a
              href="#contact"
              id="nav-cta-btn"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#0A0A0A] hover:bg-black transition-all"
            >
              <span>Book Strategy</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ─── Hero Section: Bold Editorial Statement ─── */}
        <section className="px-4 sm:px-8 pt-20 pb-24 max-w-[1400px] mx-auto border-b border-[#E7E5E4]">
          <div className="max-w-6xl">
            {/* Metadata Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E7E5E4] text-[11px] font-mono uppercase tracking-widest text-[#57534E] mb-8 shadow-xs">
              <span>[ INDEX VOL. 2026 ]</span>
              <span className="text-[#A8A29E]">//</span>
              <span className="text-blue-600 font-semibold">MULTI-TENANT ARCHITECTURE</span>
            </div>

            {/* Giant Monolithic Headline */}
            <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.04em] text-[#0A0A0A] leading-[0.98] mb-8 font-display">
              We Architect Digital Flagships For Trade Enterprises.
            </h1>

            {/* Editorial Subtitle */}
            <p className="text-lg sm:text-2xl text-[#57534E] font-normal leading-relaxed max-w-3xl mb-12">
              From sub-second custom web systems to instantaneous multi-tenant client pitch engines.
              We transform regional contractors and home service leaders into undeniable market authorities.
            </p>

            {/* Dual Architectural CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href="#work"
                id="hero-view-work-btn"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-xs font-mono uppercase tracking-widest font-bold text-white bg-[#0A0A0A] hover:bg-black transition-all shadow-md"
              >
                <span>Explore Selected Works</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/platform"
                id="hero-platform-btn"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-xs font-mono uppercase tracking-widest font-bold text-[#0A0A0A] bg-white border border-[#D6D3D1] hover:border-[#0A0A0A] transition-all"
              >
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Launch Agency Platform</span>
              </a>
            </div>
          </div>

          {/* Architectural Stat Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-[#E7E5E4] font-mono">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight mb-1">$24M+</div>
              <div className="text-xs uppercase tracking-wider text-[#78716C]">Contractor Revenue Generated</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight mb-1">&lt;380ms</div>
              <div className="text-xs uppercase tracking-wider text-[#78716C]">Global Edge Performance</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight mb-1">50+</div>
              <div className="text-xs uppercase tracking-wider text-[#78716C]">Bespoke Instances Deployed</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight mb-1">100%</div>
              <div className="text-xs uppercase tracking-wider text-[#78716C]">Client Domain Isolation</div>
            </div>
          </div>
        </section>

        {/* ─── Selected Work Archive (Awwwards Style) ─── */}
        <section id="work" className="px-4 sm:px-8 py-24 max-w-[1400px] mx-auto border-b border-[#E7E5E4]">
          {/* Section Sub-Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#E7E5E4] gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 mb-2">
                [ 01 // SELECTED WORK ARCHIVE ]
              </div>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#0A0A0A] font-display">
                Featured Case Studies
              </h2>
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#78716C] max-w-md">
              Each platform operates on isolated data stores, dedicated domain bindings, and automated lead capture engines.
            </div>
          </div>

          {/* Interactive Project Rows & Visual Showcase */}
          <div className="space-y-16">
            {PROJECTS.map((project, idx) => (
              <div
                key={project.slug}
                className="group border border-[#E7E5E4] rounded-2xl bg-white p-6 sm:p-10 shadow-xs hover:border-[#0A0A0A] transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Information */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="font-extrabold text-blue-600">{project.number}</span>
                      <span className="text-[#A8A29E]">//</span>
                      <span className="uppercase text-[#78716C]">{project.location}</span>
                      <span className="text-[#A8A29E]">//</span>
                      <span className="text-[#78716C]">{project.year}</span>
                      {project.isLive && (
                        <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          Active Client
                        </span>
                      )}
                    </div>

                    <h3 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] font-display">
                      {project.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                      {project.description}
                    </p>

                    {/* Tag Badges */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-3 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider bg-[#F5F5F4] text-[#44403C] border border-[#E7E5E4]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Verified Conversion Metric & Action */}
                    <div className="pt-6 border-t border-[#E7E5E4] flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-2xl font-extrabold font-mono text-[#0A0A0A]">
                          {project.stats}
                        </div>
                        <div className="text-[11px] font-mono uppercase text-[#78716C]">
                          {project.statsLabel}
                        </div>
                      </div>

                      {project.isLive ? (
                        <a
                          href={project.liveUrl}
                          id={`client-link-${project.slug}`}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#0A0A0A] hover:bg-black transition-all shadow-sm"
                        >
                          <span>Launch Live Site</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      ) : (
                        <a
                          href="#contact"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-[#0A0A0A] bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#D6D3D1] transition-all"
                        >
                          <span>Request Case Study</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Visual Frame */}
                  <div className="lg:col-span-6 overflow-hidden rounded-xl border border-[#E7E5E4] bg-[#F5F5F4]">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-80 lg:h-96 object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Interactive Multi-Tenant Sandbox ─── */}
        <section id="simulator" className="px-4 sm:px-8 py-24 max-w-[1400px] mx-auto border-b border-[#E7E5E4]">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-blue-600 mb-2">
              [ 02 // REAL-TIME MULTI-TENANT ENGINE ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#0A0A0A] font-display mb-4">
              Instant Tenant Provisioning
            </h2>
            <p className="text-sm sm:text-base text-[#57534E]">
              Our proprietary engine dynamically adapts to any client brand. Toggle between active tenants to watch real-time palette extraction, localized metadata, and DNS domain routing without redeployment.
            </p>
          </div>

          {/* Interactive Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {PROJECTS.slice(0, 3).map((proj, pIdx) => {
              const isSelected = pIdx === activeProjectIdx;
              return (
                <button
                  key={proj.slug}
                  onClick={() => setActiveProjectIdx(pIdx)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#0A0A0A] shadow-md ring-1 ring-[#0A0A0A]'
                      : 'bg-white border-[#E7E5E4] hover:border-[#A8A29E]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-blue-600">{proj.number}</span>
                    <span className="text-[10px] uppercase text-[#78716C]">{proj.location}</span>
                  </div>
                  <div className="font-bold text-sm text-[#0A0A0A] font-display">{proj.title}</div>
                  <div className="text-xs text-[#78716C] mt-1">{proj.discipline}</div>
                </button>
              );
            })}
          </div>

          {/* Mac Architectural Terminal Window */}
          <div className="rounded-2xl border border-[#D6D3D1] bg-white shadow-xl overflow-hidden">
            {/* Window Bar */}
            <div className="px-6 py-4 bg-[#F5F5F4] border-b border-[#E7E5E4] flex items-center justify-between font-mono text-xs text-[#78716C]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E7E5E4] border border-[#D6D3D1] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#E7E5E4] border border-[#D6D3D1] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#E7E5E4] border border-[#D6D3D1] inline-block" />
                <span className="ml-3 font-semibold text-[#0A0A0A]">
                  EDGE INSTANCE // {activeProject.slug}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-white border border-[#E7E5E4] text-[11px] text-[#44403C]">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>tenants.agency/{activeProject.slug}</span>
              </div>
            </div>

            {/* Terminal Preview Content */}
            <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-blue-600 font-bold">
                  ACTIVE TENANT: {activeProject.title}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] font-display">
                  {activeProject.discipline}
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  {activeProject.description}
                </p>
                <div className="space-y-2 font-mono text-xs text-[#44403C]">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Domain Auto-Binding: Active (Edge TLS 1.3)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Dynamic Brand Palette: Injected via CSS Custom Properties</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Local Phone: {activeProject.slug === 'max-quality-roofing' ? '(406) 217-1720' : 'Isolated Direct Line'}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  {activeProject.isLive ? (
                    <a
                      href={activeProject.liveUrl}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#0A0A0A] hover:bg-black transition-all"
                    >
                      <span>Open Live Website</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-[#0A0A0A] bg-[#F5F5F4] border border-[#D6D3D1] hover:bg-[#E7E5E4] transition-all"
                    >
                      <span>Request Tenant Demo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <a
                    href={`/platform?edit=${activeProject.slug}`}
                    className="text-xs font-mono text-[#78716C] hover:text-[#0A0A0A] transition-colors"
                  >
                    Edit In Platform Admin →
                  </a>
                </div>
              </div>

              {/* Terminal Screenshot */}
              <div className="rounded-xl overflow-hidden border border-[#E7E5E4] bg-[#F5F5F4]">
                <img
                  src={activeProject.image}
                  alt={activeProject.title}
                  className="w-full h-72 object-cover object-top"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Disciplines / Technical Capabilities ─── */}
        <section id="disciplines" className="px-4 sm:px-8 py-24 max-w-[1400px] mx-auto border-b border-[#E7E5E4]">
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-blue-600 mb-2">
              [ 03 // TECHNICAL DISCIPLINES ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#0A0A0A] font-display mb-4">
              What Sets Our Platforms Apart
            </h2>
            <p className="text-sm sm:text-base text-[#57534E]">
              We reject bloated WordPress templates, heavy slow builders, and fragile plugins.
              We build pure, high-performance web systems tailored for high-ticket service sales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-[#E7E5E4] shadow-xs">
              <span className="text-2xl font-mono font-extrabold text-blue-600 block mb-4">01</span>
              <h3 className="text-lg font-bold text-[#0A0A0A] mb-2 font-display">Sub-Second Speed</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Vite + React 18 architecture with instant edge CDN distribution. Loads in under 380ms for maximum paid ad conversion rates.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#E7E5E4] shadow-xs">
              <span className="text-2xl font-mono font-extrabold text-blue-600 block mb-4">02</span>
              <h3 className="text-lg font-bold text-[#0A0A0A] mb-2 font-display">Multi-Tenant Engine</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Spin up live interactive pitches for prospective clients in 60 seconds with custom CSS palettes, logos, and local phone numbers.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#E7E5E4] shadow-xs">
              <span className="text-2xl font-mono font-extrabold text-blue-600 block mb-4">03</span>
              <h3 className="text-lg font-bold text-[#0A0A0A] mb-2 font-display">Geo-SEO Domination</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Deep structured JSON-LD schemas, localized city service landing pages, and Google Maps signal optimization.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-[#E7E5E4] shadow-xs">
              <span className="text-2xl font-mono font-extrabold text-blue-600 block mb-4">04</span>
              <h3 className="text-lg font-bold text-[#0A0A0A] mb-2 font-display">Instant Quote Funnels</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Bespoke cost estimators and multi-step qualification widgets that dispatch immediate SMS alerts to your phone.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 4-Stage Sprint Protocol ─── */}
        <section id="protocol" className="px-4 sm:px-8 py-24 max-w-[1400px] mx-auto border-b border-[#E7E5E4]">
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-blue-600 mb-2">
              [ 04 // SPRINT PROTOCOL ]
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#0A0A0A] font-display mb-4">
              From Reconnaissance to Deployment
            </h2>
            <p className="text-sm sm:text-base text-[#57534E]">
              Our streamlined framework guarantees full deployment in days with zero guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono">
            <div className="p-6 rounded-xl bg-white border border-[#E7E5E4]">
              <div className="text-xs uppercase text-[#A8A29E] mb-2">STAGE 01</div>
              <div className="text-base font-bold text-[#0A0A0A] mb-2">Market &amp; SEO Audit</div>
              <p className="text-xs text-[#78716C] leading-relaxed font-sans">
                Deep analysis of local trade competitors, high-ticket keywords, and customer acquisition gaps.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E7E5E4]">
              <div className="text-xs uppercase text-[#A8A29E] mb-2">STAGE 02</div>
              <div className="text-base font-bold text-[#0A0A0A] mb-2">Interactive Prototype</div>
              <p className="text-xs text-[#78716C] leading-relaxed font-sans">
                Live working preview provisioned inside our multi-tenant engine within 48 hours.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E7E5E4]">
              <div className="text-xs uppercase text-[#A8A29E] mb-2">STAGE 03</div>
              <div className="text-base font-bold text-[#0A0A0A] mb-2">Edge Launch &amp; DNS</div>
              <p className="text-xs text-[#78716C] leading-relaxed font-sans">
                Custom domain auto-binding, TLS 1.3 encryption, and global CDN asset distribution.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#E7E5E4]">
              <div className="text-xs uppercase text-[#A8A29E] mb-2">STAGE 04</div>
              <div className="text-base font-bold text-[#0A0A0A] mb-2">Growth &amp; Optimization</div>
              <p className="text-xs text-[#78716C] leading-relaxed font-sans">
                Monthly conversion rate testing, uptime SLA monitoring, and managed platform updates.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Initiate Build: Consultation Terminal ─── */}
        <section id="contact" className="px-4 sm:px-8 py-24 max-w-[1400px] mx-auto border-b border-[#E7E5E4]">
          <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-[#D6D3D1] p-8 sm:p-14 shadow-lg">
            <div className="text-center max-w-xl mx-auto mb-12">
              <div className="text-xs font-mono uppercase tracking-widest text-blue-600 mb-2">
                [ INITIATE YOUR BUILD ]
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] font-display mb-3">
                Request A Custom Live Prototype
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E]">
                Tell us about your contracting business. Our engineering team will review your local territory and deliver a live interactive prototype within 24 hours.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-8 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-center text-[#166534]">
                <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center text-[#16A34A] mx-auto mb-4 font-bold text-xl">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-[#14532D] mb-2 font-display">Inquiry Dispatched to Engineering!</h3>
                <p className="text-xs text-[#166534] max-w-md mx-auto mb-6">
                  Thank you! Our technical director will audit your local competitors and email you at{' '}
                  <span className="font-mono font-bold text-[#14532D]">{formData.email || 'your email'}</span> with a custom live preview link.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-[#14532D] text-white hover:bg-black transition-all"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trade Selector Chips */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#78716C] mb-2 font-semibold">
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
                            ? 'bg-[#0A0A0A] text-white font-bold'
                            : 'bg-[#F5F5F4] text-[#44403C] hover:bg-[#E7E5E4]'
                        }`}
                      >
                        {trade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Investment Scope Chips */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#78716C] mb-2 font-semibold">
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
                            ? 'bg-[#0A0A0A] text-white font-bold'
                            : 'bg-[#F5F5F4] text-[#44403C] hover:bg-[#E7E5E4]'
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
                    <label className="block text-xs font-mono uppercase text-[#78716C] mb-1.5 font-bold">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Max Poitra"
                      className="w-full bg-[#F5F5F4] border border-[#D6D3D1] rounded-xl px-4 py-3 text-xs text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#78716C] mb-1.5 font-bold">
                      Direct Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="max@qualityroofing.com"
                      className="w-full bg-[#F5F5F4] border border-[#D6D3D1] rounded-xl px-4 py-3 text-xs text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#78716C] mb-1.5 font-bold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(406) 217-1720"
                      className="w-full bg-[#F5F5F4] border border-[#D6D3D1] rounded-xl px-4 py-3 text-xs text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-[#78716C] mb-1.5 font-bold">
                      Current Website (if any)
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://contractor.com"
                      className="w-full bg-[#F5F5F4] border border-[#D6D3D1] rounded-xl px-4 py-3 text-xs text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-[#78716C] mb-1.5 font-bold">
                    Primary Service Cities &amp; Current Business Challenges
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your target territory, current monthly lead volume, and goals..."
                    className="w-full bg-[#F5F5F4] border border-[#D6D3D1] rounded-xl p-3.5 text-xs text-[#0A0A0A] placeholder-[#A8A29E] focus:outline-none focus:border-[#0A0A0A] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-white bg-[#0A0A0A] hover:bg-black transition-all shadow-md disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Transmitting Request...' : 'Request Interactive Prototype & Strategy'}</span>
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ─── Architectural Studio Footer ─── */}
      <footer className="border-t border-[#E7E5E4] py-20 px-4 sm:px-8 bg-white">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
          <div>
            <div className="font-extrabold text-2xl tracking-[-0.04em] text-[#0A0A0A] font-mono mb-2">
              HISPANGO AGENCY
            </div>
            <p className="text-xs text-[#78716C] max-w-sm font-sans leading-relaxed">
              Engineering high-converting digital platforms, sub-second architectures, and multi-tenant pitch systems for trade contractors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-10 text-xs font-mono uppercase tracking-wider text-[#57534E]">
            <a href="#work" className="hover:text-[#0A0A0A] transition-colors">
              Selected Work
            </a>
            <a href="#simulator" className="hover:text-[#0A0A0A] transition-colors">
              Live Engine
            </a>
            <a href="/platform" className="hover:text-blue-600 font-bold transition-colors">
              Agency Platform
            </a>
            <a href="/admin" className="hover:text-[#0A0A0A] transition-colors">
              Admin Portal
            </a>
          </div>

          <div className="text-left md:text-right text-[11px] font-mono text-[#A8A29E]">
            <div>© {new Date().getFullYear()} HispanGo Digital Systems.</div>
            <div className="text-emerald-600 font-bold mt-1 flex items-center md:justify-end gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Edge Network: Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AgencyHome;
