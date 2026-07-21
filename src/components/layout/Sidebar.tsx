"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  MessageCircle,
  MessageSquare,
  ChevronDown,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  LogOut,
  Scan,
  ReceiptText,
  Stamp,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/data/mock";
import {
  useChatState,
  createConversation,
  setActiveConversation,
} from "@/data/chatStore";
import { PriseEnMainWidget } from "./PriseEnMainWidget";
import { SidebarChangelog } from "./SidebarChangelog";
import { ProtoStateSwitcher } from "@/components/signup/ProtoStateSwitcher";

const STORAGE_KEY = "panora-sidebar-collapsed";

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/quoting/comparison")
    return pathname.startsWith("/quoting/comparison");
  if (href === "/quoting")
    return (
      pathname.startsWith("/quoting") &&
      !pathname.startsWith("/quoting/comparison")
    );
  if (href.startsWith("/settings")) return pathname.startsWith("/settings");
  return pathname.startsWith(href);
}

type NavEntry = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

/* One nav row — active items get the deep-green fill (Figma 9919/4451). */
function SidebarNavItem({
  item,
  collapsed,
  active,
}: {
  item: NavEntry;
  collapsed: boolean;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center rounded-md transition-colors group",
        collapsed
          ? "justify-center py-0.5"
          : cn(
              "h-8 gap-2 px-2 py-1.5",
              active
                ? "bg-[#173c2d] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
                : "hover:bg-panora-border/30"
            )
      )}
    >
      {collapsed ? (
        <span
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-[8px] transition-all",
            active
              ? "bg-[#173c2d] text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
              : "text-panora-text-secondary hover:bg-panora-secondary hover:text-panora-text"
          )}
        >
          <item.icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </span>
      ) : (
        <>
          <item.icon
            className={cn(
              "w-4 h-4 shrink-0",
              active ? "text-white" : "text-panora-text-secondary"
            )}
          />
          <span
            className={cn(
              "text-[13px] font-medium leading-5 flex-1",
              active ? "text-white" : "text-panora-text-secondary"
            )}
          >
            {item.label}
          </span>
          {active && (
            <MoreVertical className="w-4 h-4 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </>
      )}
    </Link>
  );
}

// Top-level tabs (Figma 4451-34645): Accueil + Paramètres, then the
// "Assistants" section below a divider.
const topNavItems = [
  { label: "Accueil", href: "/bienvenue", icon: Home },
  { label: "Paramètres", href: "/settings/integrations", icon: Settings },
];

