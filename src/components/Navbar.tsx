import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  X,
  Menu,
  Quote,
  Star,
  Shield,
  Zap,
  Calendar,
  Building2,
  Home,
  Users,
  Briefcase,
  MessageSquare,
  LayersIcon as Layout,
  Phone,
  FileText,
  CheckCircle,
  Wrench,
  ClipboardCheck,
  Clock,
  Sun,
  Droplets,
  ArrowRight,
} from "lucide-react";
import logo from "../assets/logo.webp";
import logo2nd from "../assets/logo.webp";
import { useTenantData, useTenantMedia, useTenant } from "../context/TenantContext";

const iconMap = {
  Home: ({ className = "text-current" }: { className?: string } = {}) => <Home className={`h-4 w-4 ${className}`} />,
  Briefcase: ({ className = "text-current" }: { className?: string } = {}) => <Briefcase className={`h-4 w-4 ${className}`} />,
  Users: ({ className = "text-current" }: { className?: string } = {}) => <Users className={`h-4 w-4 ${className}`} />,
  MessageSquare: ({ className = "text-current" }: { className?: string } = {}) => <MessageSquare className={`h-4 w-4 ${className}`} />,
  Phone: ({ className = "text-current" }: { className?: string } = {}) => <Phone className={`h-4 w-4 ${className}`} />,
  ClipboardCheck: ({ className = "text-current" }: { className?: string } = {}) => <ClipboardCheck className={`h-4 w-4 ${className}`} />,
  Star: ({ className = "text-current" }: { className?: string } = {}) => <Star className={`h-4 w-4 ${className}`} />,
  Clock: ({ className = "text-current" }: { className?: string } = {}) => <Clock className={`h-4 w-4 ${className}`} />,
  Shield: ({ className = "text-current" }: { className?: string } = {}) => <Shield className={`h-4 w-4 ${className}`} />,
  Image: ({ className = "text-current" }: { className?: string } = {}) => <Briefcase className={`h-4 w-4 ${className}`} />,
  FileText: ({ className = "text-current" }: { className?: string } = {}) => <FileText className={`h-4 w-4 ${className}`} />,
  Calendar: ({ className = "text-current" }: { className?: string } = {}) => <Calendar className={`h-4 w-4 ${className}`} />,
  Wrench: ({ className = "text-current" }: { className?: string } = {}) => <Wrench className={`h-4 w-4 ${className}`} />,
};
const serviceIconMap = {
  Home: ({ isHovered = false }: { isHovered?: boolean }) => (
    <Home
      className={`h-5 w-5 ${isHovered ? "text-primary-foreground" : "text-primary"} transition-colors duration-300`}
    />
  ),
  ClipboardCheck: ({ isHovered = false }: { isHovered?: boolean }) => (
    <ClipboardCheck
      className={`h-5 w-5 ${isHovered ? "text-primary-foreground" : "text-primary"} transition-colors duration-300`}
    />
  ),
  Sun: ({ isHovered = false }: { isHovered?: boolean }) => (
    <Sun
      className={`h-5 w-5 ${isHovered ? "text-primary-foreground" : "text-primary"} transition-colors duration-300`}
    />
  ),
  Droplets: ({ isHovered = false }: { isHovered?: boolean }) => (
    <Droplets
      className={`h-5 w-5 ${isHovered ? "text-primary-foreground" : "text-primary"} transition-colors duration-300`}
    />
  ),
  Building2: ({ isHovered = false }: { isHovered?: boolean }) => (
    <Building2
      className={`h-5 w-5 ${isHovered ? "text-primary-foreground" : "text-primary"} transition-colors duration-300`}
    />
  ),
  Wrench: ({ isHovered = false }: { isHovered?: boolean }) => (
    <Wrench
      className={`h-5 w-5 ${isHovered ? "text-primary-foreground" : "text-primary"} transition-colors duration-300`}
    />
  ),
  Layout: ({ isHovered = false }: { isHovered?: boolean }) => (
    <Layout
      className={`h-5 w-5 ${isHovered ? "text-primary-foreground" : "text-primary"} transition-colors duration-300`}
    />
  ),
};

