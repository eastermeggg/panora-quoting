"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Building2,
  Users,
  Globe,
  MessageCircle,
  ChevronDown,
  PanelLeftClose,
  Palette,
  Plug,
  Network,
  Database,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { currentUser } from "@/data/mock";

type SettingsNavItem = { label: string; href: string; icon: LucideIcon };

/* Two sections, matching the app's sectioned nav:
 *   • Organisation — shared, admin-configured (workspace, team, insurer
 *     connections, integrations, souscription rules, cabinet presentation).
 *   • Utilisateur  — personal account settings. */
const ORG_NAV: SettingsNavItem[] = [
  { label: "Espace de travail", href: "/settings/workspace", icon: Building2 },
  { label: "Collaborateurs", href: "/settings/collaborators", icon: Users },
  { label: "Présentation", href: "/settings/presentation", icon: Palette },
  { label: "Accès extranets", href: "/settings/extranets", icon: Globe },
  { label: "EDI", href: "/settings/edi", icon: Network },
  { label: "Intégrations", href: "/settings/integrations", icon: Plug },
  { label: "Vault souscription", href: "/settings/vault", icon: Database },
];

const USER_NAV: SettingsNavItem[] = [
  { label: "Votre compte", href: "/settings/account", icon: User },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[256px] shrink-0 h-screen sticky top-0 bg-panora-sidebar border-r border-panora-border pt-2 pl-3 pr-2.5 pb-3 gap-[13px]">
      {/* Top section: Logo + User */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between pr-2 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/panora-wordmark.svg"
            alt="Panora"
            className="h-[22px] w-auto"
          />
          <PanelLeftClose className="w-4 h-4 text-panora-text-muted cursor-pointer hover:text-panora-text transition-colors" />
        </div>

        <div className="bg-panora-secondary rounded-[7px] px-2 py-1 flex items-center gap-3">
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
          <ChevronDown className="w-3.5 h-3.5 text-panora-text-secondary shrink-0" />
        </div>
      </div>

      {/* Nav section */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* Back link — always lands on the cockpit. The cockpit itself
            decides whether to show the "Voir mes cotations" shortcut. */}
        <Link
          href="/quoting"
          className="flex items-center gap-2 h-8 px-2 py-1.5 rounded-md hover:bg-panora-border/30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-panora-text-secondary shrink-0" />
          <span className="text-[13px] font-medium text-panora-text-secondary leading-5">
            Retour
          </span>
        </Link>

        <SettingsNavSection label="Organisation" items={ORG_NAV} pathname={pathname} />
        <SettingsNavSection label="Utilisateur" items={USER_NAV} pathname={pathname} />
      </div>

      {/* Footer */}
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

function SettingsNavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: SettingsNavItem[];
  pathname: string;
}) {
  return (
    <nav className="flex flex-col gap-px">
      <div className="px-2 py-1">
        <span className="text-[12px] font-medium text-panora-text-muted leading-4">
          {label}
        </span>
      </div>
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 h-8 px-2 py-1.5 rounded-md transition-colors",
              isActive
                ? "bg-[#173c2d] shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
                : "hover:bg-panora-border/30"
            )}
          >
            <item.icon
              className={cn(
                "w-4 h-4 shrink-0",
                isActive ? "text-white" : "text-panora-text-secondary"
              )}
            />
            <span
              className={cn(
                "text-[13px] font-medium leading-5",
                isActive ? "text-white" : "text-panora-text-secondary"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
