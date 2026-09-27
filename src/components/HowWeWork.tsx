import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import {
  Award,
  MessageSquare,
  Compass,
  Clock,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useTenantData, useTenantMedia, useTenant } from "../context/TenantContext";
import vectorimage2 from "@/assets/vector.webp";

const iconMap: Record<string, React.ElementType> = {
  Award,
  MessageSquare,
  Compass,
  Clock,
  Shield,
  Layers,
  Veteran: Award,
  Experience: Clock,
  Warranty: Shield,
  Financing: Layers,
  Certified: Award,
  Community: MessageSquare,
};

const TrustBadge = ({ label }: { label: string }) => {
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
        className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
        style={{ color: "var(--white-color)" }}
      >
        {label}
      </span>
    </div>
  );
};

const CinematicBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div
      className="absolute top-20 left-20 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
      style={{ background: "rgba(var(--primary-rgb), 0.05)" }}
    />
    <div
      className="absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
      style={{ background: "rgba(var(--navy-rgb), 0.06)" }}
    />
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--primary-hex) 1px, transparent 1px), linear-gradient(to bottom, var(--primary-hex) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />
  </div>
);

const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "0px" });

  const completeData = useTenantData();
  const FeatureIcon = iconMap[feature.icon] || Award;

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group h-full cursor-pointer transition-transform duration-300 hover:-translate-y-2 transform-gpu"
    >
      <div
        className="relative h-full overflow-hidden rounded-3xl p-8 flex flex-col transition-all duration-300 shadow-sm hover:shadow-xl"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border-color)",
        }}
      >
        {/* Glow indicator on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(var(--primary-rgb), 0.04), transparent 70%)",
          }}
        />

        {/* Accent top line on hover */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--primary-hex), transparent)",
          }}
        />

        {/* Icon block */}
        <div className="relative mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
            style={{
              background: "rgba(var(--primary-rgb), 0.08)",
              border: "1px solid rgba(var(--primary-rgb), 0.2)",
            }}
          >
            <FeatureIcon
              className="w-7 h-7"
              style={{ color: "var(--primary-hex)" }}
            />
          </div>

          <div
            className="absolute -top-1 -right-1 opacity-40 group-hover:opacity-100 transition-opacity duration-300"
            style={{ color: "var(--primary-hex)" }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h3
            className="text-xl font-bold uppercase tracking-tight transition-colors duration-300"
            style={{
              color: isHovered
                ? "var(--primary-hex)"
                : "var(--heading-color)",
              fontFamily: "var(--font-heading)",
            }}
          >
            {feature.title}
          </h3>
          <div
            className="h-0.5 rounded-full mt-2 transition-all duration-300"
            style={{
              width: isHovered ? "48px" : "0px",
              background:
                "linear-gradient(90deg, var(--primary-hex), transparent)",
            }}
          />
        </div>

        {/* Description */}
        <p
          className="text-sm leading-relaxed flex-1 font-medium"
          style={{ color: "var(--silver-color)" }}
        >
          {feature.description}
        </p>

        {/* Background number watermark */}
        <div
          className="absolute bottom-4 right-4 text-6xl font-black select-none pointer-events-none transition-colors duration-300"
          style={{
            color: isHovered
              ? "rgba(var(--primary-rgb), 0.12)"
              : "rgba(var(--primary-rgb), 0.04)",
          }}
        >
          {(index + 1).toString().padStart(2, "0")}
        </div>

        {/* Bottom accent pill */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
          <span
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "var(--primary-hex)" }}
          >
            {completeData?.whyChooseUs?.section?.standardGuarantee || "Quality Guarantee"}
          </span>
          <CheckCircle2
            className="w-4 h-4"
            style={{ color: "var(--primary-hex)" }}
          />
        </div>
      </div>
    </motion.article>
  );
};

