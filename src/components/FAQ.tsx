import { useRef, useEffect, useState, memo, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTenantData, useTenantMedia, useTenant } from "../context/TenantContext";
import vectorimage from '../assets/vector.webp'

gsap.registerPlugin(ScrollTrigger);

const Icons = {
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Minus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Document: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Chat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Roof: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 10L12 3L21 10L18 13L12 8L6 13L3 10Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 13V19H18V13" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7v7c0 5.5 10 8 10 8s10-2.5 10-8V7l-10-5z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Storm: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 14.5C4 16.985 6.015 19 8.5 19h7c2.485 0 4.5-2.015 4.5-4.5S17.985 10 15.5 10H14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10L8 13H12L10 16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 5L9 8H14L12 11" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  DocumentCheck: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 15l2 2 4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Tools: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M14.7 6.3L19 2L22 5L17.7 9.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.3 17.7L5 22L2 19L6.3 14.7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 8L8 16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 10L12 3L21 10L18 13L12 8L6 13L3 10Z" stroke="currentColor" strokeWidth="1.5" />
      <rect x="8" y="13" width="8" height="8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Layout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 3v18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  TreePine: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L19 12H16V22H8V12H5L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const ANIMATION_VARIANTS = {
  float: {
    initial: { y: 0 },
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  },
};

const TrustBadge = ({ label, color }: { label: string; color?: string }) => {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-sm"
      style={{
        background: "rgba(var(--white-rgb), 0.1)",
        border: "1px solid rgba(var(--white-rgb), 0.15)",
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: "var(--accent-hex)",
        }}
      />
      <span
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: "var(--white-color)" }}
      >
        {label}
      </span>
    </div>
  );
};

type WhyChooseUsData = {
  section: any;
  features: any;
  stats: any;
  cta: any;
};

const faqvector = vectorimage; // Using the user's imported image

const iconMap = {
  Home: Icons.Home,
  Tools: Icons.Tools,
  Shield: Icons.Shield,
  Storm: Icons.Storm,
  Layout: Icons.Layout,
  TreePine: Icons.TreePine
};

