import { useRef, useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTenantData, useTenant } from "../context/TenantContext";

gsap.registerPlugin(ScrollTrigger);

const Icons = {
  Quote: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path d="M10 11H6V7H10V11Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 11H14V7H18V11Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Verified: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Play: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" />
      <path d="M16 12L10 16V8L16 12Z" fill="white" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path d="M19 12H5M5 12L11 18M5 12L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path d="M5 12H19M19 12L13 18M19 12L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Google: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path
        d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10c2.4 0 4.6-.85 6.3-2.28l-2.5-2.5c-.97.58-2.1.9-3.3.9-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6h-3l4 4 4-4h-3z"
        stroke="currentColor" strokeWidth="1.5"
      />
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L15 9H22L16 14L19 21L12 16.5L5 21L8 14L2 9H9L12 2Z"
        stroke="currentColor" strokeWidth="1.5" fill="currentColor"
      />
    </svg>
  ),
};

// ── Video Modal ───────────────────────────────────────────────────────────────
const VideoModal = ({
  isOpen, onClose, videoId, title,
}: {
  isOpen: boolean; onClose: () => void; videoId: string; title: string;
}) => {
  const completeData = useTenantData();
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
        >
          <Icons.Close />
        </motion.button>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0`}
            title={title || (completeData.testimonials?.stats as any)?.videoSection?.videoPlayerTitle || "Customer Video Testimonial"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Video Thumbnail Card ──────────────────────────────────────────────────────
const VideoThumbnailCard = ({ video, onClick }: { video: any; onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgSrc, setImgSrc] = useState(`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "0px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="relative group cursor-pointer"
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted shadow-md">
        <img
          src={imgSrc}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImgSrc(`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center transform transition-transform group-hover:scale-110">
              <Icons.Play />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 md:mt-3">
        <h4 className="font-semibold text-foreground text-sm md:text-base line-clamp-1">{video.title}</h4>
        {video.name && (
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">{video.name}</p>
        )}
      </div>
    </motion.div>
  );
};

const TestimonialCard = ({
  testimonial, isActive = false, onPlayVideo,
}: {
  testimonial: any; isActive?: boolean; onPlayVideo: (videoId: string, title: string) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const t = testimonial || {
    text: "Outstanding quality and service from start to finish.",
    name: "Valued Customer",
    position: "Homeowner",
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full mx-auto transition-transform duration-300 hover:-translate-y-1 transform-gpu"
    >
      <div
        className={`
          relative rounded-none p-8 md:p-12
          border-2 transition-all duration-300
          min-h-[380px] md:min-h-[420px]
          flex flex-col overflow-hidden
          ${isActive
            ? "border-primary shadow-[0_30px_60px_-15px_rgba(var(--primary-rgb),0.3)] z-20 scale-105"
            : "border-border shadow-lg opacity-60 grayscale-[50%] hover:grayscale-0 hover:opacity-100"
          }
        `}
        style={{ background: "var(--card-bg)" }}
      >
        {/* Subtle Industrial Texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] mix-blend-overlay" />
        {/* Dynamic Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-primary"><Icons.Quote /></div>
          <div className="flex gap-1 text-primary">
            {[...Array(5)].map((_, i) => <Icons.Star key={i} />)}
          </div>
        </div>

        {/* Quote Text */}
        <div className="flex-1 mb-8">
          <p className="text-foreground/90 text-lg md:text-xl lg:text-2xl leading-relaxed font-black uppercase italic tracking-tighter">
            "{t.text}"
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-6 pt-8 border-t border-border mt-auto">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-primary flex items-center justify-center text-white font-black text-lg md:text-xl shadow-lg flex-shrink-0">
              {t.avatar || t.name?.[0] || "★"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-foreground text-sm md:text-lg uppercase tracking-widest truncate">
                  {t.name}
                </h4>
                <Icons.Verified />
              </div>
              <p className="text-xs md:text-sm text-primary font-bold uppercase tracking-[0.2em] mt-1">
                {t.position}
              </p>
            </div>
          </div>
          {t.videoId && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPlayVideo(t.videoId, t.name)}
              className="group w-12 h-12 md:w-14 md:h-14 bg-cta text-white rounded-xl flex items-center justify-center shadow-xl border border-white/20 flex-shrink-0 hover:bg-secondary hover:text-white transition-colors duration-300"
            >
              <Icons.Play />
            </motion.button>
          )}
        </div>

        {/* Industrial Corner Decoration */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/20" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/20" />
      </div>
    </div>
  );
};

// ── Scrollbar styles ──────────────────────────────────────────────────────────
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: hsl(var(--muted)); border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--primary)); border-radius: 4px; }
`;

// ── Main Section ──────────────────────────────────────────────────────────────
const Testimonials = () => {
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedVideoTitle, setSelectedVideoTitle] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const completeData = useTenantData();
  const { tenant } = useTenant();
  const isFlagship = !tenant || tenant.slug === "max-quality-roofing";

  const testimonialsData = completeData?.testimonials || {};
  const rawSection = testimonialsData.section || {
    badge: "TESTIMONIALS",
    headline: "What Homeowners Say",
    description: "Read real experiences from homeowners across the service area.",
    featured: "5-Star Rated on Google",
  };

  const section = {
    badge: rawSection.badge || "TESTIMONIALS",
    headline: (!isFlagship)
      ? (tenant?.location ? `Trusted By Homeowners in ${tenant.location}` : "Trusted By Local Homeowners")
      : (rawSection.headline || "What Homeowners Say"),
    description: (!isFlagship && rawSection.description)
      ? rawSection.description
          .replace(/Great Falls and surrounding Montana communities/gi, `${tenant?.location || "the local area"} and surrounding communities`)
          .replace(/Great Falls/gi, tenant?.city || tenant?.location || "the local area")
          .replace(/Montana/gi, tenant?.state || "local")
          .replace(/Max Quality Roofing/gi, tenant?.name || "our company")
      : rawSection.description,
    featured: (!isFlagship && rawSection.featured)
      ? rawSection.featured
          .replace(/Great Falls, Montana/gi, tenant?.location || "Our Service Area")
          .replace(/Great Falls/gi, tenant?.city || tenant?.location || "Our Service Area")
          .replace(/Montana/gi, tenant?.state || "Local")
      : (rawSection.featured || "5-Star Rated on Google"),
  };

  const rawTestimonials = Array.isArray(testimonialsData.testimonials) ? testimonialsData.testimonials : [];
  const defaultTestimonials = [
    {
      id: 1,
      name: "Robert H.",
      position: "Homeowner",
      company: (!isFlagship && tenant?.location) ? tenant.location : "Local Resident",
      avatar: "RH",
      text: "Replaced our entire roof with architectural shingles and the quality is outstanding. Showed up on schedule, gave us a fair price, and left the yard spotless. Couldn't ask for better.",
    },
    {
      id: 2,
      name: "Linda M.",
      position: "Homeowner",
      company: (!isFlagship && tenant?.location) ? tenant.location : "Local Resident",
      avatar: "LM",
      text: "We had a leak that two other roofers couldn't find. They found it, fixed it properly, and explained exactly what was wrong. Honest, professional, quality work.",
    },
    {
      id: 3,
      name: "David K.",
      position: "Property Owner",
      company: (!isFlagship && tenant?.location) ? tenant.location : "Local Resident",
      avatar: "DK",
      text: "A true roofing specialist. You can tell they take pride in the details — clean lines, proper flashing, and top-tier materials. Highly recommend.",
    },
  ];

  const testimonials = (rawTestimonials.length > 0 ? rawTestimonials : defaultTestimonials)
    .filter((t: any) => isFlagship || (t.name !== "Max Poitra" && t.company !== "Max Quality Roofing"))
    .map((t: any) => {
      if (isFlagship) return t;
      const cleanCompany = (!isFlagship && (t.company?.includes("Great Falls") || t.company?.includes("MT")))
        ? (tenant?.location || "Local Resident")
        : t.company;
      let cleanText = t.text || "";
      cleanText = cleanText.replace(/Max replaced our entire roof/gi, "They replaced our entire roof");
      cleanText = cleanText.replace(/Max found it/gi, "They found it");
      cleanText = cleanText.replace(/Max is a true/gi, "A true");
      cleanText = cleanText.replace(/Called Max/gi, "Called for an estimate");
      cleanText = cleanText.replace(/Max /g, "The team ");
      cleanText = cleanText.replace(/Great Falls/gi, tenant?.city || tenant?.location || "the local area");
      cleanText = cleanText.replace(/Montana/gi, tenant?.state || "local");
      return {
        ...t,
        company: cleanCompany,
        text: cleanText,
      };
    });
  const videos = Array.isArray(testimonialsData.videos) ? testimonialsData.videos : [];
  const rawStats = (testimonialsData.stats || {}) as any;
  const videoSection = rawStats.videoSection || {
    badge: "VIDEO REVIEWS",
    reviewCountText: "Verified Customer Stories",
    googleReviewsLink: "#",
    googleReviewsButtonText: "View Google Reviews",
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = scrollbarStyles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const handlePlayVideo = (videoId: string, title: string) => {
    setSelectedVideo(videoId);
    setSelectedVideoTitle(title);
    setShowVideoModal(true);
  };

  useEffect(() => { setIsClient(true); }, []);

  useEffect(() => {
    if (!sectionRef.current || !isClient) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".reveal-element",
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", once: true },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [isClient]);

  if (!isClient) return null;

  return (
    <>
      <section
        ref={sectionRef}
        className="relative bg-background py-12 md:py-16 lg:py-20 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12 lg:mb-16 reveal-element">
            <span className="text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-primary mb-2 md:mb-3 block">
              {section.badge}
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
              dangerouslySetInnerHTML={{ __html: section.headline || "What Homeowners Say" }}
            />
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground px-4">
              {section.description}
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 md:mt-4">
              <Icons.Google />
              <span className="text-xs md:text-sm text-muted-foreground">{section.featured}</span>
            </div>
            <div className="w-12 md:w-16 h-0.5 bg-gradient-to-r from-primary to-primary/60 mx-auto mt-4 md:mt-6 rounded-full" />
          </div>

          {/* Featured Testimonial Slider */}
          <div className="max-w-4xl mx-auto mb-12 md:mb-16 lg:mb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TestimonialCard
                  testimonial={testimonials[activeIndex]}
                  isActive={true}
                  onPlayVideo={handlePlayVideo}
                />
              </motion.div>
            </AnimatePresence>

            {/* Slider Navigation */}
            <div className="flex items-center justify-between mt-4 md:mt-6">
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-mono font-medium text-primary">
                  {String(activeIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-xs md:text-sm font-mono text-border">/</span>
                <span className="text-xs md:text-sm font-mono text-muted-foreground">
                  {String(testimonials.length).padStart(2, "0")}
                </span>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveIndex((p) => (p - 1 + testimonials.length) % testimonials.length)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-primary/20 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Icons.ArrowLeft />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveIndex((p) => (p + 1) % testimonials.length)}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-primary/20 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Icons.ArrowRight />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Video Testimonials Grid */}
          {videos.length > 0 && (
            <div className="mb-12 md:mb-16 lg:mb-20 reveal-element">
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="w-4 md:w-6 h-px bg-gradient-to-r from-primary to-primary/60" />
                <span className="text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  {videoSection.badge}
                </span>
                <span className="text-[10px] md:text-xs text-primary ml-auto">
                  {videoSection.reviewCountText}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {videos.map((video: any) => (
                  <VideoThumbnailCard
                    key={video.id}
                    video={video}
                    onClick={() => handlePlayVideo(video.videoId, video.title)}
                  />
                ))}
              </div>

              <div className="text-center mt-4 md:mt-6">
                <a
                  href={videoSection.googleReviewsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs md:text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <Icons.Google />
                  {videoSection.googleReviewsButtonText}
                </a>
              </div>
            </div>
          )}

          {/* Stats Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4 pt-4 md:pt-6 mt-4 md:mt-6 border-t border-primary/10 reveal-element">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex -space-x-2">
                {testimonials.slice(0, 4).map((t: any, i: number) => (
                  <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-card flex items-center justify-center text-primary text-[8px] md:text-xs font-medium shadow-sm">
                    {t.avatar}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        videoId={selectedVideo}
        title={selectedVideoTitle}
      />
    </>
  );
};

export default Testimonials;
