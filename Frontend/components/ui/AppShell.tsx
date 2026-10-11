"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { eventBus } from "@/lib/bus";

interface AppShellProps {
  children: React.ReactNode;
  onStartWalkthrough?: () => void;
}

interface PortalTab {
  name: string;
  href: string;
  match: (path: string) => boolean;
}

interface ToastMessage {
  id: string;
  msg: string;
  undo?: () => void;
}

export function AppShell({ children, onStartWalkthrough }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Initialize theme from document or localStorage
  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme") || localStorage.getItem("campuslink_theme");
    setIsDark(theme === "dark");
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.add("theme-anim");
    if (nextDark) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("campuslink_theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("campuslink_theme", "light");
    }
    setTimeout(() => {
      document.documentElement.classList.remove("theme-anim");
    }, 500);
  };

  // Toast dispatch helper
  const addToast = (msg: string, undo?: () => void) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, msg, undo }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Listen to application events from EventBus
  useEffect(() => {
    const unsub = eventBus.subscribe((ev) => {
      setNotifCount((c) => c + 1);
      addToast(ev.title || "New update received");
    });
    return unsub;
  }, []);

  const tabs: PortalTab[] = [
    {
      name: "Student",
      href: "/student",
      match: (p) => p.startsWith("/student"),
    },
    {
      name: "Recruiter",
      href: "/recruiter",
      match: (p) => p.startsWith("/recruiter"),
    },
    {
      name: "Placement cell",
      href: "/cell",
      match: (p) => p.startsWith("/cell"),
    },
  ];

  const activeIndex = tabs.findIndex((t) => t.match(pathname));
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    if (activeIndex >= 0 && tabRefs.current[activeIndex]) {
      const el = tabRefs.current[activeIndex];
      if (el) {
        setPillStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          opacity: 1,
        });
      }
    } else {
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeIndex, pathname]);

  // Guided Demo Tour Steps
  const TOUR_STEPS = [
    {
      targetId: "s-ring",
      title: "Readiness you can trust",
      desc: "The ring and the explainability bar use the exact same numbers, so they always add up. Tick what-if skills to see instant cohort tier changes.",
    },
    {
      targetId: "s-match",
      title: "Matching you can steer",
      desc: "Move the Grades/Skills slider to re-rank. Subham Panda (6.82 CGPA) glides to #1 when skills weight increases under the flexible cutoff policy.",
    },
    {
      targetId: "s-tt",
      title: "Clashes fixed with computed options",
      desc: "Room collisions are detected automatically from timetable bookings. Click 'Fix it' to relocate overlapping sessions into free halls with zero spreadsheet chaos.",
    },
  ];

  const handleStartTour = () => {
    setTourStep(0);
    setTourOpen(true);
    if (onStartWalkthrough) onStartWalkthrough();
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans transition-colors duration-300">
      {/* Top Bar with Sliding Pill Tabs */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-3 px-5 py-2.5 bg-canvas/80 backdrop-blur-md border-b border-line transition-colors duration-300">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Brand Mark & Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display font-semibold text-[17px] tracking-tight text-ink hover:opacity-90 transition-opacity"
          >
            <span className="w-6 h-6 rounded-[8px] bg-gradient-to-br from-primary to-mint inline-block shrink-0 shadow-xs" />
            <span className="hidden sm:inline">CampusLink</span>
          </Link>

          {/* Center Sliding Pill Tabs */}
          <nav
            aria-label="Portals"
            className="relative flex items-center bg-surface-2 rounded-full p-[3px] border border-line"
          >
            {/* Spring-loaded Pill Background */}
            <span
              className="absolute top-[3px] bottom-[3px] bg-surface rounded-full border border-line shadow-xs pointer-events-none transition-all duration-[450ms] ease-[cubic-bezier(0.34,1.35,0.64,1)]"
              style={{
                transform: `translateX(${pillStyle.left}px)`,
                width: `${pillStyle.width}px`,
                opacity: pillStyle.opacity,
              }}
            />

            {tabs.map((tab, idx) => {
              const isActive = idx === activeIndex;
              return (
                <Link
                  key={tab.name}
                  ref={(el) => {
                    tabRefs.current[idx] = el;
                  }}
                  href={tab.href}
                  className={`relative z-10 px-4 py-1.5 text-[13px] font-medium rounded-full transition-colors duration-200 ${
                    isActive ? "text-ink font-semibold" : "text-ink-2 hover:text-ink"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {tab.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2">
            <Link
              href="/system"
              className={`text-[13px] font-medium transition-colors hidden md:inline px-2 py-1 ${
                pathname.startsWith("/system") ? "text-primary" : "text-ink-3 hover:text-ink"
              }`}
            >
              Judges' Corner
            </Link>

            {/* Start Demo Button */}
            <button
              type="button"
              onClick={handleStartTour}
              className="btn btn-ghost sm hidden sm:inline-flex text-[13px]"
            >
              Start demo
            </button>

            {/* Bell Notifications */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("s-events") || document.getElementById("events-feed");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else addToast("Notifications active across all portals");
              }}
              className="icon-btn"
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-none stroke-current stroke-[1.6]">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {notifCount > 0 && (
                <span className="badge">{notifCount}</span>
              )}
            </button>

            {/* Sun / Moon Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="icon-btn theme-btn"
              aria-label="Toggle light and dark theme"
            >
              <svg className="i-moon w-[18px] h-[18px] fill-none stroke-current stroke-[1.6]" viewBox="0 0 24 24">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
              <svg className="i-sun w-[18px] h-[18px] fill-none stroke-current stroke-[1.6]" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            </button>

            {/* Logout Button (Return to Landing Page Portal Selector) */}
            {pathname !== "/" && (
              <button
                type="button"
                onClick={() => {
                  addToast("Logged out of portal");
                  router.push("/");
                }}
                className="btn btn-ghost sm flex items-center gap-1.5 text-[12px] text-coral-ink border-coral/30 hover:bg-coral-soft hover:border-coral transition-all px-2.5 sm:px-3"
                title="Log out and switch portal"
                aria-label="Log out"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[2]">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 transition-colors duration-300">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-[13px] text-ink-3 border-t border-line/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>CampusLink · Placement intelligence platform (BPUT 2026 PS10)</span>
          <div className="flex items-center gap-4">
            <Link href="/system" className="hover:text-ink">Architecture</Link>
            <Link href="/student" className="hover:text-ink">Student</Link>
            <Link href="/recruiter" className="hover:text-ink">Recruiter</Link>
            <Link href="/cell" className="hover:text-ink">Placement cell</Link>
          </div>
        </div>
      </footer>

      {/* Toast Notification Container */}
      <div className="toasts" id="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <span>{t.msg}</span>
            {t.undo && (
              <button
                type="button"
                className="toast-u"
                onClick={() => {
                  t.undo?.();
                  setToasts((prev) => prev.filter((x) => x.id !== t.id));
                }}
              >
                Undo
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Guided Tour Modal & Overlay */}
      {tourOpen && (
        <>
          <div
            className="fixed inset-0 z-[80] bg-scrim/60 backdrop-blur-[2px] pointer-events-auto"
            onClick={() => setTourOpen(false)}
          />
          <aside
            className="tour fixed right-5 bottom-5 z-[90] bg-surface border border-line-strong rounded-[16px] shadow-pop p-5 w-[min(380px,calc(100vw-40px))]"
            role="dialog"
            aria-label="Guided demo"
          >
            <div className="tour-bar h-[3px] rounded-[2px] bg-surface-3 overflow-hidden mb-3">
              <i
                className="block h-full bg-primary transition-all duration-400 ease-out"
                style={{
                  width: `${((tourStep + 1) / TOUR_STEPS.length) * 100}%`,
                }}
              />
            </div>
            <span className="tiny mono text-ink-3">
              Step {tourStep + 1} of {TOUR_STEPS.length}
            </span>
            <h3 className="font-display text-[18px] font-semibold text-ink my-1">
              {TOUR_STEPS[tourStep].title}
            </h3>
            <p className="text-[14px] text-ink-2 leading-relaxed">
              {TOUR_STEPS[tourStep].desc}
            </p>
            <div className="flex gap-2 justify-end mt-4">
              <button
                type="button"
                onClick={() => setTourOpen(false)}
                className="btn btn-ghost sm"
              >
                Exit
              </button>
              <button
                type="button"
                disabled={tourStep === 0}
                onClick={() => setTourStep((s) => Math.max(0, s - 1))}
                className="btn btn-ghost sm disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (tourStep === TOUR_STEPS.length - 1) {
                    setTourOpen(false);
                  } else {
                    setTourStep((s) => s + 1);
                  }
                }}
                className="btn btn-primary sm"
              >
                {tourStep === TOUR_STEPS.length - 1 ? "Done" : "Next"}
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