const SubtleBackground = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div
      className="absolute inset-0 opacity-[0.05]"
      style={{
        backgroundImage: `
          linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }}
    />
    <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent" />
    <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent" />
    <div className="absolute top-40 -right-20 w-[500px] h-[500px] bg-primary/[0.03] rounded-full" />
  </div>
);

const FloatingParticles = () => null;

const AccordionItem = ({ item, index, isOpen, onToggle }: { item: any; index: number; isOpen: boolean; onToggle: (index: number) => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative group">
      {/* Background Watermark Number */}
      <div
        className="absolute -left-8 top-1/2 -translate-y-1/2 hidden lg:block select-none pointer-events-none transition-all duration-300"
        style={{
          transform: isHovered ? "translate(-4px, -50%) scale(1.05)" : "translate(0px, -50%) scale(1)",
          opacity: isHovered ? 0.7 : 0.35,
        }}
      >
        <span className={`
          text-[90px] font-black leading-none tracking-tighter
          ${isOpen ? 'text-primary/20' : 'text-muted-foreground/15'}
          transition-colors duration-300
        `}>
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative rounded-2xl border transition-all duration-300"
        style={{
          background: "var(--card-bg)",
          borderColor: isOpen
            ? "var(--primary-hex)"
            : isHovered
              ? "rgba(var(--primary-rgb), 0.35)"
              : "var(--border-color)",
          boxShadow: isOpen
            ? "0 15px 35px rgba(var(--primary-rgb), 0.12)"
            : isHovered
              ? "0 8px 25px rgba(var(--black-rgb), 0.05)"
              : "none",
        }}
      >

        <button
          onClick={() => onToggle(index)}
          className="w-full text-left p-7 md:p-9 focus:outline-none relative z-10"
          aria-expanded={isOpen}
        >
          <div className="flex items-center justify-between gap-6">
            <h3 className={`
              text-base md:text-lg lg:text-xl font-light transition-all duration-500
              ${isOpen
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 font-medium'
                : 'text-card-foreground group-hover:text-card-foreground/90'
              }
            `}>
              {item.question}
            </h3>

            <div className="relative flex-shrink-0">
              <motion.div
                animate={isOpen ? {
                  rotate: 180,
                  scale: 1.1,
                  backgroundColor: 'hsl(var(--primary))',
                  borderColor: 'hsl(var(--primary))',
                } : {
                  rotate: 0,
                  scale: 1,
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: isHovered ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`
                  w-10 h-10 md:w-12 md:h-12 rounded-full border-2
                  flex items-center justify-center
                  transition-all duration-500
                  ${isOpen ? 'bg-primary border-primary' : 'bg-background'}
                `}
              >
                <motion.svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                >
                  <motion.path
                    d={isOpen ? "M5 12h14" : "M12 5v14M5 12h14"}
                    stroke={isOpen ? 'white' : isHovered ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    animate={isOpen ? {
                      d: "M5 12h14"
                    } : {
                      d: "M12 5v14M5 12h14"
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.svg>
              </motion.div>

              {isOpen && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0, 0.4]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="overflow-hidden"
            >
              <div className="px-7 md:px-9 pb-7 md:pb-9">
                <div className="relative pl-6 border-l-2 border-primary/20">
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-5">
                    {item.answer}
                  </p>

                  {item.metadata && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                      {item.metadata.map((meta: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-1 h-1 bg-primary rounded-full" />
                          <span className="text-muted-foreground">{meta.label}:</span>
                          <span className="font-medium text-card-foreground">{meta.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {item.links && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap items-center gap-4 pt-4 border-t border-primary/10"
                    >
                      {item.links.map((link: any, i: number) => (
                        <motion.a
                          key={i}
                          href={link.url}
                          whileHover={{ x: 5 }}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group"
                        >
                          <span>{link.label}</span>
                          <motion.svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="group-hover:translate-x-1 transition-transform"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" />
                          </motion.svg>
                        </motion.a>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-5 left-5 w-3 h-3 border-t-2 border-l-2 border-primary/30 pointer-events-none" />
        <div className="absolute bottom-5 right-5 w-3 h-3 border-b-2 border-r-2 border-primary/30 pointer-events-none" />
      </div>
    </div>
  );
};

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }: { categories: any[]; activeCategory: string; onCategoryChange: (id: string) => void }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      {categories.map((category, index) => {
        const CategoryIcon = category.icon ? iconMap[category.icon as keyof typeof iconMap] : null;
        return (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onCategoryChange(category.id)}
            className={`
              relative px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300
              ${activeCategory === category.id
                ? 'text-white'
                : 'text-muted-foreground hover:text-card-foreground bg-card/50 hover:bg-primary/5'
              }
            `}
          >
            {activeCategory === category.id && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {CategoryIcon && <CategoryIcon />}
              {category.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const completeData = useTenantData();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`
        relative w-full max-w-md transition-all duration-300
        ${isFocused ? 'scale-[1.02]' : 'scale-100'}
      `}
    >
      <div className={`
        relative flex items-center bg-card rounded-full border transition-all duration-300
        ${isFocused
          ? 'border-primary shadow-lg shadow-primary/10'
          : 'border-border hover:border-border/80 shadow-md'
        }
      `}>
        <div className="absolute left-4 text-muted-foreground">
          <Icons.Search />
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder={(completeData.faq as any)?.searchPlaceholder || "Search questions..."}
          onChange={(e) => onSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-11 pr-4 py-3 md:py-3.5 bg-transparent rounded-full text-sm md:text-base text-card-foreground placeholder:text-muted-foreground focus:outline-none"
        />

        {isFocused && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute right-3 text-xs text-muted-foreground"
          >
            ⏎
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const KnowledgeCard = () => {
  const completeData = useTenantData();
  const tenantMedia = useTenantMedia();
  const { tenant } = useTenant();
  const isFlagship = !tenant || tenant.slug === "max-quality-roofing";
  const [isHovered, setIsHovered] = useState(false);
  const rawKnowledgeCard = completeData.faq?.knowledgeCard || {
    badge: "Knowledge Base",
    title: "Still Have Questions?",
    description: "Our roofing specialists are here to give you straightforward answers.",
    buttons: [],
    trustBadges: [],
  };

  const rawPhone = (!isFlagship && tenant?.phone)
    ? tenant.phone
    : (completeData?.footer?.contact?.phone || completeData?.contact?.phone);
  const isFlagshipPhone = rawPhone?.includes("406") && rawPhone?.includes("217-1720");
  const clientPhone = (!isFlagship && isFlagshipPhone) ? "" : (rawPhone || (isFlagship ? "(406) 217-1720" : ""));
  const clientPhoneLink = clientPhone ? `tel:${clientPhone.replace(/[^0-9+]/g, "")}` : "#contact";

  let cleanDesc = rawKnowledgeCard.description || "Our roofing specialists are here to give you straightforward answers.";
  if (!isFlagship) {
    cleanDesc = cleanDesc
      .replace(/Call or text Max directly\. He'll give you/gi, `Call or text our team directly. We'll give you`)
      .replace(/Max directly/gi, "our team directly")
      .replace(/Max /g, "our specialists ")
      .replace(/Great Falls/gi, tenant?.city || tenant?.location || "the local area");
  }

  const cleanButtons = (Array.isArray(rawKnowledgeCard.buttons) ? rawKnowledgeCard.buttons : []).map((btn: any) => {
    if (isFlagship) return btn;
    let text = btn.text || "";
    let href = btn.href || "";
    if (text.includes("406") && text.includes("217-1720")) {
      text = clientPhone ? `Call ${clientPhone}` : "Contact Us";
      href = clientPhone ? clientPhoneLink : "#contact";
    }
    return { ...btn, text, href };
  });

  const knowledgeCard = {
    ...rawKnowledgeCard,
    description: cleanDesc,
    buttons: cleanButtons,
  };
  const activeFaqVector = tenantMedia.faqVector || tenantMedia.vector || faqvector;
  const prefersReducedMotion = useReducedMotion();

  const floatAnimation = prefersReducedMotion
    ? {}
    : {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: [0, -12, 0],
        transition: {
          y: {
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          },
        },
      },
    };

  return (
    <div className="relative mt-16 md:mt-24 lg:mt-32">
      {/* CTA Container */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Luxury Dark-to-Graphite Background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, var(--navy-color) 0%, var(--primary-hover-hex) 100%)",
            boxShadow: "0 25px 60px rgba(var(--navy-rgb), 0.25)",
            border: "1px solid rgba(var(--primary-rgb), 0.25)"
          }}
        />

        {/* Technical Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `linear-gradient(rgba(var(--white-rgb),0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--white-rgb),0.15) 1px, transparent 1px)`,
            backgroundSize: '45px 45px'
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 md:py-8">

          {/* Desktop Layout - Two columns with floating image */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Column - Text Content */}
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-block mb-6"
              >
                <span className="px-4 py-2 text-sm font-bold bg-background/10 border border-white/20 rounded-lg text-white backdrop-blur-sm">
                  {knowledgeCard.badge}
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.2] tracking-tight text-white [&_span]:text-white"
                dangerouslySetInnerHTML={{ __html: knowledgeCard.title }}
              />

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-4 text-white font-medium text-lg max-w-lg"
              >
                {knowledgeCard.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                {(knowledgeCard.buttons || []).map((button: any, idx: number) => (
                  <motion.a
                    key={idx}
                    href={button.href}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      px-8 py-3.5 rounded-full font-black transition-all duration-300 shadow-xl
                      flex items-center gap-2 whitespace-nowrap
                      ${button.primary
                        ? 'bg-white text-heading hover:bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.35)]'
                        : 'bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm'
                      }
                    `}
                  >
                    <span className="whitespace-nowrap">{button.text}</span>
                    <Icons.ArrowRight className="shrink-0" />
                  </motion.a>
                ))}
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 flex gap-4"
              >
                {(knowledgeCard.trustBadges || []).map((b: any) => (
                  <TrustBadge key={b.label} label={b.label} color={b.color} />
                ))}
              </motion.div>
            </div>

            {/* Right Column - Floating FAQ Vector */}
            <div className="relative">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-33rem] w-[85%] lg:w-[90%]"
                style={{ right: '5%' }}
              >
                <img
                  src={activeFaqVector}
                  alt={knowledgeCard.badge}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-contain will-change-transform transform-gpu"
                  style={{
                    filter: "drop-shadow(0 20px 40px rgba(var(--navy-rgb), 0.35))",
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Mobile Layout - Centered text, no image */}
          <div className="lg:hidden text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-4"
            >
              <span className="px-3 py-1.5 text-xs font-semibold bg-background/20 border border-white/30 rounded-full text-white/90 backdrop-blur-sm">
                {knowledgeCard.badge}
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold leading-[1.2] text-white [&_span]:text-white"
              dangerouslySetInnerHTML={{ __html: knowledgeCard.title }}
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-3 text-white font-medium text-base max-w-md mx-auto"
            >
              {knowledgeCard.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
            >
              {(knowledgeCard.buttons || []).map((button: any, idx: number) => (
                <motion.a
                  key={idx}
                  href={button.href}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    px-6 py-3 rounded-full font-black transition-all duration-300 shadow-xl
                    flex items-center justify-center gap-2 whitespace-nowrap
                    ${button.primary
                      ? 'bg-white text-heading hover:bg-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.35)]'
                      : 'bg-white/10 text-white border border-white/30 hover:bg-white/20'
                    }
                  `}
                >
                  <span className="whitespace-nowrap">{button.text}</span>
                  <Icons.ArrowRight className="shrink-0" />
                </motion.a>
              ))}
            </motion.div>


            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {(knowledgeCard.trustBadges || []).map((b: any) => (
                <TrustBadge key={b.label} label={b.label} color={b.color} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div
          className="absolute bottom-0 left-0 w-full h-16 pointer-events-none rounded-b-3xl"
          style={{
            background: "linear-gradient(to top, rgba(var(--black-rgb), 0.2), transparent)",
          }}
        />
      </div>
    </div>
  );
};

const FAQ = () => {
  const completeData = useTenantData();
  const { tenant } = useTenant();
  const isFlagship = !tenant || tenant.slug === "max-quality-roofing";

  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [openItems, setOpenItems] = useState<number[]>([0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const faqData = completeData?.faq || {};
  const rawSection = faqData.section || {
    badge: "FAQ",
    headline: "Frequently Asked Questions",
    description: "Everything you need to know about our roofing services and process.",
  };

  const section = {
    badge: rawSection.badge || "FAQ",
    headline: rawSection.headline || "Frequently Asked Questions",
    description: (!isFlagship && rawSection.description)
      ? rawSection.description
          .replace(/in Great Falls, Montana/gi, tenant?.location ? `in ${tenant.location}` : "for your home or business")
          .replace(/Great Falls/gi, tenant?.city || tenant?.location || "our service area")
      : rawSection.description,
  };

  const categories = Array.isArray(faqData.categories) ? faqData.categories : [];
  const rawItems = Array.isArray(faqData.items) ? faqData.items : [];

  const items = useMemo(() => {
    return rawItems.map((item: any) => {
      if (isFlagship || !item) return item;

      let q = item.question || "";
      let a = item.answer || "";
      const meta = Array.isArray(item.metadata) ? item.metadata.map((m: any) => {
        let val = m.value;
        if (m.label === "Owner" && val?.includes("Max")) {
          val = "Owner Operated";
        } else if (m.label === "Base" && val?.includes("Great Falls")) {
          val = tenant?.location || "Local Service Area";
        }
        return { ...m, value: val };
      }) : [];

      if (tenant?.name) {
        a = a.replace(/Max Quality Roofing/gi, tenant.name);
        a = a.replace(/Max Poitra is a shingle master/gi, `${tenant.name} is a shingle specialist`);
        a = a.replace(/Max Poitra is the owner/gi, `Our leadership is the owner`);
        a = a.replace(/Max Poitra/gi, "our licensed team");
        a = a.replace(/Max personally inspects/gi, "Our team personally inspects");
        a = a.replace(/Max will diagnose/gi, "our specialist will diagnose");
        a = a.replace(/Max will give you/gi, "we will give you");
      } else {
        a = a.replace(/Max Quality Roofing/gi, "our company");
        a = a.replace(/Max Poitra is a shingle master/gi, "our team is a shingle specialist");
        a = a.replace(/Max Poitra is the owner/gi, "Our leadership is the owner");
        a = a.replace(/Max Poitra/gi, "our licensed team");
        a = a.replace(/Max personally inspects/gi, "Our team personally inspects");
        a = a.replace(/Max will diagnose/gi, "our specialist will diagnose");
        a = a.replace(/Max will give you/gi, "we will give you");
      }
      a = a.replace(/Max /g, "Our team ");
      if (tenant?.location) {
        a = a.replace(/Great Falls, Montana/gi, tenant.location);
        a = a.replace(/Great Falls/gi, tenant.city || tenant.location);
        a = a.replace(/Montana weather/gi, `${tenant.state || "local"} weather`);
        a = a.replace(/Montana/gi, tenant.state || "local");
      } else {
        a = a.replace(/Great Falls, Montana/gi, "our service area");
        a = a.replace(/Great Falls/gi, "our service area");
        a = a.replace(/Montana weather/gi, "local weather");
        a = a.replace(/Montana/gi, "local");
      }
      const clientPhone = tenant?.phone || "our direct office line";
      a = a.replace(/\(406\)\s*217-1720/g, clientPhone);

      return {
        ...item,
        question: q,
        answer: a,
        metadata: meta,
      };
    });
  }, [rawItems, isFlagship, tenant]);

  const filteredItems = items.filter((item: any) => {
    if (!item) return false;
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      (item.question && item.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.answer && item.answer.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleToggle = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setOpenItems([]);
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !isClient) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.faq-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isClient]);

  if (!isClient) return null;

  return (
    <section
      ref={sectionRef}
      className="relative bg-background py-20 md:py-24 lg:py-28 overflow-hidden"
    >
      <SubtleBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16 faq-reveal">
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-3 block">
            {section.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4">
            {section.headline}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            {section.description}
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-primary/60 mx-auto mt-6 rounded-full" />
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 md:mb-12 faq-reveal">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
          <SearchBar onSearch={setSearchQuery} />
        </div>

        <div className="space-y-3 md:space-y-4 mb-12 md:mb-16">
          {filteredItems.length > 0 ? (
            filteredItems.map((item: any, index: number) => (
              <AccordionItem
                key={item.id}
                item={item}
                index={index}
                isOpen={openItems.includes(index)}
                onToggle={() => handleToggle(index)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-muted-foreground mb-3">
                <Icons.Document />
              </div>
              <p className="text-muted-foreground text-base">
                {(completeData.faq as any)?.noResultsText || "No questions found matching your search."}
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="mt-4 text-sm text-primary hover:text-primary/80 underline underline-offset-4 cursor-pointer"
              >
                {(completeData.faq as any)?.clearFiltersText || "Clear filters"}
              </button>
            </motion.div>
          )}
        </div>

        {/* Knowledge Base CTA */}
        <KnowledgeCard />
      </div>
    </section>
  );
};

export default FAQ;