const navItems = [
  {
    label: "Assistant analyse",
    href: "/quoting/comparison",
    icon: Scan,
  },
  {
    label: "Assistant cotation",
    href: "/quoting",
    icon: ReceiptText,
  },
  {
    label: "Assistant souscription",
    href: "/souscription",
    icon: Stamp,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { conversations, activeId } = useChatState();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (collapsed) setDropdownOpen(false);
  }, [collapsed]);

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
    <aside
      suppressHydrationWarning
      className={cn(
        "flex flex-col shrink-0 h-screen sticky top-0 bg-panora-sidebar pt-2 pb-3 gap-[13px] transition-[width] duration-200 ease-out",
        collapsed ? "w-[64px] px-2" : "w-[256px] pl-3 pr-2.5"
      )}
    >
      {/* Top section: Logo + User */}
      <div className="flex flex-col gap-1">
        {/* Logo + Collapse toggle */}
        <div
          className={cn(
            "flex items-center py-2",
            collapsed ? "justify-center" : "justify-between pr-2"
          )}
        >
          {!collapsed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/logos/panora-wordmark.png"
              alt="Panora"
              className="h-[22px] w-auto"
            />
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center justify-center w-7 h-7 rounded-md text-panora-text-muted hover:text-panora-text hover:bg-panora-border/30 transition-colors"
            aria-label={collapsed ? "Étendre la barre latérale" : "Réduire la barre latérale"}
            title={collapsed ? "Étendre" : "Réduire"}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User profile pill with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              "rounded-[7px] flex items-center text-left cursor-pointer w-full transition-colors",
              collapsed
                ? "p-0 justify-center bg-transparent hover:bg-panora-border/30"
                : "px-2 py-1 gap-3 bg-panora-secondary hover:bg-panora-border/50"
            )}
            aria-label={collapsed ? `${currentUser.name} — ouvrir le menu` : undefined}
            title={collapsed ? `${currentUser.name} · ${currentUser.cabinet}` : undefined}
          >
            <div className="relative shrink-0">
              {currentUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-[6px] object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-[6px] bg-panora-green/20 flex items-center justify-center text-panora-green text-xs font-semibold overflow-hidden">
                  {currentUser.avatar}
                </div>
              )}
            </div>
            {!collapsed && (
              <>
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
              </>
            )}
          </button>

          {dropdownOpen && (
            <div
              className={cn(
                "absolute bg-white border border-panora-border rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)] z-50 py-1",
                collapsed
                  ? "left-full ml-2 top-0 w-[200px]"
                  : "top-full mt-1 left-0 w-full"
              )}
            >
              <Link
                href="/settings/integrations"
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
        {/* Prise en main (onboarding progress) — hides itself when complete */}
        <PriseEnMainWidget collapsed={collapsed} />

        {/* Top tabs: Accueil · Paramètres */}
        <nav className="flex flex-col gap-px">
          {topNavItems.map((item) => (
            <SidebarNavItem
              key={item.label}
              item={item}
              collapsed={collapsed}
              active={isItemActive(pathname, item.href)}
            />
          ))}
        </nav>

        {/* Assistants section, below a divider */}
        <nav className="flex flex-col gap-px">
          {collapsed ? (
            <div className="mx-auto mb-1 h-px w-8 bg-panora-border" />
          ) : (
            <>
              <div className="mx-1 mb-1.5 h-px bg-panora-border" />
              <div className="px-2 py-1">
                <span className="text-[12px] font-medium text-panora-text-muted leading-4">
                  Assistants
                </span>
              </div>
            </>
          )}
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.label}
              item={item}
              collapsed={collapsed}
              active={isItemActive(pathname, item.href)}
            />
          ))}
        </nav>

        {/* Chat conversations — the chat lives here (no separate nav item) */}
        {collapsed ? (
          <button
            onClick={() => {
              createConversation();
              router.push("/chat");
            }}
            title="Nouveau chat"
            aria-label="Nouveau chat"
            className="flex items-center justify-center py-0.5"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-[8px] text-panora-text-secondary hover:bg-panora-secondary hover:text-panora-text transition-colors">
              <Plus className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </span>
          </button>
        ) : (
          <div className="flex flex-col gap-px">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[12px] font-medium text-panora-text-secondary leading-4">
                Conversations
              </span>
              <button
                onClick={() => {
                  createConversation();
                  router.push("/chat");
                }}
                title="Nouveau chat"
                aria-label="Nouveau chat"
                className="flex items-center justify-center w-5 h-5 rounded text-panora-text-muted hover:text-panora-text hover:bg-panora-border/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {conversations.length === 0 ? (
              <span className="px-2 py-1 text-[12px] text-panora-text-muted">
                Aucune conversation
              </span>
            ) : (
              conversations.map((c) => {
                const active = pathname.startsWith("/chat") && c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveConversation(c.id);
                      router.push("/chat");
                    }}
                    className={cn(
                      "flex items-center gap-2 h-8 px-2 py-1.5 rounded-md text-left transition-colors",
                      active ? "bg-panora-secondary" : "hover:bg-panora-border/30"
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-panora-text-muted" />
                    <span
                      className={cn(
                        "text-[13px] leading-5 truncate flex-1",
                        active
                          ? "text-panora-text font-medium"
                          : "text-panora-text-secondary"
                      )}
                    >
                      {c.title}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer: Nouveautés + Aperçu proto (demo) + Nous contacter / support */}
      <div className="flex flex-col gap-2">
        <SidebarChangelog collapsed={collapsed} />
        <ProtoStateSwitcher collapsed={collapsed} />
        <button
          title={collapsed ? "Nous contacter / support" : undefined}
          aria-label={collapsed ? "Nous contacter / support" : undefined}
          className={cn(
            "flex items-center rounded-md w-full transition-colors",
            collapsed
              ? "justify-center py-0.5"
              : "h-8 gap-2 px-2 py-1.5 hover:bg-panora-border/30"
          )}
        >
          {collapsed ? (
            <span className="flex items-center justify-center w-9 h-9 rounded-[8px] text-panora-text-secondary hover:bg-panora-secondary hover:text-panora-text transition-colors">
              <MessageCircle className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </span>
          ) : (
            <>
              <MessageCircle className="w-4 h-4 text-panora-text-secondary shrink-0" />
              <span className="text-[13px] font-medium text-panora-text-secondary leading-5">
                Nous contacter / support
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
