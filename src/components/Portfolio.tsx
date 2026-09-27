import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Building2,
  Calendar,
  X,
  Phone,
  ShieldCheck,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { useTenantData, useTenant } from "../context/TenantContext";

import imgPortfolio1 from "@/assets/portfolio-1-c.webp";
import imgPortfolio2 from "@/assets/portfolio-2.webp";
import imgPortfolio3 from "@/assets/portfolio-3-c.webp";
import imgPortfolio4 from "@/assets/portfolio-4-c.webp";
import imgPortfolio5 from "@/assets/portfolio-5.webp";
import imgPortfolio6 from "@/assets/metalroofing.webp";

const projectImages: Record<string, string> = {
  portfolio1: imgPortfolio1,
  portfolio2: imgPortfolio2,
  portfolio3: imgPortfolio3,
  portfolio4: imgPortfolio4,
  portfolio5: imgPortfolio5,
  portfolio6: imgPortfolio6,
};

export const resolveProjectImage = (img: string) => {
  if (img && (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/') || img.startsWith('.'))) {
    return img;
  }
  return projectImages[img as keyof typeof projectImages] || projectImages.portfolio1;
};

type ProjectItem = {
  number: string;
  title: string;
  category: string;
  image: string;
  location: string;
  year: string;
  accent?: string;
  scope: string;
  desc: string;
};

const Portfolio = () => {
  const completeData = useTenantData();
  const { tenant } = useTenant();
  const isFlagship = !tenant || tenant.slug === "max-quality-roofing";
  const portfolioData = (completeData?.portfolio || {}) as any;
  const rawSection = portfolioData.section || {};
  const rawDesc = rawSection.description || "Explore our recent residential and commercial roofing installations.";
  const cleanSectionDesc = (!isFlagship && rawDesc)
    ? rawDesc
        .replace(/by Max Poitra/gi, tenant?.name ? `by ${tenant.name}` : "by our experienced team")
        .replace(/Max Quality Roofing/gi, tenant?.name || "our company")
        .replace(/Great Falls, Montana and surrounding communities/gi, tenant?.location ? `${tenant.location} and surrounding communities` : "our service area and surrounding communities")
        .replace(/Great Falls, Montana/gi, tenant?.location || "the local area")
        .replace(/Great Falls/gi, tenant?.city || tenant?.location || "the local area")
        .replace(/Montana/gi, tenant?.state || "local")
    : rawDesc;

  const section = {
    badge: rawSection.badge || "PROJECT PORTFOLIO",
    headline: rawSection.headline || "Proven Results Across The Region",
    description: cleanSectionDesc,
    viewScopeLabel: rawSection.viewScopeLabel || "View Scope",
    allFilterLabel: rawSection.allFilterLabel || "All Projects",
  };

  const rawProjects: ProjectItem[] = Array.isArray(portfolioData.projects) ? portfolioData.projects : [];
  const projects: ProjectItem[] = useMemo(() => {
    return rawProjects.map((p) => {
      if (isFlagship) return p;
      const cleanLoc = (tenant?.location)
        ? (p.location?.includes("Great Falls") ? tenant.location : p.location)
        : (p.location?.includes("Great Falls") ? "Local Service Area" : p.location);
      const cleanTitle = (tenant?.location)
        ? p.title.replace(/Great Falls/gi, tenant.city || tenant.location)
        : p.title.replace(/Great Falls/gi, "Local");
      let cleanDesc = p.desc || "";
      cleanDesc = cleanDesc
        .replace(/Montana weather/gi, `${tenant?.state || "local"} weather`)
        .replace(/Montana/gi, tenant?.state || "local");
      return { ...p, location: cleanLoc, title: cleanTitle, desc: cleanDesc };
    });
  }, [rawProjects, isFlagship, tenant]);

  const rawModal = portfolioData.modal || {};
  const rawGuaranteeTitle = rawModal.guaranteeTitle || "Our Workmanship Guarantee";
  const modal = {
    scopeTitle: rawModal.scopeTitle || "Project Scope & Execution",
    guaranteeTitle: (!isFlagship && rawGuaranteeTitle.includes("Max"))
      ? `${tenant?.name || "Our"} Workmanship Guarantee`
      : rawGuaranteeTitle,
    guaranteeItems: Array.isArray(rawModal.guaranteeItems) ? rawModal.guaranteeItems : ["100% Quality Inspected", "Clean Site Commitment", "Manufacturer Backed"],
    closeButton: rawModal.closeButton || "Close",
    ctaButton: rawModal.ctaButton || "Request Free Inspection",
  };

  const rawConsultation = portfolioData.consultation || {};
  const rawPhone = (!isFlagship && tenant?.phone)
    ? tenant.phone
    : (rawConsultation.phone ||
       completeData?.footer?.contact?.phone ||
       completeData?.contact?.phone ||
       tenant?.phone);
  const isFlagshipPhone = rawPhone?.includes("406") && rawPhone?.includes("217-1720");
  const portfolioPhone = (!isFlagship && isFlagshipPhone) ? "" : (rawPhone || (isFlagship ? "(406) 217-1720" : ""));
  const portfolioPhoneLink =
    portfolioPhone
      ? `tel:${portfolioPhone.replace(/[^0-9+]/g, '')}`
      : (isFlagship ? "tel:+14062171720" : "");

  const consultationTitle = (!isFlagship)
    ? (rawConsultation.title
        ?.replace(/in Great Falls\??/gi, tenant?.location ? `in ${tenant.location}?` : "in your area?")
        ?.replace(/Great Falls/gi, tenant?.city || tenant?.location || "your area") ||
       `Ready to Start Your Project${tenant?.location ? ` in ${tenant.location}` : ""} ?`)
    : (rawConsultation.title || "Request a Free Roof Estimate");

  const consultationDescription = (!isFlagship)
    ? (rawConsultation.description
        ?.replace(/Max personally inspects/gi, tenant?.name ? `${tenant.name} personally inspects` : "Our experienced team personally inspects")
        ?.replace(/Max/gi, "Our team") ||
       "Get a free, honest assessment with photo documentation and a clear, fixed-price estimate.")
    : (rawConsultation.description || "Direct response from our team.");

  const consultation = {
    badge: rawConsultation.badge || "Ready to Start?",
    title: consultationTitle,
    description: consultationDescription,
    buttonText: rawConsultation.buttonText || "Request Free Estimate",
    buttonLink: rawConsultation.buttonLink || "#contact",
    phone: portfolioPhone,
    phoneLink: portfolioPhoneLink,
  };

  const allFilterLabel = section.allFilterLabel || "All Projects";
  const [activeTab, setActiveTab] = useState(allFilterLabel);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
    return [allFilterLabel, ...cats];
  }, [projects, allFilterLabel]);

  const filteredProjects = useMemo(() => {
    if (activeTab === allFilterLabel) return projects;
    return projects.filter(
      (p) => p.category && p.category.toLowerCase() === activeTab.toLowerCase()
    );
  }, [activeTab, projects, allFilterLabel]);

  return (
    <section
      id="portfolio"
      className="relative py-20 md:py-32 overflow-hidden border-t border-border"
      style={{ background: "var(--dark-bg)" }}
    >
      {/* ── Ambient Background Lighting ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.06) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(var(--primary-hover-rgb), 0.05) 0%, transparent 70%)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Section Header ── */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14 md:mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border shadow-sm"
            style={{
              background: "rgba(var(--primary-rgb), 0.08)",
              borderColor: "rgba(var(--primary-rgb), 0.25)",
            }}
          >
            <Building2 className="w-3.5 h-3.5" style={{ color: "var(--primary-hex)" }} />
            <span
              className="text-xs font-black uppercase tracking-[0.2em]"
              style={{ color: "var(--primary-hex)" }}
            >
              {section.badge}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05]"
            style={{ fontFamily: "var(--font-heading)", color: "var(--heading-color)" }}
            dangerouslySetInnerHTML={{ __html: section.headline }}
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl"
            style={{ color: "var(--silver-color)" }}
          >
            {section.description}
          </motion.p>

          {/* ── Category Pill Filters ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2.5 pt-4"
          >
            {categories.map((cat) => {
              const isSelected = activeTab === cat;
              const count =
                cat === section.allFilterLabel
                  ? projects.length
                  : projects.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border flex items-center gap-2 cursor-pointer shadow-sm"
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, var(--primary-hex), var(--primary-hover-hex))"
                      : "var(--card-bg)",
                    color: isSelected ? "var(--white-color)" : "var(--heading-color)",
                    borderColor: isSelected ? "var(--primary-hex)" : "var(--border-color)",
                    boxShadow: isSelected
                      ? "0 6px 20px rgba(var(--primary-rgb), 0.28)"
                      : "none",
                  }}
                >
                  <span>{cat}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-black"
                    style={{
                      background: isSelected
                        ? "rgba(var(--white-rgb), 0.25)"
                        : "rgba(var(--primary-rgb), 0.1)",
                      color: isSelected ? "var(--white-color)" : "var(--primary-hex)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* ── Balanced 3x2 Grid ── */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => {
              const resolvedImage = resolveProjectImage(project.image);

              return (
                <motion.div
                  key={project.number}
                  layout
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                  onClick={() => setSelectedProject(project)}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                  style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--border-color)",
                    boxShadow: "0 10px 30px rgba(var(--black-rgb), 0.04)",
                  }}
                >
                  {/* Image Container */}
                  <div className="relative w-full h-56 sm:h-64 overflow-hidden" style={{ background: "var(--dark-bg)" }}>
                    <img
                      src={resolvedImage}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />

                    {/* Gradient Overlay for Text Pop */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(var(--black-rgb), 0.7) 0%, transparent 60%)",
                      }}
                    />

                    {/* Floating Category Pill */}
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md"
                        style={{
                          background: "rgba(var(--navy-rgb), 0.85)",
                          color: "var(--white-color)",
                          borderColor: "rgba(var(--white-rgb), 0.2)",
                        }}
                      >
                        {project.category}
                      </span>
                    </div>

                    {/* Expand Icon */}
                    <div
                      className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-lg z-10"
                      style={{
                        background: "var(--primary-hex)",
                        color: "var(--white-color)",
                      }}
                    >
                      <Maximize2 className="w-4 h-4" />
                    </div>

                    {/* Location Badge over Image Bottom */}
                    <div className="absolute bottom-3.5 left-4 right-4 z-10 flex items-center justify-between text-xs text-white font-semibold">
                      <span className="inline-flex items-center gap-1.5 drop-shadow-sm">
                        <MapPin className="w-3.5 h-3.5" style={{ color: "var(--primary-hex)" }} />
                        {project.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] opacity-90 drop-shadow-sm">
                        <Calendar className="w-3 h-3" />
                        {project.year}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Scope Tag */}
                    <div className="flex items-center gap-2 mb-2.5">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0"
                        style={{ color: "var(--primary-hex)" }}
                      />
                      <span
                        className="text-xs font-bold uppercase tracking-wider truncate"
                        style={{ color: "var(--primary-hex)" }}
                      >
                        {project.scope}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-xl font-black uppercase tracking-tight leading-snug mb-2.5 transition-colors duration-200 group-hover:text-primary"
                      style={{
                        fontFamily: "var(--font-heading)",
                        color: "var(--heading-color)",
                      }}
                    >
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-sm leading-relaxed line-clamp-3 mb-6 flex-1"
                      style={{ color: "var(--silver-color)" }}
                    >
                      {project.desc}
                    </p>

                    {/* Card Footer: Action */}
                    <div
                      className="pt-4 border-t flex items-center justify-between mt-auto"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <span
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: "var(--heading-color)" }}
                      >
                        {section.viewScopeLabel}
                      </span>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                        style={{
                          background: "rgba(var(--primary-rgb), 0.1)",
                          color: "var(--primary-hex)",
                        }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* ── Bottom Consultation Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-20 rounded-3xl p-8 sm:p-12 text-center md:text-left relative overflow-hidden shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, var(--navy-color) 0%, var(--primary-hover-hex) 100%)",
            color: "var(--white-color)",
          }}
        >
          {/* Tech Grid Background Accent */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(var(--white-rgb), 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--white-rgb), 0.2) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  background: "rgba(var(--white-rgb), 0.12)",
                  color: "var(--white-color)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{consultation.badge}</span>
              </div>
              <h3
                className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight"
                style={{ fontFamily: "var(--font-heading)", color: "var(--white-color)" }}
              >
                {consultation.title}
              </h3>
              <p
                className="text-sm sm:text-base leading-relaxed"
                style={{ color: "var(--light-silver-color)" }}
              >
                {consultation.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0 w-full md:w-auto">
              <a
                href={consultation.buttonLink}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
                style={{
                  background: "var(--white-color)",
                  color: "var(--heading-color)",
                }}
              >
                <span className="whitespace-nowrap">{consultation.buttonText}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>

              {consultation.phone && (
                <a
                  href={consultation.phoneLink}
                  className="w-full sm:w-auto px-7 py-4 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border transition-all duration-300 hover:bg-white/10 whitespace-nowrap"
                  style={{
                    borderColor: "rgba(var(--white-rgb), 0.25)",
                    color: "var(--white-color)",
                  }}
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{consultation.phone}</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── Interactive Project Details Lightbox Modal ── */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl z-10 my-8"
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border-color)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Image */}
              <div className="relative w-full h-64 sm:h-80" style={{ background: "var(--navy-color)" }}>
                <img
                  src={resolveProjectImage(selectedProject.image)}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(var(--black-rgb), 0.85) 0%, transparent 60%)",
                  }}
                />
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-2 text-white">
                  <div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider"
                      style={{ background: "var(--primary-hex)" }}
                    >
                      {selectedProject.category}
                    </span>
                    <h3
                      className="text-2xl sm:text-3xl font-black mt-2 leading-tight uppercase"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {selectedProject.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--light-silver-color)" }}>
                    <MapPin className="w-4 h-4" style={{ color: "var(--primary-hex)" }} />
                    <span>{selectedProject.location}</span>
                    <span>•</span>
                    <span>{selectedProject.year}</span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h4
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: "var(--primary-hex)" }}
                  >
                    {modal.scopeTitle}
                  </h4>
                  <p
                    className="text-base sm:text-lg font-bold"
                    style={{ color: "var(--heading-color)" }}
                  >
                    {selectedProject.scope}
                  </p>
                  <p
                    className="text-sm sm:text-base leading-relaxed mt-2"
                    style={{ color: "var(--silver-color)" }}
                  >
                    {selectedProject.desc}
                  </p>
                </div>

                {/* Key Execution Standards */}
                <div
                  className="p-4 rounded-2xl border space-y-2.5"
                  style={{
                    background: "var(--dark-bg)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--heading-color)" }}>
                    {modal.guaranteeTitle}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold" style={{ color: "var(--silver-color)" }}>
                    {modal.guaranteeItems.map((item, gIdx) => (
                      <div key={gIdx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--primary-hex)" }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border cursor-pointer transition-colors"
                    style={{
                      borderColor: "var(--border-color)",
                      color: "var(--silver-color)",
                    }}
                  >
                    {modal.closeButton}
                  </button>

                  <a
                    href="#contact"
                    onClick={() => setSelectedProject(null)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary-hex), var(--primary-hover-hex))",
                      color: "var(--white-color)",
                      boxShadow: "0 6px 20px rgba(var(--primary-rgb), 0.3)",
                    }}
                  >
                    <span>{modal.ctaButton}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Portfolio;
