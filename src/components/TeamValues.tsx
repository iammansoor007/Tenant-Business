import { useRef, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ownerImg from "../assets/ownerm.webp";
import { useTenantData, useTenantMedia, useTenant } from "../context/TenantContext";

gsap.registerPlugin(ScrollTrigger);



const Icons = {
  Linkedin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 8h4v12H4V8z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 8h4v2c.6-.8 1.5-2 3-2 2.5 0 4 1.5 4 4v8h-4v-6c0-1.5-.5-2-2-2s-2 .5-2 2v6h-4V8z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M22 7l-10 7L2 7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Quote: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10 11H6V7h4v4z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M18 11h-4V7h4v4z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  Sparkle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill="currentColor"
      />
    </svg>
  ),
  Award: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 14l-2 6 6-2 6 2-2-6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  Flag: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 2v20M4 2L20 8L4 14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

const CeoPortrait = () => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  const completeData = useTenantData();
  const tenantMedia = useTenantMedia();
  const { tenant } = useTenant();
  const isFlagship = !tenant || tenant.slug === "max-quality-roofing";
  const leadershipData = completeData?.leadership || {};
  const rawCeoData = leadershipData.ceo || { badges: {}, quote: "", name: "Founder", title: "Owner", achievements: [] };

  const ceoData = {
    ...rawCeoData,
    name: (!isFlagship) ? (tenant?.name || "Leadership Team") : rawCeoData.name,
    alt: (!isFlagship) ? `${tenant?.name || "Our"} Leadership & Craftsmanship` : rawCeoData.alt,
    badges: {
      top: rawCeoData.badges?.top || "Shingle Master",
      bottom: (!isFlagship && rawCeoData.badges?.bottom?.includes("Great Falls"))
        ? (tenant?.location ? `${tenant.location} Proud` : "Locally Owned & Operated")
        : (rawCeoData.badges?.bottom || "Locally Owned & Operated"),
    },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/20 to-primary/20 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-700" />

        <div
          className="relative rounded-2xl overflow-hidden shadow-2xl"
          style={{ boxShadow: "0 25px 50px -12px rgba(var(--black-rgb), 0.15)" }}
        >
          <img
            src={tenantMedia.founderImage || ownerImg}
            alt={ceoData.alt || ceoData.name || "Owner & Founder"}
            loading="lazy"
            decoding="async"
            className="w-full h-[500px] md:h-[600px] object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent" />

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <motion.rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              fill="none"
              stroke="url(#ceoGradient)"
              strokeWidth="1.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                isHovered
                  ? { pathLength: 1, opacity: 0.8 }
                  : { pathLength: 0, opacity: 0 }
              }
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient
                id="ceoGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary)/0.8)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {ceoData.badges?.top && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="absolute top-6 left-6"
          >
            <div className="bg-card/95 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-xl border border-border">
              <span className="flex items-center gap-2 text-xs font-bold text-primary">
                <Icons.Flag />
                {ceoData.badges.top}
              </span>
            </div>
          </motion.div>
        )}

        {ceoData.badges?.bottom && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="absolute bottom-6 right-6"
          >
            <div className="bg-card/95 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-xl border border-border">
              <span className="flex items-center gap-2 text-xs font-bold text-primary">
                <Icons.Award />
                {ceoData.badges.bottom}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const Leadership = () => {
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  const completeData = useTenantData();
  const { tenant } = useTenant();
  const isFlagship = !tenant || tenant.slug === "max-quality-roofing";

  const leadershipData = completeData?.leadership || {};
  const rawSection = leadershipData.section || {};
  const section = {
    ...rawSection,
    description: (!isFlagship && rawSection.description)
      ? rawSection.description.replace(/At Max Quality Roofing/gi, `At ${tenant?.name || "our company"}`)
      : rawSection.description,
  };

  const rawCeo = leadershipData.ceo || { badges: {}, quote: "", name: "Founder", title: "Owner", achievements: [] };
  const ceo = {
    ...rawCeo,
    name: (!isFlagship) ? (tenant?.name || "Leadership Team") : rawCeo.name,
    title: (!isFlagship && rawCeo.title?.includes("OWNER")) ? rawCeo.title : (isFlagship ? rawCeo.title : "OWNER & OPERATOR"),
    quotes: (Array.isArray(rawCeo.quotes) ? rawCeo.quotes : (rawCeo.quote ? [rawCeo.quote] : [])).map((q: string) => {
      if (isFlagship) return q;
      let clean = q.replace(/Max Quality Roofing/gi, tenant?.name || "this company");
      clean = clean.replace(/Max Poitra/gi, "our team");
      clean = clean.replace(/Max /g, "Our team ");
      return clean;
    }),
    description: (Array.isArray(rawCeo.description) ? rawCeo.description : []).map((d: string) => {
      if (isFlagship) return d;
      let clean = d.replace(/Max Quality Roofing/gi, tenant?.name || "our company");
      clean = clean.replace(/Max Poitra is an architectural asphalt shingle specialist and the owner of Max Quality Roofing in Great Falls, Montana/gi,
        `${tenant?.name || "Our team"} is an architectural asphalt shingle specialist serving ${tenant?.location || "the local region"}`);
      clean = clean.replace(/Max Poitra/gi, "our leadership");
      clean = clean.replace(/Great Falls and surrounding Montana communities/gi, `${tenant?.location || "the local community"} and surrounding areas`);
      clean = clean.replace(/Great Falls, Montana/gi, tenant?.location || "the local community");
      clean = clean.replace(/Great Falls/gi, tenant?.city || tenant?.location || "the local community");
      clean = clean.replace(/Montana weather/gi, `${tenant?.state || "local"} weather`);
      clean = clean.replace(/Max Quality\. Max Craftsmanship\./gi, "Unmatched Quality. Uncompromised Craftsmanship.");
      clean = clean.replace(/Max is personally/gi, "Our team is personally");
      return clean;
    }),
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !isClient) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".leadership-reveal",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isClient]);

  if (!isClient) return null;

  return (
    <section
      ref={sectionRef}
      className="relative bg-background py-14 md:py-18 lg:py-20 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent opacity-60" />





      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-30">
        <div className="max-w-3xl mx-auto text-center mb-20 leadership-reveal">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-primary" />
            <span className="text-xs font-black tracking-[0.25em] uppercase text-primary">
              {section.badge}
            </span>
            <div className="w-8 h-[2px] bg-primary" />
          </div>

          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-[1.1] tracking-tight"
            dangerouslySetInnerHTML={{ __html: section.headline || "Leadership & Values" }}
          />

          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            {section.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="leadership-reveal">
            <CeoPortrait />
          </div>

          <div className="space-y-8 leadership-reveal">
            <div>
              <h3 className="text-3xl md:text-4xl font-black text-foreground mb-1 leading-tight tracking-tight">
                {ceo.name}
                <span className="block text-sm font-black text-primary mt-2 tracking-[0.2em] uppercase">
                  {ceo.title}
                </span>
              </h3>

              <div className="mt-8 relative">
                <div className="absolute -left-6 -top-2 text-primary/10">
                  <Icons.Quote />
                </div>
                {(Array.isArray(ceo.quotes) ? ceo.quotes : (ceo.quotes ? [ceo.quotes] : (ceo.quote ? [ceo.quote] : []))).map((quote: string, idx: number) => (
                  <p
                    key={idx}
                    className="text-foreground text-lg md:text-xl font-medium leading-relaxed pl-6 italic"
                  >
                    "{quote}"
                  </p>
                ))}
              </div>

              {(Array.isArray(ceo.description) ? ceo.description : (ceo.description ? [ceo.description] : [])).map((desc: string, idx: number) => (
                <p
                  key={idx}
                  className="mt-6 text-muted-foreground text-base leading-relaxed"
                >
                  {desc}
                </p>
              ))}


            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leadership;
