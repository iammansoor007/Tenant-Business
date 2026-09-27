import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useEffect, useState, useCallback, useMemo, memo } from "react";
import AboutImg from "@/assets/aboutm.webp";
import { useTenantData, useTenantMedia, useTenant } from "../context/TenantContext";

const Counter = memo(
  ({
    value,
    suffix = "",
    duration = 1.8,
  }: {
    value: number | string;
    suffix?: string;
    duration?: number;
  }) => {
    const ref = useRef(null);
    const isNumeric = typeof value === "number" || (!isNaN(Number(value)) && typeof value !== "boolean");
    const numValue = isNumeric ? Number(value) : 0;
    const [display, setDisplay] = useState<number | string>(isNumeric ? 0 : value);
    const inView = useInView(ref, { once: true, margin: "0px" });
    const shouldReduceMotion = useReducedMotion();
    const hasAnimatedRef = useRef(false);
    const animationFrameRef = useRef<number>();

    useEffect(() => {
      if (!isNumeric) {
        setDisplay(value);
        return;
      }
      if (!inView || hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      if (shouldReduceMotion) {
        setDisplay(numValue);
        return;
      }

      let startTime: number;
      const startValue = 0;
      const endValue = numValue;
      const durationMs = duration * 1000;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(
          startValue + (endValue - startValue) * eased,
        );
        setDisplay(current);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setDisplay(endValue);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [inView, value, numValue, isNumeric, duration, shouldReduceMotion]);

    return (
      <span ref={ref} className="tabular-nums inline-flex items-baseline">
        <span className="text-2xl sm:text-3xl font-black">
          {typeof display === "number" ? display.toLocaleString() : display}
        </span>
        {suffix && (
          <span className="text-sm sm:text-base font-bold ml-1 opacity-90">
            {suffix}
          </span>
        )}
      </span>
    );
  },
);

Counter.displayName = "Counter";

const ParticlesBackground = memo(() => {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" className="text-primary" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotPattern)" />
      </svg>
    </div>
  );
});

ParticlesBackground.displayName = "ParticlesBackground";

const StatCard = memo(
  ({
    value,
    suffix,
    label,
  }: {
    value: number | string;
    suffix: string;
    label: string;
    index?: number;
  }) => {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative p-4 sm:p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 w-full flex flex-col justify-between overflow-hidden"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--graphite-color)",
        }}
      >
        {/* Accent top line */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
          style={{
            background: "linear-gradient(90deg, var(--cta-hex), var(--secondary-hex))",
          }}
        />

        <div className="mb-2">
          <div
            className="leading-none tracking-tight mb-2"
            style={{
              color: "var(--primary-hex)",
              fontFamily: "var(--font-heading)",
            }}
          >
            <Counter value={value} suffix={suffix} />
          </div>

          <div
            className="w-8 h-0.5 rounded-full"
            style={{ background: "linear-gradient(90deg, var(--primary-hex), transparent)" }}
          />
        </div>

        <p
          className="text-xs font-bold leading-snug uppercase tracking-wider"
          style={{ color: "var(--silver-color)" }}
        >
          {label}
        </p>
      </motion.div>
    );
  },
);

