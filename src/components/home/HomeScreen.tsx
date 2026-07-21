"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  HelpCircle,
  Megaphone,
  PenLine,
  CircleDot,
  CalendarDays,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChangelogModal } from "@/components/home/ChangelogModal";

/* Post-onboarding Home — built to Figma 9895-24767.
 *   greeting → 3 action cards → "À découvrir / ressources" (a featured what's-new
 *   card + Recorder/Calendrier cards + a resource grid) → "Activité récente".
 * Warm cards with a faint aurora, serif section titles, org-wide implicit. */

/* Warm base + faint aurora bleeding from the bottom-right — the shared card
 * texture used by the action + resource cards. */
function AuroraBg({ radius = "10px" }: { radius?: string }) {
  return (
    <>
      <span
        aria-hidden
        className="absolute inset-0 bg-[#f3f3ee]"
        style={{ borderRadius: radius }}
      />
      <img
        aria-hidden
        src="/onboarding/empty-state-landscape.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        style={{ borderRadius: radius }}
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          borderRadius: radius,
          backgroundImage:
            "linear-gradient(166deg, #faf6f1 60%, rgba(243,243,238,0) 99%)",
        }}
      />
    </>
  );
}

// ── Action cards ──

type Action = { label: string; href: string; icon: string };
const ACTIONS: Action[] = [
  {
    label: "Analyser un contrat",
    href: "/quoting/comparison?new=analyse",
    icon: "/onboarding/icons/loupe.png",
  },
  {
    label: "Comparer des devis",
    href: "/quoting/comparison?new=compare",
    icon: "/onboarding/icons/tampon.png",
  },
  {
    label: "Lancer une cotation",
    href: "/quoting/dashboard",
    icon: "/onboarding/icons/courrier.png",
  },
];

