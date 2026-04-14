"use client";

import { Shader, ChromaFlow, Swirl } from "shaders/react";
import {
  CursorProvider,
  Cursor,
  CursorFollow,
} from "@/components/animate-ui/primitives/animate/cursor";
import { GrainOverlay } from "@/components/grain-overlay";
import { WorkSection } from "@/components/sections/work-section";
import { ServicesSection } from "@/components/sections/services-section";
import { AboutSection } from "@/components/sections/about-section";
import { ContactSection } from "@/components/sections/contact-section";
import { MagneticButton } from "@/components/magnetic-button";
import { LogoGrid } from "@/components/logo-grid";
import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const TOTAL_SECTIONS = 5;

export default function Home() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const shaderContainerRef = useRef<HTMLDivElement>(null);

  // Spring-driven horizontal scroll position
  const rawX = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 90, damping: 22, mass: 0.7 });

  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartRawX = useRef(0);

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas");
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true);
          return true;
        }
      }
      return false;
    };

    if (checkShaderReady()) return;

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId);
      }
    }, 100);

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 1500);

    return () => {
      clearInterval(intervalId);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const getWidth = useCallback(
    () => viewportRef.current?.offsetWidth ?? window.innerWidth,
    [],
  );

  const scrollToSection = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(TOTAL_SECTIONS - 1, index));
      rawX.set(-clamped * getWidth());
      setCurrentSection(clamped);
    },
    [rawX, getWidth],
  );

  // Wheel → spring-driven horizontal pan + debounced snap
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const width = getWidth();
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const next = Math.max(
        -(TOTAL_SECTIONS - 1) * width,
        Math.min(0, rawX.get() - delta),
      );
      rawX.set(next);
      setCurrentSection(
        Math.max(0, Math.min(TOTAL_SECTIONS - 1, Math.round(-next / width))),
      );

      clearTimeout(snapTimeoutRef.current);
      snapTimeoutRef.current = setTimeout(() => {
        const nearest = Math.max(
          0,
          Math.min(TOTAL_SECTIONS - 1, Math.round(-rawX.get() / width)),
        );
        rawX.set(-nearest * width);
        setCurrentSection(nearest);
      }, 180);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [rawX, getWidth]);

  // Touch → drag + snap on release
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartRawX.current = rawX.get();
      clearTimeout(snapTimeoutRef.current);
    };

    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;
      if (Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
        const width = getWidth();
        const next = Math.max(
          -(TOTAL_SECTIONS - 1) * width,
          Math.min(0, touchStartRawX.current + dx),
        );
        rawX.set(next);
        setCurrentSection(
          Math.max(0, Math.min(TOTAL_SECTIONS - 1, Math.round(-next / width))),
        );
      }
    };

    const onTouchEnd = () => {
      const width = getWidth();
      const nearest = Math.max(
        0,
        Math.min(TOTAL_SECTIONS - 1, Math.round(-rawX.get() / width)),
      );
      rawX.set(-nearest * width);
      setCurrentSection(nearest);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [rawX, getWidth]);

  // Re-snap on window resize
  useEffect(() => {
    const onResize = () => rawX.set(-currentSection * getWidth());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [currentSection, rawX, getWidth]);

  const SECTION_NAMES = ["Home", "Work", "Services", "About", "Contact"];

  return (
    <CursorProvider global>
      <main className="relative h-screen w-full overflow-hidden bg-background">
        <Cursor style={{ transform: "translate(0, 0)" }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.5056 10.7754C21.1225 10.5355 21.431 10.4155 21.5176 10.2459C21.5926 10.099 21.5903 9.92446 21.5115 9.77954C21.4205 9.61226 21.109 9.50044 20.486 9.2768L4.59629 3.5728C4.0866 3.38983 3.83175 3.29835 3.66514 3.35605C3.52029 3.40621 3.40645 3.52004 3.35629 3.6649C3.29859 3.8315 3.39008 4.08635 3.57304 4.59605L9.277 20.4858C9.50064 21.1088 9.61246 21.4203 9.77973 21.5113C9.92465 21.5901 10.0991 21.5924 10.2461 21.5174C10.4157 21.4308 10.5356 21.1223 10.7756 20.5054L13.3724 13.8278C13.4194 13.707 13.4429 13.6466 13.4792 13.5957C13.5114 13.5506 13.5508 13.5112 13.5959 13.479C13.6468 13.4427 13.7072 13.4192 13.828 13.3722L20.5056 10.7754Z"
              fill="white"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Cursor>
        <CursorFollow
          side="bottom"
          sideOffset={4}
          align="end"
          alignOffset={20}
          transition={{ stiffness: 400, damping: 30, bounce: 0 }}
        >
          <div className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 backdrop-blur-xl">
            <span className="font-mono text-xs text-foreground">
              {SECTION_NAMES[currentSection]}
            </span>
          </div>
        </CursorFollow>
        <GrainOverlay />

        <div
          ref={shaderContainerRef}
          className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ contain: "strict" }}
        >
          <Shader className="h-full w-full">
            <Swirl
              colorA="#1275d8"
              colorB="#e19136"
              speed={0.8}
              detail={0.8}
              blend={50}
            />
            <ChromaFlow
              baseColor="#0066ff"
              upColor="#0066ff"
              downColor="#d1d1d1"
              leftColor="#e19136"
              rightColor="#e19136"
              intensity={0.9}
              radius={1.8}
              momentum={25}
              maskType="alpha"
              opacity={0.97}
            />
          </Shader>
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <nav
          className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-opacity duration-700 md:px-12 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => scrollToSection(0)}
            className="flex items-center gap-2 transition-transform hover:scale-105"
          >
            <LogoGrid />
            <span className="font-sans text-xl font-semibold tracking-tight text-foreground">
              Silke Pilon
            </span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {["Home", "Work", "Services", "About", "Contact"].map(
              (item, index) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(index)}
                  className={`group relative font-sans text-sm font-medium transition-colors ${
                    currentSection === index
                      ? "text-foreground"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                >
                  {item}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                      currentSection === index
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>
              ),
            )}
          </div>

          <MagneticButton
            variant="secondary"
            onClick={() => scrollToSection(4)}
          >
            Get Started
          </MagneticButton>
        </nav>

        <div
          ref={viewportRef}
          className={`relative z-10 h-screen overflow-hidden transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <motion.div
            style={{ x }}
            className="flex h-screen will-change-transform"
          >
            {/* Hero Section */}
            <section className="flex min-h-screen w-screen shrink-0 flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-24">
              <div className="max-w-3xl">
                <div className="mb-4 inline-block animate-in fade-in slide-in-from-bottom-4 rounded-full border border-foreground/20 bg-foreground/15 px-4 py-1.5 backdrop-blur-md duration-700">
                  <p className="font-mono text-xs text-foreground/90">
                    WebGL Powered Design
                  </p>
                </div>
                <h1 className="mb-6 animate-in fade-in slide-in-from-bottom-8 font-sans text-6xl font-light leading-[1.1] tracking-tight text-foreground duration-1000 md:text-7xl lg:text-8xl">
                  <span className="text-balance">
                    Creative experiences
                    <br />
                    in fluid motion
                  </span>
                </h1>
                <p className="mb-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-lg leading-relaxed text-foreground/90 duration-1000 delay-200 md:text-xl">
                  <span className="text-pretty">
                    Transforming digital spaces with dynamic shader effects and
                    real-time visual experiences that captivate and inspire.
                  </span>
                </p>
                <div className="flex animate-in fade-in slide-in-from-bottom-4 flex-col gap-4 duration-1000 delay-300 sm:flex-row sm:items-center">
                  <MagneticButton
                    size="lg"
                    variant="primary"
                    onClick={() =>
                      window.open(
                        "https://v0.app/templates/R3n0gnvYFbO",
                        "_blank",
                      )
                    }
                  >
                    Open in v0
                  </MagneticButton>
                  <MagneticButton
                    size="lg"
                    variant="secondary"
                    onClick={() => scrollToSection(2)}
                  >
                    View Demo
                  </MagneticButton>
                </div>
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-in fade-in duration-1000 delay-500">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs text-foreground/80">
                    Scroll to explore
                  </p>
                  <div className="flex h-6 w-12 items-center justify-center rounded-full border border-foreground/20 bg-foreground/15 px-1 backdrop-blur-md">
                    <motion.div
                      className="h-2 w-2 rounded-full bg-foreground/80"
                      animate={{ x: [-14, 14, -14] }}
                      transition={{
                        duration: 2.4,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "loop",
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            <WorkSection />
            <ServicesSection />
            <AboutSection scrollToSection={scrollToSection} />
            <ContactSection />
          </motion.div>
        </div>

        <style jsx global>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </main>
    </CursorProvider>
  );
}