const scrollToSection = (sectionId: string) => {
  const el = document.getElementById(sectionId);
  if (el) {
    const navbarHeight = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isHoveringMegaMenu, setIsHoveringMegaMenu] = useState(false);
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const servicesButtonRef = useRef<HTMLButtonElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const completeData = useTenantData();
  const tenantMedia = useTenantMedia();
  const { tenant } = useTenant();
  const isFlagship = !tenant || tenant.slug === "max-quality-roofing";
  const activeLogo = tenantMedia.logo || logo;
  const navbarData = completeData.navbar || {};
  const rawServices = Array.isArray(navbarData.services) ? navbarData.services : [];
  const services = rawServices.map((service: any) => {
    if (isFlagship) return service;
    const cleanDesc = (service.description || "")
      .replace(/Max Quality Roofing/gi, tenant?.name || "our company")
      .replace(/Max Poitra/gi, "our licensed team")
      .replace(/Max/g, "our team")
      .replace(/Great Falls/gi, tenant?.city || tenant?.location || "our service area")
      .replace(/Montana weather/gi, `${tenant?.state || "local"} weather`)
      .replace(/Montana/gi, tenant?.state || "local");
    const cleanTitle = (service.title || "")
      .replace(/Max Quality/gi, tenant?.name || "Quality");
    return {
      ...service,
      title: cleanTitle,
      description: cleanDesc,
      features: Array.isArray(service.features) ? service.features : [],
    };
  });
  const companyLinks = navbarData.companyLinks || [];
  const stats = navbarData.stats || [];
  const cta = navbarData.cta || {};
  const ctaButton = navbarData.ctaButton || { href: "#contact", label: "Get Inspection", icon: "Home" };
  const rawPhone = (!isFlagship && tenant?.phone)
    ? tenant.phone
    : (cta?.phone || completeData.contact?.phone || completeData.footer?.contact?.phone || tenant?.phone);
  const isFlagshipNumber = rawPhone?.includes("406") && rawPhone?.includes("217-1720");
  const tenantPhone = (!isFlagship && isFlagshipNumber) ? "" : (rawPhone || (isFlagship ? "(406) 217-1720" : ""));
  const tenantPhoneLink = cta?.phoneLink || (tenantPhone ? `tel:${tenantPhone.replace(/[^0-9+]/g, '')}` : (isFlagship ? "tel:+14062171720" : ""));

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleServicesMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMegaMenu("services");
  };

  const handleServicesMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringMegaMenu) {
        setActiveMegaMenu(null);
      }
    }, 220);
  };

  const handleMegaMenuMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHoveringMegaMenu(true);
    setActiveMegaMenu("services");
  };

  const handleMegaMenuMouseLeave = () => {
    setIsHoveringMegaMenu(false);
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
      setHoveredService(null);
    }, 220);
  };

  const handleLinkClick = () => {
    setActiveMegaMenu(null);
    setIsMenuOpen(false);
    setHoveredService(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target as Node) &&
        servicesButtonRef.current &&
        !servicesButtonRef.current.contains(event.target as Node)
      ) {
        setActiveMegaMenu(null);
        setHoveredService(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
        setActiveMegaMenu(null);
        setHoveredService(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-dark/90 backdrop-blur-xl shadow-lg py-3 border-b border-primary/20"
          : "bg-transparent py-3"
          }`}
      >
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="flex items-center justify-between">
            <motion.a
              href="#"
              className="flex items-center h-12 sm:h-14 lg:h-16 py-0.5 shrink-0 mr-4 sm:mr-6"
              onClick={handleLinkClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={activeLogo}
                alt={(completeData.navbar as any)?.logoAlt || tenant?.name || "Company Logo"}
                decoding="async"
                className="h-10 sm:h-12 lg:h-14 w-auto object-contain max-w-[220px] sm:max-w-[280px] scale-[1.3] sm:scale-[1.4] lg:scale-[1.45] origin-left transform-gpu drop-shadow-md"
              />
            </motion.a>

            <div className="hidden lg:flex items-center space-x-1">
              {companyLinks.map((link) => {
                const LinkIcon = iconMap[link.icon as keyof typeof iconMap] || iconMap.Home;
                const isServices = link.label.toLowerCase() === "services";
                const isServicesActive = isServices && activeMegaMenu === "services";

                if (isServices) {
                  return (
                    <div key={link.label} className="relative">
                      <button
                        ref={servicesButtonRef}
                        onMouseEnter={handleServicesMouseEnter}
                        onMouseLeave={handleServicesMouseLeave}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer ${
                          scrolled
                            ? isServicesActive
                              ? "bg-primary/10 text-primary shadow-sm transition-all duration-200"
                              : "text-foreground hover:text-primary hover:bg-primary/[0.08] transition-all duration-200"
                            : isServicesActive
                            ? "text-white bg-white/10"
                            : "text-white"
                        }`}
                      >
                        <LinkIcon className={`h-4 w-4 ${
                          scrolled
                            ? isServicesActive ? "text-primary" : "text-muted-foreground"
                            : "text-white"
                        }`} />
                        <span className={scrolled ? "" : "text-white font-semibold"}>{link.label}</span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isServicesActive ? "rotate-180" : ""
                        } ${
                          scrolled
                            ? isServicesActive ? "text-primary" : "text-muted-foreground"
                            : "text-white"
                        }`} />
                      </button>
                    </div>
                  );
                }

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      if (link.href.startsWith("#") && link.href.length > 1) {
                        e.preventDefault();
                        scrollToSection(link.href.slice(1));
                      }
                      handleLinkClick();
                    }}
                    onMouseEnter={() => setActiveMegaMenu(null)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer ${
                      scrolled
                        ? "text-foreground hover:text-primary hover:bg-primary/[0.08] transition-all duration-200"
                        : "text-white"
                    }`}
                  >
                    <LinkIcon className={`h-4 w-4 ${
                      scrolled ? "text-muted-foreground" : "text-white"
                    }`} />
                    <span className={scrolled ? "" : "text-white font-semibold"}>{link.label}</span>
                  </a>
                );
              })}
            </div>

            <motion.div
              className="hidden lg:flex items-center shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <a
                href={ctaButton.href}
                onClick={handleLinkClick}
                onMouseEnter={() => setActiveMegaMenu(null)}
                className="group relative px-6 xl:px-7 py-3.5 rounded-xl font-bold transition-all duration-300 shadow-lg hover:scale-105 whitespace-nowrap"
                style={{
                  background: "linear-gradient(135deg, var(--cta-hex), var(--secondary-hex))",
                  color: "#FFFFFF",
                  border: "1px solid rgba(174, 184, 194, 0.35)",
                }}
              >
                <span className="relative z-10 flex items-center space-x-2 text-white whitespace-nowrap">
                  {(() => {
                    const CtaIcon = iconMap[ctaButton.icon as keyof typeof iconMap] || iconMap.Home;
                    return <CtaIcon className="text-white shrink-0" />;
                  })()}
                  <span className="whitespace-nowrap">{ctaButton.label}</span>
                </span>
              </a>
            </motion.div>

            <div className="flex items-center space-x-4 lg:hidden">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                aria-label="Toggle menu"
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X className="h-6 w-6 text-foreground" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <Menu className="h-6 w-6 text-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
               TRULY CENTRALIZED MEGA MENU (Centered on Container/Screen)
             ══════════════════════════════════════════════════ */}
          <AnimatePresence>
            {activeMegaMenu === "services" && (
              <motion.div
                ref={megaMenuRef}
                initial={{ opacity: 0, y: 8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                onMouseEnter={handleMegaMenuMouseEnter}
                onMouseLeave={handleMegaMenuMouseLeave}
                className="absolute left-0 right-0 mx-auto top-full mt-2.5 w-[94vw] max-w-[860px] rounded-2xl border p-5 sm:p-6 overflow-hidden shadow-2xl backdrop-blur-2xl before:content-[''] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3"
                style={{
                  background: "var(--card-bg)",
                  borderColor: "var(--border-color)",
                  boxShadow: "0 25px 50px -12px rgba(var(--black-rgb), 0.2), 0 0 0 1px rgba(var(--border-rgb), 0.7)",
                  zIndex: 1000,
                }}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      {(completeData.navbar as any).servicesMenuTitle || "Architectural Services & Restoration"}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground hidden sm:inline-block">
                    Multi-State Coverage • 100% Workmanship Guaranteed
                  </span>
                </div>

                {/* Balanced 2-Column Symmetrical Service Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
                  {services.map((service) => {
                    const ServiceIcon =
                      serviceIconMap[
                      service.icon as keyof typeof serviceIconMap
                      ] || serviceIconMap.Home;
                    const isCurrentHovered = hoveredService === service.title;

                    return (
                      <motion.a
                        key={service.title}
                        href="#services"
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick();
                          scrollToSection("services");
                        }}
                        onMouseEnter={() => {
                          setHoveredService(service.title);
                          setIsHoveringMegaMenu(true);
                        }}
                        onMouseLeave={() => {
                          setHoveredService(null);
                        }}
                        className="group flex items-start gap-3.5 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer"
                        style={{
                          background: isCurrentHovered
                            ? "rgba(var(--primary-rgb), 0.04)"
                            : "var(--card-bg)",
                          borderColor: isCurrentHovered
                            ? "rgba(var(--primary-rgb), 0.35)"
                            : "var(--border-color)",
                        }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${isCurrentHovered
                            ? "bg-primary text-white scale-105"
                            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                            }`}
                        >
                          <ServiceIcon isHovered={isCurrentHovered} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h3
                              className={`font-bold text-sm tracking-tight transition-colors ${isCurrentHovered
                                ? "text-primary"
                                : "text-foreground group-hover:text-primary"
                                }`}
                            >
                              {service.title}
                            </h3>
                            <ArrowRight
                              className={`h-3.5 w-3.5 text-primary shrink-0 transition-all duration-200 ${isCurrentHovered
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                                }`}
                            />
                          </div>
                          <p
                            className="text-xs leading-relaxed line-clamp-2 mb-2"
                            style={{ color: "var(--silver-color)" }}
                          >
                            {service.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {(Array.isArray(service.features) ? service.features : []).slice(0, 3).map((feature: string) => (
                              <span
                                key={feature}
                                className="px-2 py-0.5 text-[9.5px] font-semibold rounded-md border border-border/70 bg-muted/30 text-muted-foreground group-hover:border-primary/20 group-hover:text-foreground transition-colors"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>

                {/* Bottom Emergency Inspection Bar */}
                <div className="pt-3 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 px-5 sm:px-6 py-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground text-center sm:text-left">
                    <Shield className="h-4 w-4 text-primary shrink-0 hidden sm:inline-block" />
                    <span>
                      Active leak or storm damage?{" "}
                      <strong className="text-foreground">24/7 Rapid Response Available</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {tenantPhone && (
                      <a
                        href={tenantPhoneLink}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors py-1 px-3 rounded-lg hover:bg-primary/10 whitespace-nowrap"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>{tenantPhone}</span>
                      </a>
                    )}
                    <a
                      href="#contact"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick();
                        scrollToSection("contact");
                      }}
                      className="text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm transition-all whitespace-nowrap"
                    >
                      Free Inspection
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "tween",
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-dark z-50 lg:hidden shadow-2xl border-l border-primary/20 overflow-hidden"
            >
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border/50 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-14 w-auto flex items-center justify-start">
                        <img
                          src={activeLogo}
                          alt={(completeData.navbar as any)?.logoAlt || tenant?.name || "Company Logo"}
                          decoding="async"
                          className="h-full w-auto object-contain scale-110 origin-left transform-gpu"
                        />
                      </div>
                    </div>
                    <motion.button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="h-5 w-5 text-card-foreground" />
                    </motion.button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground mb-4">
                        {(completeData.navbar as any).servicesMenuTitle}
                      </h3>
                      <div className="space-y-3">
                        {services.map((service) => {
                          const ServiceIcon =
                            serviceIconMap[
                            service.icon as keyof typeof serviceIconMap
                            ] || serviceIconMap.Home;
                          return (
                            <motion.a
                              key={service.title}
                              href="#services"
                              onClick={(e) => {
                                e.preventDefault();
                                setIsMenuOpen(false);
                                scrollToSection("services");
                              }}
                              className="block p-4 rounded-xl border border-border/80 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 active:scale-[0.98]"
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <ServiceIcon isHovered={false} />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-card-foreground text-base">
                                    {service.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {service.description}
                                  </p>
                                </div>
                              </div>
                            </motion.a>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-card-foreground mb-4">
                        {(completeData.navbar as any).quickLinksTitle}
                      </h3>
                      <div className="space-y-2">
                        {companyLinks.map((link) => {
                          const LinkIcon =
                            iconMap[link.icon as keyof typeof iconMap] ||
                            iconMap.Home;
                          return (
                            <motion.a
                              key={link.label}
                              href={link.href}
                              onClick={(e) => {
                                if (link.href.startsWith("#") && link.href.length > 1) {
                                  e.preventDefault();
                                  scrollToSection(link.href.slice(1));
                                }
                                setIsMenuOpen(false);
                              }}
                              className="flex items-center space-x-3 p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-all duration-300 active:scale-[0.98]"
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="text-card-foreground">
                                <LinkIcon />
                              </div>
                              <span className="font-semibold text-card-foreground text-base">
                                {link.label}
                              </span>
                            </motion.a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-primary/20 bg-brandCard flex-shrink-0">
                  <div className="space-y-4">
                    <a
                      href={ctaButton.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full py-4 font-black rounded-xl text-center shadow-xl transition-all duration-300 active:scale-[0.98] whitespace-nowrap"
                      style={{
                        background: "linear-gradient(135deg, var(--cta-hex), var(--secondary-hex))",
                        color: "#FFFFFF",
                        border: "1px solid rgba(174, 184, 194, 0.35)",
                      }}
                    >
                      <span className="whitespace-nowrap">{(completeData.navbar as any).mobileCtaText || ctaButton.label}</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;