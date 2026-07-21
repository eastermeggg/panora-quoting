"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  HelpCircle,
  Calendar,
  MonitorPlay,
  Mail,
  Megaphone,
  UserPlus,
  Columns3,
  ScanSearch,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { latestChangelog, type ChangelogTag } from "@/data/changelog";
import { ChangelogModal } from "@/components/home/ChangelogModal";

/* Post-onboarding home — branded and affordant, after the Figma reference:
 * serif greeting with the first name in italic green, three large action
 * cards with 3D icons + aurora gradient washes + a hover arrow, then rich
 * resource cards (badge pill, serif title, big 3D icon). Activity first,
 * no stats, org-wide implicit. */

type ActionItem = {
  label: string;
  href: string;
  icon: string;
  /** Diagonal gradient wash, saturated toward the bottom-right. */
  wash: string;
};

const ACTIONS: ActionItem[] = [
  {
    label: "Analyser un contrat",
    href: "/quoting/comparison?new=analyse",
    icon: "/onboarding/icons/loupe.png",
    wash: "linear-gradient(118deg, #fbf9f4 52%, #eceff8 70%, #96b6f1 88%, #3f6fe4 100%)",
  },
  {
    label: "Comparer des devis",
    href: "/quoting/comparison?new=compare",
    icon: "/onboarding/icons/tampon.png",
    wash: "linear-gradient(118deg, #fbf9f4 52%, #eceff8 70%, #96b6f1 88%, #3f6fe4 100%)",
  },
  {
    label: "Lancer une cotation",
    href: "/quoting/dashboard",
    icon: "/onboarding/icons/courrier.png",
    wash: "linear-gradient(118deg, #fbf9f4 52%, #edf2e2 70%, #a9d8a8 88%, #15996b 100%)",
  },
];

type HeroResource = {
  badge: string;
  badgeIcon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: string;
};

const HERO_RESOURCES: HeroResource[] = [
  {
    badge: "Se former",
    badgeIcon: GraduationCap,
    title: "Panora Learning Academy",
    description:
      "Des formations courtes au format vidéo pour maîtriser l'univers Panora.",
    cta: "Découvrir",
    href: "#",
    icon: "/onboarding/icons/diplome.png",
  },
  {
    badge: "Besoin d'aide ?",
    badgeIcon: HelpCircle,
    title: "Notre F.A.Q",
    description:
      "Consultez la FAQ si vous avez la moindre question sur l'utilisation de Panora.",
    cta: "Consulter",
    href: "#",
    icon: "/onboarding/icons/livre.png",
  },
];

const QUIET_RESOURCES: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Calendar, label: "Calendrier de release cotation", href: "/matrice-couverture" },
  { icon: MonitorPlay, label: "Enregistrer une session", href: "#" },
  { icon: Mail, label: "Nous écrire", href: "#" },
];

