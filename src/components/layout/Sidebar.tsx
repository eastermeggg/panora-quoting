"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  PlayCircle,
  Search,
  MessageCircle,
  ChevronDown,
  MoreVertical,
  PanelLeftClose,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/data/mock";

const navItems = [
  {
    label: "Lancer une action",
    href: "#",
    icon: PlayCircle,
    iconColor: "text-panora-green-dark",
    textColor: "text-panora-green-dark",
    type: "action" as const,
  },
  {
    label: "Assistant comparateur",
    href: "/quoting/comparison",
    icon: Search,
    type: "item" as const,
  },
  {
    label: "Assistant cotation",
    href: "/quoting/dashboard",
    icon: null,
    type: "item" as const,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <aside className="flex flex-col w-[256px] shrink-0 h-screen sticky top-0 bg-panora-sidebar border-r border-panora-border pt-2 pl-3 pr-2.5 pb-3 gap-[13px]">
      {/* Top section: Logo + User */}
      <div className="flex flex-col gap-1">
        {/* Logo + Collapse */}
        <div className="flex items-center justify-between pr-2 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/panora-wordmark.svg"
            alt="Panora"
            className="h-[22px] w-auto"
          />
          <PanelLeftClose className="w-4 h-4 text-panora-text-muted cursor-pointer hover:text-panora-text transition-colors" />
        </div>

        {/* User profile pill with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-panora-secondary rounded-[7px] px-2 py-1 flex items-center gap-3 w-full text-left cursor-pointer"
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-[5.7px] bg-panora-green/20 flex items-center justify-center text-panora-green text-xs font-semibold overflow-hidden">
                {currentUser.avatar}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-panora-text leading-5 truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-panora-text-secondary leading-4 truncate">
                {currentUser.cabinet}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-panora-text-secondary shrink-0 transition-transform",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-panora-border rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] z-50 py-1">
              <Link
                href="/settings/extranets"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-panora-text-secondary hover:bg-panora-border/30 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Parametres
              </Link>
              <button className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-panora-text-secondary hover:bg-panora-border/30 transition-colors w-full text-left">
                <LogOut className="w-4 h-4" />
                Se deconnecter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nav section */}
      <div className="flex-1 flex flex-col gap-4">
        <nav className="flex flex-col gap-px">
          {/* Section label */}
          <div className="px-2 py-1">
            <span className="text-[12px] font-medium text-panora-text-secondary leading-4">
              Cockpit IA
            </span>
          </div>

          {/* Nav items */}
          {navItems.map((item) => {
            // Comparison agent matches /quoting/comparison specifically
            // Cotation agent matches /quoting but NOT /quoting/comparison
            const isActive = (() => {
              if (item.href === "#") return false;
              if (item.href === "/quoting/comparison") {
                return pathname.startsWith("/quoting/comparison");
              }
              if (item.href === "/quoting/dashboard") {
                return pathname.startsWith("/quoting") && !pathname.startsWith("/quoting/comparison");
              }
              return pathname.startsWith(item.href);
            })();

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 h-8 px-2 py-1.5 rounded-md transition-colors group",
                  isActive
                    ? "bg-panora-secondary"
                    : "hover:bg-panora-border/30"
                )}
              >
                {item.icon ? (
                  <item.icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      item.iconColor || "text-panora-text-secondary"
                    )}
                  />
                ) : (
                  <div className="w-4 h-4 shrink-0">
                    {/* Agents icon placeholder */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect width="16" height="16" rx="3" fill={isActive ? "#00a272" : "#85827b"} opacity={isActive ? 0.2 : 0.3} />
                      <circle cx="8" cy="6" r="2.5" fill={isActive ? "#00a272" : "#85827b"} opacity={isActive ? 0.6 : 0.4} />
                      <path d="M4 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke={isActive ? "#00a272" : "#85827b"} strokeWidth="1.5" opacity={isActive ? 0.6 : 0.4} fill="none" />
                    </svg>
                  </div>
                )}
                <span
                  className={cn(
                    "text-[13px] font-medium leading-5 flex-1",
                    item.textColor
                      ? item.textColor
                      : isActive
                      ? "text-panora-text"
                      : "text-panora-text-secondary"
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <MoreVertical className="w-4 h-4 text-panora-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: Nous contacter / support */}
      <div>
        <button className="flex items-center gap-2 h-8 px-2 py-1.5 rounded-md w-full hover:bg-panora-border/30 transition-colors">
          <MessageCircle className="w-4 h-4 text-panora-text-secondary shrink-0" />
          <span className="text-[13px] font-medium text-panora-text-secondary leading-5">
            Nous contacter / support
          </span>
        </button>
      </div>
    </aside>
  );
}
