import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTenantData, useTenant } from "../context/TenantContext";

gsap.registerPlugin(ScrollTrigger);

const Icons = {
  ArrowRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Flag: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 2v20M4 2L20 8L4 14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
};

const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={isHovered ? {
        scale: 1.01,
        boxShadow: "0 20px 40px -12px hsl(var(--foreground)/0.08)"
      } : {
        scale: 1,
        boxShadow: "0 10px 30px -10px hsl(var(--foreground)/0.05)"
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`relative bg-card/90 backdrop-blur-sm rounded-2xl border border-primary/50 shadow-xl overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 rounded-2xl border border-primary/30 pointer-events-none" />
      <div className="relative z-10">{children}</div>
      <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-primary/50" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-primary/50" />
    </motion.div>
  );
};

const StatCounter = ({ value, label, suffix = "", delay = 0 }: { value: string; label: string; suffix?: string; delay?: number }) => {
  const ref = useRef(null);
  const [displayValue, setDisplayValue] = useState(0);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const numericValue = parseInt(value);

  useEffect(() => {
    if (!inView) return;
    let startTime: number;
    const duration = 2000;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * numericValue));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, numericValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <div className="text-3xl md:text-4xl lg:text-5xl font-light text-primary mb-2">
        {displayValue}{suffix}
      </div>
      <div className="text-xs md:text-sm font-medium text-primary/70 uppercase tracking-[0.2em]">
        {label}
      </div>
    </motion.div>
  );
};

const CTASection = () => {
  const completeData = useTenantData();
  const { tenant, isFlagship } = useTenant();
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const whyChooseUs = completeData.whyChooseUs || {};
  const rawSection = whyChooseUs.section || {};
  const rawCta = whyChooseUs.cta || {};

  const rawSectionBadge = rawSection.badge || "Why Choose Us";
  const sectionBadge = (!isFlagship && rawSectionBadge?.includes("Max Quality"))
    ? (tenant?.name ? `Why ${tenant.name}` : "Why Choose Us")
    : rawSectionBadge;

  const rawSectionDesc = rawSection.description || "";
  const sectionDesc = (!isFlagship && rawSectionDesc)
    ? rawSectionDesc
        .replace(/Max Quality Roofing/gi, tenant?.name || "our company")
        .replace(/Max Poitra/gi, "our team")
    : rawSectionDesc;

  const rawCtaDesc = rawCta.description || "";
  const ctaDesc = (!isFlagship && rawCtaDesc)
    ? rawCtaDesc
        .replace(/Max Quality Roofing/gi, tenant?.name || "our team")
        .replace(/in Great Falls and surrounding Montana communities/gi, tenant?.location ? `in ${tenant.location} and surrounding areas` : "in your local area")
        .replace(/Great Falls/gi, tenant?.city || tenant?.location || "your area")
        .replace(/Montana/gi, tenant?.state || "local")
    : rawCtaDesc;

  const trustBadges = Array.isArray(rawCta.trustBadges) ? rawCta.trustBadges : [];
  const rawButtons = Array.isArray(rawCta.buttons) ? rawCta.buttons : [];
  const buttons = rawButtons.map((btn: any) => {
    if (isFlagship) return btn;
    let text = btn.text || "Get Started";
    let href = btn.href || "#contact";
    if (href.startsWith("tel:") || text.includes("406") || text.includes("217-1720")) {
      if (tenant?.phone) {
        text = tenant.phone;
        href = `tel:${tenant.phone.replace(/[^0-9+]/g, '')}`;
      } else {
        text = "Request Free Estimate";
        href = "#contact";
      }
    }
    return { ...btn, text, href };
  });

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!sectionRef.current || !isClient) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", toggleActions: "play none none reverse" }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [isClient]);

  if (!isClient) return null;

  return (
    <section ref={sectionRef} className="relative bg-background py-12 md:py-14 lg:py-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }} />
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-30">
        <div className="max-w-3xl mx-auto text-center mb-24 cta-reveal">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-gradient-to-r from-primary/30 to-primary" />
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-primary">
              {sectionBadge}
            </span>
            <div className="w-8 h-[2px] bg-gradient-to-r from-primary to-primary/30" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-6 leading-tight"
            dangerouslySetInnerHTML={{ __html: rawSection.headline || "" }}
          />
          <p className="text-muted-foreground text-lg md:text-xl font-light max-w-2xl mx-auto">
            {sectionDesc}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-24"
        >
          <GlassCard className="p-10 md:p-14">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                  <Icons.Flag />
                  <span className="text-xs font-medium tracking-wider text-primary">
                    {rawCta.badge}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground leading-tight"
                  dangerouslySetInnerHTML={{ __html: rawCta.title || "" }}
                />
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  {ctaDesc}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {trustBadges.map((badgeItem: any, i: number) => {
                    const badgeLabel = typeof badgeItem === "string" ? badgeItem : badgeItem?.label || `Benefit ${i + 1}`;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icons.Check />
                        </div>
                        <span className="text-sm text-muted-foreground">{badgeLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">
                {buttons.map((btn: any, i: number) => (
                  <motion.a
                    key={i}
                    href={btn.href}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative w-full px-8 py-5 text-xs font-medium tracking-[0.2em] uppercase rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 block text-center ${
                      btn.primary
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground'
                        : 'bg-card text-primary border-2 border-primary/20 hover:border-primary/50'
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {btn.text}
                      <Icons.ArrowRight />
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