const StatCounter = ({
  value,
  label,
  suffix = "",
  delay = 0,
}: {
  value: string;
  label: string;
  suffix?: string;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isPureNumber = /^\d+$/.test(value.trim());
  const numericValue = isPureNumber ? parseInt(value.trim(), 10) : 0;
  const [displayValue, setDisplayValue] = useState<number | string>(
    isPureNumber ? 0 : value,
  );
  const [isHovered, setIsHovered] = useState(false);
  const inView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!inView || !isPureNumber) {
      if (!isPureNumber) setDisplayValue(value);
      return;
    }

    let startTime: number;
    const duration = 1200;
    const end = numericValue;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, numericValue, isPureNumber, value]);

  const totalLength = (String(displayValue) + suffix).length;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="text-center group cursor-pointer"
    >
      <div className="relative inline-block max-w-full">
        <motion.div
          className={`${totalLength > 10
            ? "text-lg sm:text-xl md:text-2xl"
            : totalLength > 6
              ? "text-2xl sm:text-3xl md:text-4xl"
              : "text-3xl sm:text-4xl md:text-5xl"
            } font-black relative z-10 leading-tight whitespace-nowrap`}
          style={{ color: "var(--primary-hex)" }}
          animate={{
            scale: isHovered ? 1.04 : 1,
            y: isHovered ? -2 : 0,
          }}
        >
          <span>{displayValue}</span>
          {suffix && <span className="ml-0.5">{suffix}</span>}
        </motion.div>

        <motion.div
          className="absolute inset-0 blur-xl pointer-events-none"
          style={{ background: "rgba(var(--primary-rgb), 0.15)" }}
          animate={{
            scale: isHovered ? 1.5 : 1,
            opacity: isHovered ? 0.6 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div
        className="text-xs font-bold tracking-wider mt-2 uppercase whitespace-nowrap"
        style={{ color: "var(--silver-color)" }}
      >
        {label}
      </div>
    </motion.div>
  );
};

