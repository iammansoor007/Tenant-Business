import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTenantData, useTenant } from "../context/TenantContext";

gsap.registerPlugin(ScrollTrigger);

const Mission = () => {
  const completeData = useTenantData();
  const { tenant, isFlagship } = useTenant();
  const sectionRef = useRef<HTMLElement>(null);
  const about = completeData.about || {};
  const headline = about.headline || {};
  const prefix = headline.prefix || "Dedicated to";
  const rawHighlight = headline.highlight || "Excellence";
  const highlight = (!isFlagship && rawHighlight.includes("Max Quality"))
    ? (tenant?.name || rawHighlight)
    : rawHighlight;

  const rawDesc = about.description || "Providing superior craftsmanship and customer satisfaction on every project.";
  const description = (!isFlagship && rawDesc)
    ? rawDesc
        .replace(/Max Quality Roofing/gi, tenant?.name || "Our company")
        .replace(/Max Poitra/gi, "our dedicated team")
        .replace(/Great Falls, Montana/gi, tenant?.location || "the local community")
        .replace(/Montana weather/gi, `${tenant?.state || "local"} weather`)
    : rawDesc;

  useEffect(() => {
    if (!sectionRef.current) return;
    const tl = gsap.timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } });
    tl.fromTo(sectionRef.current.querySelector(".mission-headline"), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" })
      .fromTo(sectionRef.current.querySelectorAll(".mission-copy"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: "power3.out" }, "-=0.4");
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-background">
      <div className="grid-editorial items-center">
        <div className="md:col-span-6 md:col-start-7 order-1 md:order-2">
          <div className="accent-line mb-6 mission-copy" />
          <h2 className="heading-lg text-foreground mb-8 mission-headline"
            dangerouslySetInnerHTML={{ __html: `${prefix} ${highlight}`.trim() }}
          />
          <div className="space-y-6">
            <p className="body-lg text-foreground/90 mission-copy">{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