export function HomeScreen({ prenom }: { prenom?: string }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-9 px-8 py-14">
        {/* Greeting */}
        <h2 className="font-serif text-[30px] leading-9 tracking-[-0.3px] text-panora-text">
          Bonjour{" "}
          <span className="italic text-panora-green">{prenom ?? "vous"}</span>,
          que souhaitez vous faire aujourd&apos;hui&nbsp;?
        </h2>

        {/* Action cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="group relative flex h-[132px] flex-col justify-between overflow-hidden rounded-[14px] border border-black/10 p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_10px_28px_-8px_rgba(23,60,45,0.28)]"
              style={{ background: a.wash }}
            >
              <img
                src={a.icon}
                alt=""
                className="h-11 w-11 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-[1.06]"
              />
              <span className="font-serif text-[19px] leading-6 tracking-[-0.2px] text-panora-text">
                {a.label}
              </span>
              {/* Hover affordance — dark round arrow, like the reference */}
              <span className="absolute bottom-3.5 right-3.5 flex h-8 w-8 translate-y-1 items-center justify-center rounded-full bg-[#173c2d] opacity-0 shadow-[0px_2px_6px_rgba(0,0,0,0.25)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowRight className="h-4 w-4 text-white" />
              </span>
            </Link>
          ))}
        </div>

        {/* Resources */}
        <section>
          <h3 className="text-[14px] font-semibold text-panora-text">
            Des ressources pour vous accompagner
          </h3>
          <div className="mt-3.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {HERO_RESOURCES.map((r) => {
              const BadgeIcon = r.badgeIcon;
              return (
                <Link
                  key={r.title}
                  href={r.href}
                  className="group flex items-center gap-5 rounded-[14px] border border-panora-border bg-white p-6 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_10px_28px_-10px_rgba(23,60,45,0.2)]"
                >
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-panora-border bg-white px-2.5 py-1 text-[12px] font-medium text-panora-text-secondary">
                      <BadgeIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {r.badge}
                    </span>
                    <p className="mt-2.5 font-serif text-[21px] leading-7 tracking-[-0.2px] text-panora-text">
                      {r.title}
                    </p>
                    <p className="mt-1 text-[13px] leading-5 text-panora-text-secondary">
                      {r.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-panora-green">
                      {r.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                  <img
                    src={r.icon}
                    alt=""
                    className="h-[104px] w-[104px] shrink-0 object-contain transition-transform duration-300 group-hover:scale-[1.05] group-hover:rotate-2"
                  />
                </Link>
              );
            })}
          </div>

          {/* Quiet third row — same language, lower volume */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {QUIET_RESOURCES.map((r) => {
              const Icon = r.icon;
              return (
                <Link
                  key={r.label}
                  href={r.href}
                  className="group flex items-center gap-3 rounded-[12px] border border-panora-border bg-white px-4 py-3.5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors hover:bg-panora-drop/50"
                >
                  <Icon
                    className="h-[18px] w-[18px] shrink-0 text-panora-text-secondary"
                    strokeWidth={1.75}
                  />
                  <span className="flex-1 text-[13px] font-medium leading-5 text-panora-text">
                    {r.label}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-panora-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Changelog widget */}
        <ChangelogWidget />

        {/* Recent activity */}
        <RecentActivity />
      </div>
    </div>
  );
}

/* Recent activity — a quiet, org-wide feed of what's happening in the espace
 * (Figma 9895-24767). Read-only glances, no stats. */
type Activity = {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  time: string;
  href: string;
};

const RECENT: Activity[] = [
  {
    id: "a1",
    icon: UserPlus,
    title: "Création client",
    detail: "Louis Sanz France · Projet assurance RC Pro",
    time: "il y a 12 min",
    href: "/quoting/comparison",
  },
  {
    id: "a2",
    icon: Send,
    title: "Cotation lancée",
    detail: "Marble Tech · AXA, Generali, Allianz",
    time: "il y a 1 h",
    href: "/quoting/dashboard",
  },
  {
    id: "a3",
    icon: Columns3,
    title: "Comparaison terminée",
    detail: "GreenWay · 3 devis comparés",
    time: "il y a 3 h",
    href: "/quoting/comparison",
  },
  {
    id: "a4",
    icon: ScanSearch,
    title: "Analyse de contrat",
    detail: "Digital Solutions · Multirisque professionnelle",
    time: "hier",
    href: "/quoting/comparison",
  },
];

function RecentActivity() {
  return (
    <section>
      <h3 className="mb-3.5 text-[14px] font-semibold text-panora-text">
        Activité récente
      </h3>
      <ul className="overflow-hidden rounded-[14px] border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
        {RECENT.map((a, i) => {
          const Icon = a.icon;
          return (
            <li key={a.id}>
              <Link
                href={a.href}
                className={cn(
                  "group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-panora-drop/50",
                  i > 0 && "border-t border-panora-border/70"
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-panora-tag text-panora-text-secondary">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium leading-5 text-panora-text">
                    {a.title}
                  </p>
                  <p className="truncate text-[12px] leading-4 text-panora-text-secondary">
                    {a.detail}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] tabular-nums text-panora-text-muted">
                  {a.time}
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-panora-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const TAG_STYLE: Record<ChangelogTag, string> = {
  Nouveau: "bg-panora-green-light text-panora-green-dark",
  Amélioration: "bg-[#f1e6fb] text-[#6d28a8]",
  Correctif: "bg-panora-tag text-panora-text-secondary",
};

function ChangelogWidget() {
  const [open, setOpen] = useState(false);
  const entries = latestChangelog(3);

  return (
    <section>
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-[14px] font-semibold text-panora-text">
          <Megaphone className="h-4 w-4 text-panora-green-dark" />
          Quoi de neuf
        </h3>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-[13px] font-medium text-panora-green hover:text-panora-green-dark transition-colors"
        >
          Voir tout
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {entries.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setOpen(true)}
            className="group flex flex-col items-start rounded-[12px] border border-panora-border bg-white p-4 text-left shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors hover:bg-panora-drop/40"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  TAG_STYLE[e.tag]
                )}
              >
                {e.tag}
              </span>
              <span className="text-[12px] text-panora-text-muted">{e.date}</span>
            </div>
            <p className="mt-2 text-[14px] font-medium leading-5 text-panora-text">
              {e.title}
            </p>
            <p className="mt-1 line-clamp-2 text-[12px] leading-4 text-panora-text-secondary">
              {e.description}
            </p>
          </button>
        ))}
      </div>

      {open && <ChangelogModal onClose={() => setOpen(false)} />}
    </section>
  );
}