StatCard.displayName = "StatCard";

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const completeData = useTenantData();
  const tenantMedia = useTenantMedia();
  const { tenant } = useTenant();
  const isFlagship = !tenant || tenant.slug === "max-quality-roofing";

  const aboutData = completeData?.about || {};
  const badge = aboutData.badge || "About Us";
  const rawHeadline = aboutData.headline;
  const headline = useMemo(() => {
    const rawHighlight = typeof rawHeadline === "object" && rawHeadline !== null
      ? rawHeadline.highlight
      : "Quality Roofing";
    const highlight = (!isFlagship)
      ? (tenant?.name || (rawHighlight?.includes("Max") ? "Quality Roofing" : rawHighlight))
      : (rawHighlight || "Quality Roofing");

    return {
      prefix: (typeof rawHeadline === "object" && rawHeadline?.prefix) || "Welcome to",
      highlight,
      suffix: (typeof rawHeadline === "object" && rawHeadline?.suffix) || "",
    };
  }, [rawHeadline, isFlagship, tenant]);

  const rawDescription = aboutData.description || "";
  const description = useMemo(() => {
    if (isFlagship || !rawDescription) return rawDescription;
    let d = rawDescription;
    if (tenant?.name) {
      d = d.replace(/Max Quality Roofing/gi, tenant.name);
      d = d.replace(/Owned and operated by Max Poitra/gi, `Owned and operated by ${tenant.name}`);
      d = d.replace(/Max Poitra/gi, "our licensed team");
    } else {
      d = d.replace(/Max Quality Roofing/gi, "our company");
      d = d.replace(/Owned and operated by Max Poitra/gi, "Owned and operated by licensed roofing specialists");
      d = d.replace(/Max Poitra/gi, "our licensed team");
    }
    if (tenant?.location) {
      d = d.replace(/Great Falls, Montana/gi, tenant.location);
      d = d.replace(/Montana weather/gi, `${tenant.state || "local"} weather`);
    } else {
      d = d.replace(/Great Falls, Montana/gi, "our service area");
      d = d.replace(/Montana weather/gi, "local weather");
    }
    d = d.replace(/Great Falls/gi, tenant?.city || tenant?.location || "the local area");
    d = d.replace(/Montana/gi, tenant?.state || "local");
    return d;
  }, [rawDescription, isFlagship, tenant]);

  const rawStats = Array.isArray(aboutData.stats) ? aboutData.stats : [];
  const stats = useMemo(() => {
    return rawStats.map((s: any) => {
      if (!isFlagship && (s.label?.includes("Great Falls") || s.label?.includes("MT"))) {
        return { ...s, label: tenant?.location || "Local Service Area" };
      }
      return s;
    });
  }, [rawStats, isFlagship, tenant]);

  const image = aboutData.image || {};
  const imageAlt = (!isFlagship)
    ? `${tenant?.name || "Our"} team on site`
    : (image.alt || "Roofing experts");

  const buttons = Array.isArray(aboutData.buttons) ? aboutData.buttons : [];
  const trustBadges = Array.isArray(aboutData.trustBadges) ? aboutData.trustBadges : [];
  const coreValues = Array.isArray(aboutData.coreValues) ? aboutData.coreValues : [];

  const variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 30 },
      visible: (custom: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: custom * 0.15,
          duration: 0.7,
          ease: [0.25, 0.1, 0.25, 1],
        },
      }),
    }),
    [],
  );

  const companyTitle =
    (!isFlagship && tenant?.name) ||
    completeData.header?.title ||
    completeData.navbar?.logoAlt?.replace(/\s*Logo$/i, '') ||
    'Our Roofing Company';

  return (
    <section
      ref={sectionRef}
      className="relative bg-background overflow-hidden py-6 md:py-8 lg:py-12"
      aria-label={`About ${companyTitle}`}
    >
      <div className="absolute inset-0">
        <ParticlesBackground />
        <div className="absolute inset-0 bg-primary/[0.02]" />
      </div>

      {/* STATIC DECORATIVE ELEMENTS FOR PERFORMANCE */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full opacity-50" />
        <div className="absolute -bottom-40 -right-40 w-[30rem] h-[30rem] bg-primary/5 rounded-full opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 xl:gap-16 items-stretch ">
          <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            custom={0}
            className="relative group h-full w-full "
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700 transform-gpu" />

            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl h-full"
              style={{ boxShadow: "0 25px 50px -12px rgba(var(--black-rgb), 0.15)" }}
            >
              <div className="relative h-full min-h-[400px] lg:min-h-full">
                <img
                  src={tenantMedia.aboutImage || AboutImg}
                  alt={imageAlt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                  decoding="async"
                  width="800"
                  height="1000"
                />

                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent" />

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6"
                >
                  <div className="bg-card/95 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-xl border border-border">
                    <span className="flex items-center gap-2 text-sm font-bold text-primary">
                      <span className="text-lg">🇺🇸</span>
                      {image.badge}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            custom={1}
            className="flex flex-col justify-center space-y-8"
          >
            <motion.div
              variants={variants}
              custom={2}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border w-fit"
              style={{ background: "rgba(var(--primary-rgb), 0.08)", borderColor: "rgba(var(--primary-rgb), 0.25)" }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--primary-hex)" }} />
              <span className="uppercase tracking-[0.2em] text-xs font-black" style={{ color: "var(--primary-hex)" }}>
                {badge}
              </span>
            </motion.div>

            <div className="space-y-4">
              <motion.h2
                variants={variants}
                custom={3}
                className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight"
                style={{ color: "var(--heading-color)", fontFamily: "var(--font-heading)" }}
              >
                {headline.prefix}{" "}
                <span style={{ color: "var(--primary-hex)" }}>{headline.highlight}</span>{" "}
                <span style={{ color: "var(--body-text-color)" }}>{headline.suffix}</span>
              </motion.h2>

              <motion.div
                variants={variants}
                custom={4}
                className="w-20 h-1 rounded-full"
                style={{ background: "linear-gradient(90deg, var(--primary-hex), var(--primary-hover-hex))" }}
              />
            </div>

            <motion.p
              variants={variants}
              custom={5}
              className="text-base md:text-lg leading-relaxed font-medium"
              style={{ color: "var(--body-text-color)" }}
              dangerouslySetInnerHTML={{ __html: description }}
            />

            {coreValues && (
              <motion.div
                variants={variants}
                custom={5.5}
                className="flex flex-wrap gap-2 pt-2"
              >
                {coreValues.map((value: string) => (
                  <span
                    key={value}
                    className="px-3 py-1.5 text-[11px] font-bold rounded-full uppercase tracking-wide whitespace-nowrap"
                    style={{ background: "rgba(var(--primary-rgb), 0.08)", color: "var(--primary-hex)", border: "1px solid rgba(var(--primary-rgb), 0.2)" }}
                  >
                    {value}
                  </span>
                ))}
              </motion.div>
            )}

            <motion.div variants={variants} custom={6} className="pt-2 w-full">
              <div className="flex flex-row sm:flex-col md:flex-row flex-wrap items-center gap-3 sm:gap-4 md:gap-4 w-full">
                {buttons.map((button: any, idx: number) =>
                  button.primary ? (
                    <motion.a
                      key={idx}
                      href={button.href}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden w-full sm:w-auto md:w-auto min-w-[180px] sm:min-w-[200px] md:min-w-[180px] lg:min-w-[200px] px-5 sm:px-8 md:px-6 lg:px-8 py-3.5 sm:py-4 md:py-3.5 lg:py-4 rounded-2xl inline-flex items-center justify-center gap-2 font-bold text-sm sm:text-base transition-all duration-300 shadow-xl whitespace-nowrap"
                      style={{ background: "linear-gradient(135deg, var(--cta-hex), var(--secondary-hex))", color: "#FFFFFF", boxShadow: "0 8px 32px rgba(18, 54, 90, 0.4)" }}
                    >
                      <span
                        className="
              absolute inset-0 opacity-0 group-hover:opacity-100
              bg-gradient-to-r from-white/20 via-transparent to-white/10
              transition-opacity duration-100
            "
                      />

                      <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                        <span className="whitespace-nowrap">{button.text}</span>

                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </span>
                    </motion.a>
                  ) : (
                    <motion.a
                      key={idx}
                      href={button.href}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden w-full sm:w-auto md:w-auto min-w-[180px] sm:min-w-[200px] md:min-w-[180px] lg:min-w-[200px] px-5 sm:px-8 md:px-6 lg:px-8 py-3.5 sm:py-4 md:py-3.5 lg:py-4 rounded-2xl inline-flex items-center justify-center gap-2 font-bold text-sm sm:text-base transition-all duration-300 whitespace-nowrap"
                      style={{ background: "transparent", color: "var(--heading-color)", border: "2px solid var(--secondary-hex)" }}
                    >
                      <span
                        className="
              absolute inset-0 opacity-0 group-hover:opacity-100
              bg-gradient-to-r from-white/10 via-transparent to-white/5
              transition-opacity duration-300
            "
                      />

                      <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
                        <span className="whitespace-nowrap">{button.text}</span>

                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:rotate-45"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 7l7-7M7 7l7 7M7 7h10"
                          />
                        </svg>
                      </span>
                    </motion.a>
                  ),
                )}
              </div>
            </motion.div>

            <motion.div
              variants={variants}
              custom={7}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-8"
            >
              {stats.map((stat: any, index: number) => (
                <StatCard key={stat.label} {...stat} index={index} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-1 pointer-events-none">
        <svg
          viewBox="0 0 1440 60"
          className="relative block w-full h-10 md:h-12"
          preserveAspectRatio="none"
        >
          <path
            fill="url(#redGradient)"
            d="M0,24L60,26.7C120,29,240,34,360,34C480,34,600,29,720,26.7C840,24,960,24,1080,26.7C1200,29,1320,34,1380,36.7L1440,39L1440,60L1380,60C1320,60,1200,60,1080,60C960,60,840,60,720,60C600,60,480,60,360,60C240,60,120,60,60,60L0,60Z"
          />
          <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0.04"
              />
              <stop
                offset="50%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0.06"
              />
              <stop
                offset="100%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0.04"
              />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Integrated Elegant Transition Fade to Services */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
    </section>
  );
}
