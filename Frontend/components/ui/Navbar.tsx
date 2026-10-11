"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  GraduationCap,
  Building2,
  Layers,
  Bell,
  CheckCircle2,
  X,
  Play,
  Cpu,
  Shield,
  ChevronDown,
} from "lucide-react";
import { eventBus, BusEvent } from "@/lib/bus";

export function Navbar({ onStartGuidedDemo }: { onStartGuidedDemo?: () => void }) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<BusEvent[]>([]);
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(false);

  useEffect(() => {
    // Initial notifications load
    setNotifications(eventBus.getHistory());

    // Listen for live events across tabs
    const unsubscribe = eventBus.subscribe((evt) => {
      setNotifications((prev) => [evt, ...prev.slice(0, 19)]);
      setHasNewAlert(true);
    });

    return () => unsubscribe();
  }, []);

  const navItems = [
    {
      name: "Student Portal",
      href: "/student",
      icon: GraduationCap,
      accent: "text-emerald-400 border-emerald-400/40 bg-emerald-500/10",
      activeBg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    {
      name: "Recruiter Portal",
      href: "/recruiter",
      icon: Building2,
      accent: "text-indigo-400 border-indigo-400/40 bg-indigo-500/10",
      activeBg: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    },
    {
      name: "Placement Cell",
      href: "/cell",
      icon: Layers,
      accent: "text-amber-400 border-amber-400/40 bg-amber-500/10",
      activeBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    {
      name: "Judges' Corner",
      href: "/system",
      icon: Cpu,
      accent: "text-cyan-400 border-cyan-400/40 bg-cyan-500/10",
      activeBg: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#070A14]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                CampusLink
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 font-semibold uppercase">
                AI Powered
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                    isActive
                      ? item.activeBg
                      : "border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Guided Demo Button for Judges */}
          {onStartGuidedDemo && (
            <button
              onClick={onStartGuidedDemo}
              className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/15 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Guided Demo</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            </button>
          )}

          {/* System Health / Resilience Pill */}
          <div
            title="Proxy connects to Express (:5000) & FastAPI (:8000) with instant fixture recovery"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dual Proxy Live</span>
          </div>

          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowBellDropdown(!showBellDropdown);
                setHasNewAlert(false);
              }}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-white/5 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {hasNewAlert && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
              {notifications.length > 0 && !hasNewAlert && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </button>

            {/* Bell Dropdown */}
            {showBellDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel p-4 shadow-2xl z-50 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      Live Placement Feed
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                      Cross-Tab Sync
                    </span>
                  </div>
                  <button
                    onClick={() => setShowBellDropdown(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No events yet. Actions in the recruiter portal will trigger live alerts here!
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
