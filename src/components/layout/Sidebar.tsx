"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  CircleDot,
  Search,
  FileText,
  MessageCircle,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/data/mock";

const navItems = [
  {
    label: "Lancer une action",
    href: "#",
    icon: CircleDot,
    iconColor: "text-panora-green",
  },
  {
    label: "Assistant comparateur",
    href: "#",
    icon: Search,
  },
  {
    label: "Assistant cotation",
    href: "/quoting/dashboard",
    icon: FileText,
    active: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[260px] min-h-screen bg-panora-sidebar border-r border-panora-border">
      {/* Logo */}
      <div className="px-5 pt-5 pb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/panora-wordmark.svg"
          alt="Panora"
          className="h-6 w-auto"
        />
      </div>

      {/* User profile */}
      <div className="px-3 pb-4">
        <button className="flex items-center gap-2 w-full px-2 py-2 rounded-lg hover:bg-panora-border/50 transition-colors">
          <div className="w-7 h-7 rounded-full bg-panora-green/20 flex items-center justify-center text-panora-green text-xs font-semibold">
            {currentUser.avatar}
          </div>
          <div className="flex-1 text-left">
            <span className="text-sm font-medium text-panora-text">
              {currentUser.name}
            </span>
            <span className="text-panora-text-muted text-sm"> / {currentUser.cabinet}</span>
          </div>
          <ChevronDown className="w-4 h-4 text-panora-text-muted" />
        </button>
      </div>

      {/* Cockpit IA section */}
      <div className="px-3 flex-1">
        <p className="px-2 text-xs font-semibold text-panora-text-muted uppercase tracking-wider mb-2">
          Cockpit IA
        </p>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const matchPath = item.href === "/quoting/dashboard" ? "/quoting" : item.href;
            const isActive =
              matchPath !== "#" && pathname.startsWith(matchPath);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors group",
                  isActive
                    ? "bg-panora-card shadow-sm font-medium text-panora-text"
                    : "text-panora-text-secondary hover:bg-panora-border/50"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4",
                    item.iconColor || (isActive ? "text-panora-green" : "text-panora-text-muted")
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-panora-text-muted" />
                  </button>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-panora-border">
        <button className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-panora-text-secondary hover:bg-panora-border/50 transition-colors w-full">
          <MessageCircle className="w-4 h-4 text-panora-text-muted" />
          <span>Nous contacter / support</span>
        </button>
      </div>
    </aside>
  );
}
