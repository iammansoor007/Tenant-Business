import { motion } from "framer-motion";
import { useState } from "react";
import {
  Phone,
  ArrowRight,
  Shield,
  Star,
  Clock,
  Building2,
  CheckCircle2,
  Home,
  Hammer,
  AlertTriangle,
  Zap,
  MapPin,
  Droplets,
} from "lucide-react";
import roofingBg from "@/assets/newhero.webp";
import { useTenantData, useTenantMedia, useTenant } from "../context/TenantContext";

const heroIconMap: Record<string, React.ElementType> = {
  Star,
  Building2,
  Clock,
  Shield,
  Home,
  Hammer,
  AlertTriangle,
  MapPin,
  Droplets,
  Phone,
};

const Hero = () => {
  const completeData = useTenantData();
  const { tenant } = useTenant();
  const isFlagship = !tenant || tenant.slug === "max-quality-roofing";
  const heroData = completeData?.hero || {};
  const rawBadge = heroData.badge || "Local & Owner Operated";
  const badge = (!isFlagship)
    ? (rawBadge
        .replace(/Great Falls,\s*Montana/gi, tenant?.location || "Local Service Area")
        .replace(/Great Falls/gi, tenant?.city || tenant?.location || "Local Service Area")
        .replace(/Montana/gi, tenant?.state || "Local"))
    : rawBadge;

  const defaultHeadlines = [
    tenant?.name || completeData?.header?.title || "Premium Roofing.",
    "Maximum Craftsmanship.",
  ];
  const rawHeadlines =
    Array.isArray(heroData.headlines) && heroData.headlines.length > 0
      ? heroData.headlines
      : defaultHeadlines;
  const headlines = isFlagship
    ? rawHeadlines
    : rawHeadlines.map((h: string) => {
        let cleaned = h;
        if (tenant?.name) {
          cleaned = cleaned.replace(/Max Quality\.?/gi, `${tenant.name}.`);
        } else {
          cleaned = cleaned.replace(/Max Quality\.?/gi, "Premium Quality.");
        }
        cleaned = cleaned.replace(/Max Craftsmanship\.?/gi, "Expert Craftsmanship.");
        return cleaned;
      });

  const rawDescription =
    heroData.description ||
    "Architectural asphalt shingle specialist serving homeowners and businesses.";
  const description = isFlagship
    ? rawDescription
    : (() => {
        let d = rawDescription;
        if (tenant?.location) {
          d = d.replace(/Great Falls,\s*Montana and surrounding communities/gi, `${tenant.location} and surrounding communities`);
          d = d.replace(/Great Falls,\s*Montana/gi, tenant.location);
          d = d.replace(/Great Falls/gi, tenant.city || tenant.location);
          d = d.replace(/Montana weather/gi, `${tenant.state || "local"} weather`);
          d = d.replace(/Montana/gi, tenant.state || "local");
        } else {
          d = d.replace(/Great Falls,\s*Montana and surrounding communities/gi, "our service area and surrounding communities");
          d = d.replace(/Great Falls,\s*Montana/gi, "our service area");
          d = d.replace(/Great Falls/gi, "our service area");
          d = d.replace(/Montana weather/gi, "local weather");
          d = d.replace(/Montana/gi, "local");
        }
        if (tenant?.name) {
          d = d.replace(/Max Quality Roofing/gi, tenant.name);
        }
        return d;
      })();

  const rawCurrentPhone = (!isFlagship && tenant?.phone)
    ? tenant.phone
    : (isFlagship ? (completeData.footer?.contact?.phone || completeData.contact?.phone || "(406) 217-1720") : "");
  const isFlagshipPhone = rawCurrentPhone?.includes("406") && rawCurrentPhone?.includes("217-1720");
  const currentPhone = (!isFlagship && isFlagshipPhone) ? "" : rawCurrentPhone;

  const emergencyButton = isFlagship
    ? (heroData.emergencyButton || {
        text: currentPhone ? `Call: ${currentPhone}` : "Call Now",
        href: currentPhone ? `tel:${currentPhone.replace(/[^0-9+]/g, "")}` : "#contact",
      })
    : (currentPhone
        ? { text: `Call: ${currentPhone}`, href: `tel:${currentPhone.replace(/[^0-9+]/g, "")}` }
        : null);
  const requestButton = heroData.requestButton || {
    text: "Request Free Estimate",
    href: "#contact",
  };

  const rawTrustMetrics = Array.isArray(heroData.trustMetrics) ? heroData.trustMetrics : [];
  const trustMetrics = rawTrustMetrics.map((m: any) => {
    if (isFlagship) return m;
    let val = m.value;
    if (typeof val === 'string' && (val.includes('Great Falls') || val.includes('MT'))) {
      val = tenant?.location || 'Local Area';
    }
    return { ...m, value: val };
  });

  const rawEstimateCard = heroData.estimateCard || {};
  const estimateCard = (() => {
    if (isFlagship) {
      return {
        title: rawEstimateCard.title || "Priority Estimate",
        subtitle: rawEstimateCard.subtitle || "Direct response from the owner",
        badge: rawEstimateCard.badge || "Fast Response",
        divisionLabel: rawEstimateCard.divisionLabel || "Select Service",
        divisions: Array.isArray(rawEstimateCard.divisions) && rawEstimateCard.divisions.length > 0
          ? rawEstimateCard.divisions
          : [
              { key: "residential", label: "Residential Roofing", icon: "Home" },
              { key: "commercial", label: "Commercial Roofing", icon: "Building2" },
            ],
        fields: rawEstimateCard.fields || {
          name: { label: "Full Name", placeholder: "e.g. John Smith" },
          phone: { label: "Direct Phone", placeholder: "(555) 000-0000" },
          address: { label: "Property Address", placeholder: "Street address" },
          urgency: {
            label: "Project Urgency",
            options: [
              { value: "standard", label: "Standard Consultation (1-2 Days)" },
              { value: "urgent", label: "Urgent Leak / Storm Repair" },
            ],
          },
        },
        submitButton: rawEstimateCard.submitButton || "Send Estimate Request",
        success: rawEstimateCard.success || {
          title: "Request Received",
          message: "We will review your project and get back to you shortly.",
        },
        trustNote: rawEstimateCard.trustNote || "Free Estimates • Written Scopes",
      };
    }

    let sub = rawEstimateCard.subtitle || "Direct response from our team";
    sub = sub
      .replace(/from Max himself/gi, tenant?.name ? `from ${tenant.name}` : "from our team")
      .replace(/from Max/gi, tenant?.name ? `from ${tenant.name}` : "from our team");

    const fields = { ...(rawEstimateCard.fields || {}) };
    if (fields.phone) {
      fields.phone = {
        ...fields.phone,
        placeholder: tenant?.phone ? `e.g. ${tenant.phone}` : "e.g. (555) 000-0000",
      };
    }
    if (fields.address) {
      fields.address = {
        ...fields.address,
        placeholder: tenant?.location ? `e.g. 100 Main St, ${tenant.location}` : "e.g. 100 Main St, City, ST",
      };
    }

    const succ = { ...(rawEstimateCard.success || {}) };
    let succMessage = succ.message || "Our team will review your project and get back to you shortly.";
    succMessage = succMessage
      .replace(/Max will review/gi, tenant?.name ? `${tenant.name} will review` : "Our team will review")
      .replace(/Max/g, "Our team");

    return {
      title: rawEstimateCard.title || "Priority Estimate",
      subtitle: sub,
      badge: rawEstimateCard.badge || "Fast Response",
      divisionLabel: rawEstimateCard.divisionLabel || "Select Service",
      divisions: Array.isArray(rawEstimateCard.divisions) && rawEstimateCard.divisions.length > 0
        ? rawEstimateCard.divisions
        : [
            { key: "residential", label: "Residential Roofing", icon: "Home" },
            { key: "commercial", label: "Commercial Roofing", icon: "Building2" },
          ],
      fields,
      submitButton: rawEstimateCard.submitButton || "Send Estimate Request",
      success: {
        title: succ.title || "Request Received",
        message: succMessage,
      },
      trustNote: rawEstimateCard.trustNote || "Free Estimates • Written Scopes • Direct Guidance",
    };
  })();

  const tenantMedia = useTenantMedia();
  const heroImageSrc = tenantMedia.heroBg || roofingBg;

  const [activeDivision, setActiveDivision] = useState<string>(
    estimateCard?.divisions?.[0]?.key || "residential"
  );
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    urgency: "standard",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", phone: "", address: "", urgency: "standard" });
    }, 4000);
  };

  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden isolate pt-24 pb-16 lg:pt-32 lg:pb-24"
      style={{ background: "var(--navy-color)" }}
    >
      {/* ── Background Imagery & Luxury Lighting ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <img
          src={heroImageSrc}
          alt={headlines[0]}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
          style={{ opacity: 0.60 }}
          loading="eager"
          // @ts-ignore
          fetchpriority="high"
          decoding="async"
        />

        {/* Architectural lighting overlay balancing left-side readability with right-side imagery vibrancy */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(var(--navy-rgb), 0.92) 0%, rgba(var(--navy-rgb), 0.84) 38%, rgba(var(--navy-rgb), 0.50) 68%, rgba(var(--navy-rgb), 0.18) 100%)",
          }}
        />

        {/* Technical Grid Accent */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(var(--white-rgb), 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--white-rgb), 0.2) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Ambient Brand Glow */}
        <div
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.22) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(var(--primary-hover-rgb), 0.25) 0%, transparent 70%)" }}
        />

        {/* Bottom seamless transition fade into page background */}
        <div
          className="absolute bottom-0 left-0 w-full h-32 pointer-events-none"
          style={{ background: "linear-gradient(to top, var(--dark-bg), transparent)" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ════ LEFT COLUMN: Brand Authority & Messaging ════ */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-7">

            {/* Pill Badge */}
            {badge && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border backdrop-blur-md shadow-lg"
                style={{
                  borderColor: "rgba(var(--primary-rgb), 0.35)",
                  background: "rgba(var(--primary-rgb), 0.12)",
                }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--primary-hex)" }} />
                <span
                  className="text-xs sm:text-sm font-bold tracking-wider uppercase"
                  style={{ color: "var(--white-color)" }}
                >
                  {badge}
                </span>
              </motion.div>
            )}

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black uppercase tracking-tight leading-[1.02]"
              style={{ fontFamily: "var(--font-heading)", color: "var(--white-color)" }}
            >
              <span className="block">{headlines[0]}</span>
              {headlines.slice(1).map((hl, idx) => (
                <span
                  key={idx}
                  className="block mt-1 text-transparent bg-clip-text"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #FFFFFF 0%, var(--accent-hex) 60%, #FFFFFF 100%)",
                  }}
                >
                  {hl}
                </span>
              ))}
            </motion.h1>

            {/* Sub-headline / Brand Promise */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl"
              style={{ color: "var(--light-silver-color)" }}
            >
              {description}
            </motion.p>

            {/* Main Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2"
            >
              {/* 24/7 Emergency Dispatch Button */}
              {emergencyButton && (
                <motion.a
                  href={emergencyButton.href}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative group px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-2xl transition-all duration-300 whitespace-nowrap"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--cta-hex) 0%, var(--secondary-hex) 100%)",
                    color: "var(--white-color)",
                    border: "1px solid rgba(174, 184, 194, 0.4)",
                    boxShadow: "0 10px 30px rgba(18, 54, 90, 0.6)",
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full animate-ping shrink-0" style={{ background: "var(--white-color)" }} />
                  <Phone className="w-5 h-5 shrink-0" style={{ color: "var(--white-color)" }} />
                  <span className="whitespace-nowrap">{emergencyButton.text}</span>
                </motion.a>
              )}

              {/* Start Your Request */}
              {requestButton && (
                <motion.a
                  href={requestButton.href}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 border transition-all duration-300 whitespace-nowrap"
                  style={{
                    background: "rgba(var(--white-rgb), 0.12)",
                    borderColor: "rgba(var(--white-rgb), 0.35)",
                    color: "var(--white-color)",
                  }}
                >
                  <span className="whitespace-nowrap">{requestButton.text}</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform shrink-0" />
                </motion.a>
              )}
            </motion.div>

            {/* Trust Metrics Bar */}
            {trustMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 w-full border-t"
                style={{ borderColor: "rgba(var(--white-rgb), 0.12)" }}
              >
                {trustMetrics.map((item, i) => {
                  const IconComponent = heroIconMap[item.icon] || Star;
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border backdrop-blur-sm flex flex-col items-center lg:items-start text-center lg:text-left transition-all duration-300 hover:border-accent/50"
                      style={{
                        background: "rgba(var(--navy-rgb), 0.55)",
                        borderColor: "rgba(var(--white-rgb), 0.12)",
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <IconComponent
                          className="w-4 h-4 shrink-0"
                          style={{ color: "var(--accent-hex)" }}
                        />
                        <span
                          className="text-base sm:text-xl font-black tracking-tight leading-none whitespace-nowrap"
                          style={{ color: "var(--white-color)" }}
                        >
                          {item.value}
                        </span>
                      </div>
                      <span
                        className="text-[11px] font-medium leading-tight"
                        style={{ color: "var(--accent-hex)" }}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* ════ RIGHT COLUMN: Streamlined Priority Dispatch Card ════ */}
          {estimateCard && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 w-full max-w-lg mx-auto"
            >
              <div
                className="rounded-3xl border shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden"
                style={{
                  background: "rgba(var(--white-rgb), 0.98)",
                  borderColor: "var(--border-color)",
                  boxShadow:
                    "0 25px 60px rgba(var(--black-rgb), 0.28), 0 0 40px rgba(var(--primary-rgb), 0.15)",
                }}
              >
                {/* Card Header */}
                <div
                  className="flex items-center justify-between pb-5 border-b"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div>
                    <h3
                      className="text-xl sm:text-2xl font-black tracking-tight"
                      style={{ fontFamily: "var(--font-heading)", color: "var(--heading-color)" }}
                    >
                      {estimateCard.title}
                    </h3>
                    <p
                      className="text-xs font-semibold mt-0.5"
                      style={{ color: "var(--silver-color)" }}
                    >
                      {estimateCard.subtitle}
                    </p>
                  </div>
                  {estimateCard.badge && (
                    <div
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                      style={{
                        background: "rgba(var(--primary-rgb), 0.1)",
                        color: "var(--primary-hex)",
                      }}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{estimateCard.badge}</span>
                    </div>
                  )}
                </div>

                {/* Division Selector */}
                {estimateCard.divisions && (
                  <div className="mt-5">
                    <label
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: "var(--heading-color)" }}
                    >
                      {estimateCard.divisionLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {estimateCard.divisions.map((div) => {
                        const DivIcon = heroIconMap[div.icon] || Home;
                        const isActive = activeDivision === div.key;
                        return (
                          <button
                            type="button"
                            key={div.key}
                            onClick={() => setActiveDivision(div.key)}
                            className="flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer"
                            style={{
                              background: isActive
                                ? "linear-gradient(135deg, var(--cta-hex), var(--secondary-hex))"
                                : "var(--card-bg)",
                              color: isActive ? "var(--white-color)" : "var(--charcoal-hex)",
                              borderColor: isActive ? "var(--cta-hex)" : "var(--border-color)",
                              boxShadow: isActive
                                ? "0 4px 14px rgba(18, 54, 90, 0.35)"
                                : "none",
                            }}
                          >
                            <DivIcon className="w-4 h-4 mb-1" />
                            <span>{div.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Form Body */}
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {(() => {
                      const fields = estimateCard.fields || {};
                      const nameField = fields.name || { label: "Full Name", placeholder: "Your Name" };
                      const phoneField = fields.phone || { label: "Direct Phone", placeholder: "(555) 000-0000" };
                      const addressField = fields.address || { label: "Property Address", placeholder: "Street address" };
                      const urgencyField = fields.urgency || {
                        label: "Project Urgency",
                        options: [
                          { value: "standard", label: "Standard Consultation (1-2 Days)" },
                          { value: "urgent", label: "Urgent Leak / Storm Repair" },
                        ],
                      };
                      const urgencyOptions = Array.isArray(urgencyField.options) ? urgencyField.options : [];

                      return (
                        <>
                          <div>
                            <label
                              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                              style={{ color: "var(--heading-color)" }}
                            >
                              {nameField.label}
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={nameField.placeholder}
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                              style={{
                                background: "var(--dark-bg)",
                                border: "1px solid var(--border-color)",
                                color: "var(--heading-color)",
                              }}
                              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary-hex)")}
                              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                            />
                          </div>

                          <div>
                            <label
                              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                              style={{ color: "var(--heading-color)" }}
                            >
                              {phoneField.label}
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder={phoneField.placeholder}
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                              style={{
                                background: "var(--dark-bg)",
                                border: "1px solid var(--border-color)",
                                color: "var(--heading-color)",
                              }}
                              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary-hex)")}
                              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                            />
                          </div>

                          <div>
                            <label
                              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                              style={{ color: "var(--heading-color)" }}
                            >
                              {addressField.label}
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={addressField.placeholder}
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-all"
                              style={{
                                background: "var(--dark-bg)",
                                border: "1px solid var(--border-color)",
                                color: "var(--heading-color)",
                              }}
                              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary-hex)")}
                              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                            />
                          </div>

                          <div>
                            <label
                              className="block text-xs font-bold uppercase tracking-wider mb-1.5"
                              style={{ color: "var(--heading-color)" }}
                            >
                              {urgencyField.label}
                            </label>
                            <select
                              value={formData.urgency}
                              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                              className="w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none transition-all cursor-pointer"
                              style={{
                                background: "var(--dark-bg)",
                                border: "1px solid var(--border-color)",
                                color: "var(--heading-color)",
                              }}
                              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--primary-hex)")}
                              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                            >
                              {urgencyOptions.map((opt: any) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      );
                    })()}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] whitespace-nowrap"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--cta-hex) 0%, var(--secondary-hex) 100%)",
                        color: "var(--white-color)",
                        boxShadow: "0 8px 24px rgba(18, 54, 90, 0.45)",
                      }}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{estimateCard.submitButton.submitting}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{estimateCard.submitButton.idle}</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="py-12 text-center space-y-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                      style={{
                        background: "rgba(var(--primary-rgb), 0.12)",
                        color: "var(--primary-hex)",
                      }}
                    >
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4
                      className="text-xl font-black uppercase tracking-tight"
                      style={{ color: "var(--heading-color)" }}
                    >
                      {estimateCard.success.title}
                    </h4>
                    <p className="text-sm max-w-xs mx-auto" style={{ color: "var(--silver-color)" }}>
                      {estimateCard.success.message}
                    </p>
                  </div>
                )}

                {/* Trust Footer Note */}
                <div
                  className="mt-5 pt-4 border-t text-center text-[11px] font-semibold"
                  style={{ borderColor: "var(--border-color)", color: "var(--silver-color)" }}
                >
                  <span>{estimateCard.trustNote}</span>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </section>
  );
};

export default Hero;