function ActionCard({ label, href, icon }: Action) {
  return (
    <Link
      href={href}
      className="group relative flex flex-1 flex-col gap-3.5 overflow-hidden rounded-[10px] border border-[rgba(34,32,26,0.1)] px-5 pb-[18px] pt-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_10px_24px_-10px_rgba(23,60,45,0.22)]"
    >
      <AuroraBg />
      <img src={icon} alt="" className="relative h-12 w-12 object-contain" />
      <div className="relative flex items-center justify-between gap-2">
        <p className="font-display text-[15px] font-semibold leading-tight text-[#162416]">
          {label}
        </p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#162416] transition-colors group-hover:bg-[#162416] group-hover:text-white">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

// ── Home ──

export function HomeScreen({ prenom }: { prenom?: string }) {
  const [changelogOpen, setChangelogOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1024px] flex-col gap-8 px-6 py-14 lg:px-10">
        {/* Greeting */}
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[30px] leading-9 tracking-[-0.6px] text-[#162416]">
            Bonjour{" "}
            <span className="italic text-panora-green">{prenom ?? "vous"}</span>,
            que souhaitez-vous faire aujourd&apos;hui&nbsp;?
          </h1>
          <p className="text-[13px] leading-5 text-panora-text-secondary">
            Accédez rapidement à vos outils et suivez votre activité.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {ACTIONS.map((a) => (
            <ActionCard key={a.label} {...a} />
          ))}
        </div>

        <div className="h-px w-full bg-panora-border" />

        {/* À découvrir / ressources */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-[20px] leading-6 tracking-[-0.4px] text-[#162416]">
              À découvrir / ressources
            </h2>
            <p className="text-[13px] leading-5 text-panora-text-secondary">
              Découvrez nos dernières fonctionnalités pour optimiser vos flux.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Featured "Nouveau" card */}
            <button
              type="button"
              onClick={() => setChangelogOpen(true)}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-[12px] border border-[rgba(34,32,26,0.1)] p-6 text-left shadow-[1px_4px_5px_0px_rgba(0,0,0,0.03)] lg:col-span-4"
              style={{
                backgroundImage:
                  "radial-gradient(120% 92% at 100% 0%, rgba(0,162,114,0.20) 0%, rgba(0,162,114,0) 55%), linear-gradient(#ffffff,#ffffff)",
              }}
            >
              <span className="w-fit rounded-full bg-[#162416] px-3 py-1 text-[12px] font-medium leading-4 text-white">
                Nouveau
              </span>
              <p className="font-display text-[15px] font-semibold leading-5 text-[#162416]">
                Nouvelles fonctionnalités comparaison &amp; agent de tarification
              </p>
              <div className="flex-1 text-[13px] leading-5 text-panora-text-secondary">
                <p className="mb-2.5">
                  Panora continue d&apos;évoluer : agents de tarification,
                  comparaison avancée et une expérience premium.
                </p>
                <p>
                  Suivez l&apos;avancement de vos demandes de cotation en temps
                  réel, sur une interface simplifiée à 3 statuts clairs.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-green">
                Tout lire
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </button>

            {/* Right cluster */}
            <div className="flex flex-col gap-6 lg:col-span-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <PromotedCard
                  icon={CircleDot}
                  title="Recorder cotation"
                  description="Aidez à enrichir l'offre Panora, et vous accédez à des lignes de cotation automatique plus vite."
                  cta="Enregistrer une session"
                  href="#"
                />
                <PromotedCard
                  icon={CalendarDays}
                  title="Calendrier cotation"
                  description="Planifiez vos rendez-vous et suivez l'avancement de vos dossiers en un seul endroit."
                  cta="Consulter"
                  href="/matrice-couverture"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ResourcePill icon={GraduationCap} label="Learning Academy" href="#" />
                <ResourcePill icon={HelpCircle} label="F.A.Q" href="#" />
                <ResourcePill
                  icon={Megaphone}
                  label="Notre changelog"
                  onClick={() => setChangelogOpen(true)}
                />
                <ResourcePill icon={PenLine} label="Nous écrire" href="#" />
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-panora-border" />

        {/* Activité récente */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-[20px] leading-6 tracking-[-0.4px] text-[#162416]">
              Activité récente
            </h2>
            <p className="text-[13px] leading-5 text-panora-text-secondary">
              Vos dernières actions et cotations.
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {RECENT.map((a) => (
              <li key={a.id}>
                <Link
                  href={a.href}
                  className="flex items-center gap-3 rounded-[10px] border border-panora-border bg-white px-4 py-3.5 transition-colors hover:bg-panora-drop/40"
                >
                  <FileText
                    className="h-5 w-5 shrink-0 text-panora-text-secondary"
                    strokeWidth={1.6}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-5 text-[#162416]">
                      {a.title}
                    </p>
                    <p className="truncate text-[12px] leading-4 text-panora-text-secondary">
                      {a.detail}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] tabular-nums text-panora-text-muted">
                    {a.time}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {changelogOpen && <ChangelogModal onClose={() => setChangelogOpen(false)} />}
    </div>
  );
}

/* Recorder / Calendrier — white promoted card: icon + title, description, and a
 * brand-green link. */
function PromotedCard({
  icon: Icon,
  title,
  description,
  cta,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-[12px] border border-panora-border bg-white p-6 shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-panora-drop/30"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#162416]" strokeWidth={1.75} />
        <p className="font-display text-[15px] font-semibold leading-5 text-[#162416]">
          {title}
        </p>
      </div>
      <p className="text-[13px] leading-5 text-panora-text-secondary">
        {description}
      </p>
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-panora-green">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/* Small resource pill — bordered row: icon + label. */
function ResourcePill({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "flex items-center gap-4 rounded-lg border border-[#d4d2ce] bg-white/40 p-4 text-left transition-colors hover:bg-white";
  const inner = (
    <>
      <Icon className="h-5 w-5 shrink-0 text-[#162416]" strokeWidth={1.6} />
      <span className="text-[13px] font-medium leading-5 text-[#162416]">
        {label}
      </span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className={cn(className, "w-full")}>
      {inner}
    </button>
  ) : (
    <Link href={href ?? "#"} className={className}>
      {inner}
    </Link>
  );
}

// ── Recent activity ──

type Activity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  href: string;
};

const RECENT: Activity[] = [
  {
    id: "a1",
    title: "Cotation créée",
    detail: "Projet « Assurance Pro » pour Axa France",
    time: "10:42",
    href: "/quoting/dashboard",
  },
  {
    id: "a2",
    title: "Document téléchargé",
    detail: "Conditions générales - Hiscox RC Pro",
    time: "Hier",
    href: "/quoting/comparison",
  },
  {
    id: "a3",
    title: "Comparaison lancée",
    detail: "3 devis comparés pour le client « Marble Tech »",
    time: "2 jours",
    href: "/quoting/comparison",
  },
];