const HowWeWork = () => {
  const completeData = useTenantData();
  const tenantMedia = useTenantMedia();
  const { tenant, isFlagship } = useTenant();

  const whyChooseUsData = completeData?.whyChooseUs || {};
  const rawSection = whyChooseUsData.section || {};

  const rawBadge = rawSection.badge || "Why Choose Us";
  const badge = !isFlagship ? (tenant?.name ? `Why ${tenant.name}` : "Why Choose Us") : rawBadge;

  const rawDesc = rawSection.description || "";
  const description = (!isFlagship && rawDesc)
    ? rawDesc
        .replace(/Max Quality Roofing/gi, tenant?.name || "our company")
        .replace(/Max Poitra/gi, "our team")
    : rawDesc;

  const section = {
    ...rawSection,
    badge,
    description,
    headline: rawSection.headline || "",
  };

  const rawFeatures = Array.isArray(whyChooseUsData.features) ? whyChooseUsData.features : [];
  const features = rawFeatures.map((f: any) => {
    if (isFlagship) return f;
    let title = f.title || "";
    let desc = f.description || "";
    title = title.replace(/Max Quality Roofing/gi, tenant?.name || "Our Company");
    title = title.replace(/Montana/gi, tenant?.state || "Local");
    desc = desc.replace(/Max Quality Roofing/gi, tenant?.name || "our company");
    desc = desc.replace(/Max Poitra/gi, "Our team");
    desc = desc.replace(/Max is/gi, "Our team is");
    desc = desc.replace(/he's mastered/gi, "we've mastered");
    desc = desc.replace(/Montana roofs/gi, `${tenant?.state || "local"} roofs`);
    desc = desc.replace(/Montana weather/gi, `${tenant?.state || "local"} weather`);
    desc = desc.replace(/Montana/gi, tenant?.state || "local");
    return { ...f, title, description: desc };
  });

  const rawStats = Array.isArray(whyChooseUsData.stats) ? whyChooseUsData.stats : [];
  const stats = rawStats.map((stat: any, index: number) => {
    if (isFlagship) return stat;
    // Stat 0: Based In / Location
    if (index === 0 || stat.label?.toLowerCase().includes("based")) {
      const city = tenant?.city || (tenant?.location ? tenant.location.split(',')[0].trim() : "");
      const state = tenant?.state || (tenant?.location && tenant.location.includes(',') ? tenant.location.split(',')[1].trim() : "");
      return {
        ...stat,
        value: city || "Local",
        suffix: state ? `, ${state}` : "",
        label: "Based In",
      };
    }
    // Stat 3: Phone / Call or Text
    if (index === 3 || stat.label?.toLowerCase().includes("call") || String(stat.value).includes("406")) {
      if (tenant?.phone) {
        return {
          ...stat,
          value: tenant.phone,
          suffix: "",
          label: "Call or Text",
        };
      }
      return {
        ...stat,
        value: "Top Rated",
        suffix: "",
        label: "Craftsmanship",
      };
    }
    return stat;
  });

  const rawCta = whyChooseUsData.cta || { buttons: [] };
  const ctaTitle = (!isFlagship && rawCta.title)
    ? rawCta.title.replace(/Max Quality Roofing/gi, tenant?.name || "Our Company")
    : (rawCta.title || "");
  const ctaDesc = (!isFlagship && rawCta.description)
    ? rawCta.description
        .replace(/Max Quality Roofing/gi, tenant?.name || "our team")
        .replace(/in Great Falls and surrounding Montana communities/gi, tenant?.location ? `in ${tenant.location} and surrounding areas` : "in your local area")
        .replace(/Great Falls/gi, tenant?.city || tenant?.location || "your area")
        .replace(/Montana/gi, tenant?.state || "local")
    : (rawCta.description || "");

  const ctaButtons = (Array.isArray(rawCta.buttons) ? rawCta.buttons : []).map((button: any) => {
    if (isFlagship) return button;
    let text = button.text || "";
    let href = button.href || "#contact";
    if (href.startsWith("tel:") || text.includes("406") || text.includes("217-1720")) {
      if (tenant?.phone) {
        text = tenant.phone;
        href = `tel:${tenant.phone.replace(/[^0-9+]/g, '')}`;
      } else {
        text = "Request Free Estimate";
        href = "#contact";
      }
    }
    return { ...button, text, href };
  });

  const ctaImageAlt = (!isFlagship && tenant?.name)
    ? `${tenant.name} Professional`
    : (rawCta.imageAlt || "Roofing Professional");

  const cta = {
    ...rawCta,
    badge: rawCta.badge || "START YOUR PROJECT",
    title: ctaTitle,
    description: ctaDesc,
    buttons: ctaButtons,
    imageAlt: ctaImageAlt,
  };

  const activeVector = tenantMedia.howWeWorkVector || tenantMedia.vector || vectorimage2;

  return (
    <section
      id="how-we-work"
      className="relative bg-background py-20 md:py-24 lg:py-28 overflow-hidden"
      aria-label={section.badge || "Why Choose Us"}
    >
      <div id="how-we-work-anchor" className="absolute -top-24" />
      <CinematicBackground />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-20">
        {/* Section Header */}
        <header className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className="w-12 h-[2px]"
                style={{ background: "var(--primary-hex)" }}
              />
              <span
                className="text-xs font-black tracking-[0.3em] uppercase"
                style={{ color: "var(--primary-hex)" }}
              >
                {section.badge}
              </span>
              <div
                className="w-12 h-[2px]"
                style={{ background: "var(--primary-hex)" }}
              />
            </div>

            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight uppercase tracking-tight mb-6"
              style={{
                fontFamily: "var(--font-heading)",
                color: "var(--heading-color)",
              }}
              dangerouslySetInnerHTML={{ __html: section.headline }}
            />

            <p
              className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium"
              style={{ color: "var(--silver-color)" }}
            >
              {section.description}
            </p>
          </motion.div>
        </header>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-20">
          {features.map((feature: any, index: number) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* 4 Stat Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
          {stats.map((stat: any, index: number) => (
            <StatCounter
              key={stat.label}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={0.1 + index * 0.1}
            />
          ))}
        </div>

        {/* ══════════════════════════════════════════════════
            CALL TO ACTION BANNER: 100% Pixel-Perfect identical to FAQ CTA
           ══════════════════════════════════════════════════ */}
        <div className="relative mt-16 md:mt-24 lg:mt-32">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Luxury Dark-to-Graphite Background */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--navy-color) 0%, var(--primary-hover-hex) 100%)",
                boxShadow: "0 25px 60px rgba(var(--navy-rgb), 0.25)",
                border: "1px solid rgba(var(--primary-rgb), 0.25)",
              }}
            />

            {/* Technical Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(var(--white-rgb), 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--white-rgb), 0.15) 1px, transparent 1px)",
                backgroundSize: "45px 45px",
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
                    <span
                      className="px-4 py-2 text-sm font-bold border rounded-lg backdrop-blur-sm"
                      style={{
                        background: "rgba(var(--white-rgb), 0.1)",
                        borderColor: "rgba(var(--white-rgb), 0.2)",
                        color: "var(--white-color)",
                      }}
                    >
                      {cta.badge}
                    </span>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.2] tracking-tight uppercase [&_.text-primary]:text-[var(--accent-hex)]"
                    style={{
                      fontFamily: "var(--font-heading)",
                      color: "var(--white-color)",
                    }}
                    dangerouslySetInnerHTML={{ __html: cta.title }}
                  />

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-4 font-medium text-lg max-w-lg"
                    style={{ color: "var(--light-silver-color)" }}
                  >
                    {cta.description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-8 flex flex-wrap gap-4"
                  >
                    {(Array.isArray(cta.buttons) ? cta.buttons : []).map((button: any, idx: number) => (
                      <motion.a
                        key={idx}
                        href={button.href}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-3.5 rounded-full font-black transition-all duration-300 shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
                        style={{
                          background: button.primary
                            ? "var(--white-color)"
                            : "rgba(var(--white-rgb), 0.1)",
                          color: button.primary
                            ? "var(--heading-color)"
                            : "var(--white-color)",
                          border: button.primary
                            ? "none"
                            : "1px solid rgba(var(--white-rgb), 0.3)",
                          boxShadow: button.primary
                            ? "0 10px 30px rgba(0, 0, 0, 0.35)"
                            : "none",
                        }}
                      >
                        <span className="whitespace-nowrap">{button.text}</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
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
                    {(cta.trustBadges || []).map((b: any) => {
                      const label = typeof b === "string" ? b : b.label;
                      return (
                        <TrustBadge key={label} label={label} />
                      );
                    })}
                  </motion.div>
                </div>

                {/* Right Column - Floating Vector */}
                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute bottom-[-33rem] w-[85%] lg:w-[90%]"
                    style={{ right: "5%" }}
                  >
                    <img
                      src={activeVector}
                      alt={cta.imageAlt}
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
                  <span
                    className="px-3 py-1.5 text-xs font-semibold border rounded-full backdrop-blur-sm"
                    style={{
                      background: "rgba(var(--white-rgb), 0.1)",
                      borderColor: "rgba(var(--white-rgb), 0.2)",
                      color: "var(--white-color)",
                    }}
                  >
                    {cta.badge}
                  </span>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl sm:text-4xl font-bold leading-[1.2] uppercase tracking-tight [&_.text-primary]:text-[var(--accent-hex)]"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--white-color)",
                  }}
                  dangerouslySetInnerHTML={{ __html: cta.title }}
                />

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-3 font-medium text-base max-w-md mx-auto"
                  style={{ color: "var(--light-silver-color)" }}
                >
                  {cta.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
                >
                  {(cta.buttons || []).map((button: any, idx: number) => (
                    <motion.a
                      key={idx}
                      href={button.href}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 rounded-full font-black transition-all duration-300 shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
                      style={{
                        background: button.primary
                          ? "var(--white-color)"
                          : "rgba(var(--white-rgb), 0.1)",
                        color: button.primary
                          ? "var(--heading-color)"
                          : "var(--white-color)",
                        border: button.primary
                          ? "none"
                          : "1px solid rgba(var(--white-rgb), 0.3)",
                        boxShadow: button.primary
                          ? "0 10px 30px rgba(0, 0, 0, 0.35)"
                          : "none",
                      }}
                    >
                      <span className="whitespace-nowrap">{button.text}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </motion.a>
                  ))}
                </motion.div>

                {/* Trust Badges - Mobile */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {(cta.trustBadges || []).map((b: any) => {
                    const label = typeof b === "string" ? b : b.label;
                    return (
                      <TrustBadge key={label} label={label} />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Fade */}
            <div
              className="absolute bottom-0 left-0 w-full h-16 pointer-events-none rounded-b-3xl"
              style={{
                background:
                  "linear-gradient(to top, rgba(var(--black-rgb), 0.2), transparent)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
