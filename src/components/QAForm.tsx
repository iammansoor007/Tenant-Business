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
import { useTenantData, useTenant } from "../context/TenantContext";

gsap.registerPlugin(ScrollTrigger);



const Icons = {
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Mail: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
  Phone: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  ),
  Building: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="2"
        width="16"
        height="20"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 6h8M8 10h8M8 14h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Check: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="3"
    >
      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
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
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Identity: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 20v-2a7 7 0 0 1 14 0v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  Specification: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 8h8M8 12h8M8 16h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  Transmission: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 2L15 9M22 2l-7 14-4-4-4 4-4-4L2 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Flag: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 2v20M4 2L20 8L4 14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

const LiquidParallax = ({
  children,
  speed = 0.1,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.6, 0.4]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={`absolute inset-0 will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
};

const HolographicInput = ({
  icon: Icon,
  label,
  type = "text",
  options = [],
  ...props
}: {
  icon: any;
  label: string;
  type?: string;
  options?: any[];
  [key: string]: any;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={
          isFocused
            ? {
              opacity: 0.2,
              scale: 1.05,
            }
            : {
              opacity: isHovered ? 0.1 : 0,
              scale: 1,
            }
        }
        className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary rounded-xl blur-lg"
        transition={{ duration: 0.3 }}
      />

      <div
        className={`
        relative flex items-center bg-white rounded-xl border transition-all duration-500
        ${isFocused
            ? "border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
            : hasValue
              ? "border-primary/30"
              : "border-border/80 hover:border-border/80"
          }
      `}
      >
        <div
          className={`
          absolute left-4 transition-all duration-500
          ${isFocused ? "text-primary scale-110" : hasValue ? "text-primary" : "text-muted-foreground group-hover:text-muted-foreground/80"}
        `}
        >
          <Icon />
        </div>

        {type === "select" ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              props.onChange?.(e);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-12 pr-10 py-4 bg-transparent rounded-xl text-foreground text-sm focus:outline-none appearance-none cursor-pointer"
            {...props}
          >
            <option value="" disabled selected>
              {label}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            placeholder={label}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              props.onChange?.(e);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
            {...props}
          />
        )}

        {isFocused && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary rounded-full"
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </div>
    </div>
  );
};

const QuantumTextarea = ({
  icon: Icon,
  label,
  ...props
}: {
  icon: any;
  label: string;
  [key: string]: any;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={
          isFocused
            ? {
              opacity: 0.2,
              scale: 1.02,
            }
            : {
              opacity: isHovered ? 0.1 : 0,
              scale: 1,
            }
        }
        className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary rounded-xl blur-lg"
        transition={{ duration: 0.3 }}
      />

      <div
        className={`
        relative flex bg-white rounded-xl border transition-all duration-500
        ${isFocused
            ? "border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
            : hasValue
              ? "border-primary/30"
              : "border-border/80 hover:border-border/80"
          }
      `}
      >
        <div
          className={`
          absolute left-4 top-4 transition-all duration-500
          ${isFocused ? "text-primary scale-110" : hasValue ? "text-primary" : "text-muted-foreground"}
        `}
        >
          <Icon />
        </div>

        <textarea
          placeholder={label}
          rows={5}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-12 pr-4 py-4 bg-transparent rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none resize-none"
          {...props}
        />
      </div>
    </div>
  );
};

const CrystalServiceCard = ({
  title,
  desc,
  icon,
  isSelected,
  onClick,
}: {
  title: string;
  desc: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`
        relative p-5 sm:p-6 rounded-2xl cursor-pointer transition-all duration-700
        ${isSelected
          ? "bg-gradient-to-br from-primary/5 via-card to-primary/5 shadow-2xl"
          : "bg-card hover:bg-primary/5"
        }
      `}
      style={{
        boxShadow: isSelected
          ? "0 20px 40px -15px hsl(var(--primary)/0.2), inset 0 0 0 1px hsl(var(--primary)/0.3)"
          : isHovered
            ? "0 15px 30px -12px hsl(var(--foreground)/0.1), inset 0 0 0 1px hsl(var(--primary)/0.2)"
            : "0 10px 25px -8px hsl(var(--foreground)/0.05), inset 0 0 0 1px hsl(var(--border)/0.3)",
      }}
    >
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl"
        />
      )}

      <div className="relative">
        <motion.div
          animate={
            isHovered || isSelected
              ? {
                rotate: [0, 5, -5, 0],
                scale: 1.1,
              }
              : {}
          }
          transition={{ duration: 0.5 }}
          className={`
            text-2xl sm:text-3xl mb-3 sm:mb-4 transition-colors duration-500
            ${isSelected ? "text-primary" : "text-primary/70 group-hover:text-primary"}
          `}
        >
          {icon}
        </motion.div>
      </div>

      <h4
        className={`
        text-sm sm:text-base font-medium mb-1 sm:mb-2 transition-colors duration-500
        ${isSelected ? "text-foreground" : "text-foreground/80"}
      `}
      >
        {title}
      </h4>
      <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
        {desc}
      </p>

      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
            <Icons.Check />
          </div>
        </motion.div>
      )}

      {isSelected && (
        <>
          <div className="absolute top-0 left-0 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-primary/30 rounded-tl-2xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-primary/30 rounded-br-2xl" />
        </>
      )}
    </motion.div>
  );
};

const StageIndicator = ({ currentStep }: { currentStep: number }) => {
  const completeData = useTenantData();
  const stageIcons = [Icons.Identity, Icons.Specification, Icons.Transmission];
  const stages = ((((completeData.quote as any)?.stages) || [
    { number: 1, name: "Identity", desc: "Your details" },
    { number: 2, name: "Specification", desc: "Project scope" },
    { number: 3, name: "Transmission", desc: "Final review" },
  ]) as any[]).map((s: any, idx: number) => ({
    ...s,
    icon: stageIcons[idx] || Icons.Identity,
  }));

  return (
    <div className="relative mb-12 sm:mb-16">
      <div className="absolute top-4 sm:top-6 left-0 right-0 h-[2px] bg-border hidden sm:block" />

      <motion.div
        className="absolute top-4 sm:top-6 left-0 h-[2px] bg-gradient-to-r from-primary to-primary hidden sm:block"
        initial={{ width: "0%" }}
        animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="relative flex items-start justify-between">
        {stages.map((stage) => (
          <div key={stage.number} className="flex flex-col items-center flex-1">
            <motion.div
              animate={
                currentStep >= stage.number
                  ? {
                    scale: 1.1,
                    backgroundColor: "hsl(var(--primary))",
                    borderColor: "hsl(var(--primary))",
                  }
                  : {
                    scale: 1,
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }
              }
              className={`
                relative w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 
                flex items-center justify-center mb-2 sm:mb-3
                ${currentStep >= stage.number ? "bg-primary border-primary" : "bg-background border-border"}
                shadow-md transition-all duration-300
              `}
            >
              {currentStep > stage.number ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <Icons.Check />
                </motion.div>
              ) : (
                <div
                  className={`${currentStep >= stage.number ? "text-primary-foreground" : "text-muted-foreground"}`}
                >
                  <stage.icon />
                </div>
              )}
            </motion.div>

            <span
              className={`
              text-[10px] sm:text-xs font-semibold tracking-wider text-center
              ${currentStep >= stage.number ? "text-primary" : "text-muted-foreground"}
            `}
            >
              <span className="hidden xs:inline">{stage.name}</span>
              <span className="xs:hidden">{stage.number}</span>
            </span>

            <span className="text-[8px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
              {stage.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SuccessModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const completeData = useTenantData();
  const { tenant } = useTenant();
  const isFlagship = !tenant || tenant.slug === "max-quality-roofing";
  const rawSuccess = (completeData.quote as any)?.success || {};
  let message = rawSuccess.message || "Your project details have been successfully transmitted.";
  let response = rawSuccess.response || "Our team will review your request and get back to you shortly.";
  if (!isFlagship) {
    message = message.replace(/Max Quality Roofing/gi, tenant?.name || "our company");
    response = response
      .replace(/Max will personally review/gi, tenant?.name ? `${tenant.name} will review` : "Our team will review")
      .replace(/Max/g, "Our team");
  }
  const success = {
    badge: rawSuccess.badge || "TRANSMISSION CONFIRMED",
    title: rawSuccess.title || "ESTIMATE REQUEST LOGGED",
    message,
    response,
    primaryButton: rawSuccess.primaryButton || rawSuccess.buttonText || "Return to Site",
    buttonText: rawSuccess.buttonText || "Close",
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-secondary/95 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            className="relative bg-card rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-card to-primary/5" />

            <div className="relative pt-10 sm:pt-12 pb-6 sm:pb-8 px-6 sm:px-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: 0.2,
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Icons.Check />
                </motion.div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl sm:text-2xl font-light text-foreground mb-2 sm:mb-3"
              >
                {success.title}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-muted-foreground text-xs sm:text-sm leading-relaxed"
              >
                {success.message}
                <br />
                <span className="font-medium text-primary mt-2 block">
                  {success.response}
                </span>
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={onClose}
                className="mt-6 sm:mt-8 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-medium tracking-[0.2em] uppercase rounded-full shadow-lg hover:shadow-xl transition-all duration-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {success.buttonText}
              </motion.button>
            </div>

            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 w-8 h-8 sm:w-12 sm:h-12 border-t-2 border-l-2 border-primary/20" />
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-8 h-8 sm:w-12 sm:h-12 border-b-2 border-r-2 border-primary/20" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const GetQuote = () => {
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    projectType: "",
    timeline: "",
    message: "",
  });

  const completeData = useTenantData();
  const { tenant } = useTenant();
  const isFlagship = !tenant || tenant.slug === "max-quality-roofing";
  const quoteData = (completeData?.quote || {}) as any;
  const rawSection = quoteData.section || {};
  const section = {
    badge: (!isFlagship && rawSection.badge?.includes("MAX QUALITY"))
      ? `${tenant?.name?.toUpperCase() || "ROOFING"} COMMAND CENTER`
      : (rawSection.badge || "FREE INSPECTION & ESTIMATE"),
    headline: rawSection.headline || "Fast Response From The Owner",
    description: (!isFlagship && rawSection.description)
      ? rawSection.description
          .replace(/Max will personally review/gi, tenant?.name ? `${tenant.name} will personally review` : "our team will review")
          .replace(/Max/g, "our team")
      : (rawSection.description || "Tell us about your roofing project and get an honest, accurate estimate."),
  };
  const services = Array.isArray(quoteData.services) ? quoteData.services : [];
  const projectTypes = Array.isArray(quoteData.projectTypes) ? quoteData.projectTypes : [];
  const timelines = Array.isArray(quoteData.timelines) ? quoteData.timelines : [];
  const email = quoteData.email || "";

  const rawSuccess = quoteData.success || {};
  const success = {
    title: rawSuccess.title || "Estimate Request Submitted!",
    message: (!isFlagship && rawSuccess.message)
      ? rawSuccess.message.replace(/Max Quality Roofing/gi, tenant?.name || "our company")
      : (rawSuccess.message || "Thank you for reaching out. We will review your request and get back to you promptly."),
    response: (!isFlagship && rawSuccess.response)
      ? rawSuccess.response
          .replace(/Max will personally review/gi, tenant?.name ? `${tenant.name} will review` : "Our team will review")
          .replace(/Max/g, "Our team")
      : (rawSuccess.response || "We will review your request and get back to you shortly."),
    buttonText: rawSuccess.buttonText || "Close",
  };
  const fields = quoteData.fields || {};
  const summary = quoteData.summary || {};
  const buttons = quoteData.buttons || {};
  const consultationStat = quoteData.consultationStat || {};


  const toggleService = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isFlagship = !tenant || tenant.slug === "max-quality-roofing";
    const companyTitle = (!isFlagship && tenant?.name) || completeData.footer?.company?.title || completeData.companyName || "Professional Roofing";
    const companyLocation = (!isFlagship && tenant?.location)
      ? tenant.location
      : (completeData.footer?.company?.subTitle || "Local Service Area");
    const targetEmail =
      (!isFlagship && tenant?.email)
        ? tenant.email
        : (email ||
           tenant?.email ||
           completeData.contact?.email ||
           completeData.footer?.contact?.email ||
           (isFlagship ? "maxqualityroofing@gmail.com" : ""));

    const serviceNames = selectedServices
      .map((id) => services.find((s: any) => s.id === id)?.title)
      .join(", ");

    const emailContent = `
🏗️ ${companyTitle} Inspection Request

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Company: ${formData.company}
Project Type: ${projectTypes.find((t: any) => t.value === formData.projectType)?.label || quoteData.notSpecified}
Timeline: ${timelines.find((t: any) => t.value === formData.timeline)?.label || quoteData.notSpecified}
Selected Services: ${serviceNames || quoteData.noneSelected}

📝 MESSAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ Submitted: ${new Date().toLocaleString()}
${companyLocation}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    try {
      try {
        const response = await fetch(
          `https://formsubmit.co/ajax/${targetEmail}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              _subject: `🏗️ ${companyTitle} Inspection Request - ${formData.name}`,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              company: formData.company,
              project_type: projectTypes.find(
                (t: any) => t.value === formData.projectType,
              )?.label,
              timeline: timelines.find(
                (t: any) => t.value === formData.timeline,
              )?.label,
              services: serviceNames,
              message: formData.message,
              _template: "table",
              _captcha: "false",
            }),
          },
        );

        if (response.ok) {
          setShowSuccess(true);
          setFormStep(1);
          setSelectedServices([]);
          setFormData({
            name: "",
            email: "",
            phone: "",
            company: "",
            projectType: "",
            timeline: "",
            message: "",
          });
          setIsSubmitting(false);
          return;
        }
      } catch (fetchError) {
        console.log("FormSubmit failed, using mailto fallback");
      }

      window.location.href = `mailto:${targetEmail}?subject=🏗️ ${encodeURIComponent(companyTitle)} Inspection Request - ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(emailContent)}`;
      setShowSuccess(true);
      setFormStep(1);
      setSelectedServices([]);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        projectType: "",
        timeline: "",
        message: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Please email us directly at ${email} with your project details.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !isClient) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".quote-cinematic",
        { y: 50, opacity: 0, rotateX: 5 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "expo.out",
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
      className="relative bg-background py-12 sm:py-14 md:py-16 lg:py-16 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1000px] h-[400px] sm:h-[500px] bg-gradient-to-b from-primary/5 to-transparent opacity-60 blur-3xl" />





      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-30">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 md:mb-20 quote-cinematic">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-8 sm:w-12 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />
            <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase text-primary/80">
              {section.badge}
            </span>
            <div className="w-8 sm:w-12 h-[2px] bg-gradient-to-r from-primary via-primary to-transparent" />
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
            dangerouslySetInnerHTML={{ __html: section.headline }}
          />

          <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-light max-w-2xl mx-auto px-4">
            {section.description}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-primary/10 shadow-2xl overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <motion.rect
                x="2"
                y="2"
                width="calc(100% - 4px)"
                height="calc(100% - 4px)"
                fill="none"
                stroke="url(#formGradient)"
                strokeWidth="1.2"
                strokeDasharray="8 8"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.6 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              <defs>
                <linearGradient
                  id="formGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity="0.8"
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--primary)/0.8)"
                    stopOpacity="0.8"
                  />
                </linearGradient>
              </defs>
            </svg>

            <div className="relative p-5 sm:p-8 md:p-10 lg:p-12">
              <StageIndicator currentStep={formStep} />

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                <AnimatePresence mode="wait">
                  {formStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <HolographicInput
                          icon={Icons.User}
                          label={fields.nameLabel}
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                        <HolographicInput
                          icon={Icons.Mail}
                          type="email"
                          label={fields.emailLabel}
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <HolographicInput
                          icon={Icons.Phone}
                          type="tel"
                          label={fields.phoneLabel}
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                        <HolographicInput
                          icon={Icons.Building}
                          label={fields.companyLabel}
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>
                  )}

                  {formStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-6 sm:space-y-8"
                    >
                      <div>
                        <label className="block text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground mb-4 sm:mb-6">
                          {fields.servicesLabel}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {services.map((service: any) => (
                            <CrystalServiceCard
                              key={service.id}
                              title={service.title}
                              desc={service.desc}
                              icon={service.icon}
                              isSelected={selectedServices.includes(service.id)}
                              onClick={() => toggleService(service.id)}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <HolographicInput
                          icon={Icons.Building}
                          type="select"
                          label={fields.classificationLabel}
                          name="projectType"
                          options={projectTypes}
                          value={formData.projectType}
                          onChange={handleInputChange}
                        />
                        <HolographicInput
                          icon={Icons.Calendar}
                          type="select"
                          label={fields.timelineLabel}
                          name="timeline"
                          options={timelines}
                          value={formData.timeline}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>
                  )}

                  {formStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-6 sm:space-y-8"
                    >
                      <QuantumTextarea
                        icon={Icons.Mail}
                        label={fields.messageLabel}
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-card to-primary/5 rounded-xl border border-primary/10"
                      >
                        <div className="relative z-10">
                          <h4 className="text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-primary mb-3 sm:mb-4 flex items-center gap-2">
                            <Icons.Sparkle />
                            {summary.title}
                          </h4>
                          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                {summary.servicesLabel}
                              </p>
                              <p className="font-medium text-foreground text-xs sm:text-sm">
                                {selectedServices.length} of {services.length}
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                {summary.classificationLabel}
                              </p>
                              <p className="font-medium text-foreground text-xs sm:text-sm truncate">
                                {formData.projectType
                                  ? projectTypes.find(
                                    (t: any) =>
                                      t.value === formData.projectType,
                                  )?.label
                                  : "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                {summary.timelineLabel}
                              </p>
                              <p className="font-medium text-foreground text-xs sm:text-sm truncate">
                                {formData.timeline
                                  ? timelines.find(
                                    (t: any) => t.value === formData.timeline,
                                  )?.label
                                  : "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                                {summary.responseLabel}
                              </p>
                              <p className="font-medium text-primary text-xs sm:text-sm">
                                {summary.responseTime}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-primary/10">
                  <motion.button
                    type="button"
                    onClick={() => setFormStep(Math.max(1, formStep - 1))}
                    className={`
                      relative px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-full transition-all duration-500
                      ${formStep === 1
                        ? "opacity-0 pointer-events-none"
                        : "text-muted-foreground hover:text-foreground"
                      }
                    `}
                    whileHover={{ x: -3 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={formStep === 1}
                  >
                    <span className="flex items-center gap-1 sm:gap-2">
                      ← <span className="hidden xs:inline">{buttons.previous}</span>
                    </span>
                  </motion.button>

                  {formStep < 3 ? (
                    <motion.button
                      type="button"
                      onClick={() => setFormStep(formStep + 1)}
                      className="relative px-5 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-primary to-primary/80 text-white text-xs sm:text-sm font-medium rounded-full shadow-lg overflow-hidden group cursor-pointer whitespace-nowrap"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                        <span className="whitespace-nowrap">{buttons.continue}</span>
                        <Icons.ArrowRight className="shrink-0" />
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative px-6 sm:px-10 py-2.5 sm:py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs sm:text-sm font-medium rounded-full shadow-2xl overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    >
                      <span className="relative z-10 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full shrink-0"
                            />
                            <span className="hidden xs:inline whitespace-nowrap">
                              {buttons?.submitting}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="hidden xs:inline whitespace-nowrap">
                              {buttons?.submitIdle}
                            </span>
                            <span className="xs:hidden whitespace-nowrap">{buttons?.submitMobile}</span>
                            <Icons.Send className="shrink-0" />
                          </>
                        )}
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    </motion.button>
                  )}
                </div>
              </form>

              <div className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-primary/10">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -3, scale: 1.1 }}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-card flex items-center justify-center text-primary text-[8px] sm:text-xs font-medium shadow-lg"
                      >
                        {String.fromCharCode(64 + i)}
                      </motion.div>
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {consultationStat?.number}
                    </span>{" "}
                    {consultationStat?.label}
                  </span>
                </div>
                <div className="hidden xs:block w-px h-4 sm:h-6 bg-border" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1440 100"
          className="relative block w-full h-16 sm:h-20 md:h-24"
          preserveAspectRatio="none"
        >
          <path
            fill="url(#quantumWave)"
            d="M0,48L60,52.3C120,57,240,65,360,65.3C480,66,600,58,720,52C840,46,960,42,1080,46C1200,50,1320,58,1380,62L1440,66L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
          />
          <defs>
            <linearGradient id="quantumWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0.05"
              />
              <stop
                offset="50%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0.08"
              />
              <stop
                offset="100%"
                stopColor="hsl(var(--primary))"
                stopOpacity="0.05"
              />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </section>
  );
};

export default GetQuote;
