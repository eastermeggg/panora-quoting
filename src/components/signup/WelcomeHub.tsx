"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Users,
  Play,
  CalendarDays,
  Mail,
  GraduationCap,
  HelpCircle,
  MonitorPlay,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useOnboardingTasks,
  useOnboardingProgress,
  completeOnboardingTask,
  configureOnboarding,
  type OnboardingTask,
} from "@/data/onboarding-store";
import { applyProtoScenario } from "@/data/proto-scenario";
import { HomeScreen } from "@/components/home/HomeScreen";

/* Real faces make the onboarding feel human — a named founder and a care team
 * the broker can picture, not a faceless SaaS. */
const DIANE_AVATAR =
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=facearea&facepad=2.6&w=160&h=160&q=80";
const DIANE_POSTER =
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=720&h=420&q=80";
const CARE_TEAM = [
  DIANE_AVATAR,
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2.6&w=160&h=160&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2.6&w=160&h=160&q=80",
];

/* Prise en main (onboarding welcome) — built to Figma 9890-1787.
 *   Title → checklist card (inline progress) + right rail (founder video + care)
 *   → resources cards. Role-aware and quoting-gated via the shared store; the
 *   sidebar "Prise en main" widget stays in sync. */
export function WelcomeHub() {
  const searchParams = useSearchParams();
  const prenom = searchParams.get("prenom")?.trim();
  const role = searchParams.get("collab") === "1" ? "member" : "admin";
  const quotingAvailable = searchParams.get("quoting") !== "0";
  useEffect(() => {
    configureOnboarding({ role, quotingAvailable });
  }, [role, quotingAvailable]);

  // Proto preview: reflect the whole scenario (settings, extranets, products,
  // lists + checklist), so a direct ?state= load is coherent, not just the UI.
  const stateParam = searchParams.get("state");
  useEffect(() => {
    if (stateParam === "done" || stateParam === "home") {
      applyProtoScenario("setup");
    } else if (stateParam === "progress") {
      applyProtoScenario("fresh");
    }
  }, [stateParam]);

  const tasks = useOnboardingTasks();
  const { percent, done, total } = useOnboardingProgress();

  // Post-onboarding home (activity-oriented) — previewable via ?state=home.
  if (stateParam === "home") return <HomeScreen prenom={prenom} />;

  // The first two incomplete tasks get CTAs (primary "Démarrer", then an arrow);
  // the rest wait their turn — mirrors the Figma checklist exactly.
  const incomplete = tasks.filter((t) => !t.done).map((t) => t.id);
  const nextId = incomplete[0];
  const secondId = incomplete[1];

  // Quoting tools surface once the quoting agent is set up (?setup=done to demo).
  const setupDone =
    !!tasks.find((t) => t.id === "setup_cotation")?.done ||
    searchParams.get("setup") === "done";
  const quotingReady = quotingAvailable && setupDone;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1024px] flex-col gap-8 px-6 py-14 lg:px-10">
        {/* Title */}
        <h1 className="font-serif text-[30px] leading-9 tracking-[-0.6px] text-[#162416]">
          {prenom ? `Bienvenue ${prenom}` : "Bienvenue"}, ravis de vous compter
          parmi nous
        </h1>

        {/* Two-column area: checklist (≈66%) + human right rail (≈32%) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[675fr_325fr] lg:items-start">
          {/* Left: the checklist card with an inline progress bar in its header */}
          <div className="overflow-hidden rounded-[12px] border border-panora-border bg-white shadow-[1px_4px_10px_0px_rgba(0,0,0,0.03)]">
            <div className="relative flex items-center gap-2 border-b border-panora-border px-5 py-[17px]">
              <h3 className="text-[15px] font-semibold leading-5 text-panora-text">
                Accomplissez vos tâches de prise en main
              </h3>
              <span className="h-1 w-1 shrink-0 rounded-full bg-panora-text-muted" />
              <span className="text-[13px] leading-5 text-panora-text-secondary">
                <span className="font-medium text-panora-text">
                  {done}/{total}
                </span>{" "}
                complétées
              </span>
              {/* Progress bar hugging the header's bottom edge */}
              <span className="absolute inset-x-0 bottom-[-1px] h-[3px] bg-panora-border" />
              <span
                className="absolute bottom-[-1px] left-0 h-[3px] rounded-r-full bg-panora-green transition-[width] duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
            <ul>
              {tasks.map((task) => (
                <ChecklistRow
                  key={task.id}
                  task={task}
                  cta={
                    task.id === nextId
                      ? "primary"
                      : task.id === secondId
                        ? "arrow"
                        : "none"
                  }
                />
              ))}
              {/* Inviting colleagues is optional — shown as the last row but not
                  counted toward progress. */}
              <InviteRow />
            </ul>
          </div>

          {/* Right rail: the human touch */}
          <div className="flex flex-col gap-6">
            <FounderVideoCard />
            <CareCard />
          </div>
        </div>

        {/* Quoting tools — appear once the quoting agent is set up (off in the
            in-progress state this screen designs for). */}
        {quotingReady && (
          <div>
            <h2 className="mb-3 text-[15px] font-semibold text-panora-text">
              Vos outils de cotation
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <QuoteRecorderWidget />
              <MatriceWidget />
            </div>
          </div>
        )}

        {/* Resources */}
        <section className="flex flex-col gap-4">
          <h2 className="px-0.5 text-[15px] font-semibold text-panora-text">
            Des ressources pour vous accompagner
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {RESOURCES.map((r) => (
              <ResourceCard key={r.title} {...r} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* A single checklist row — plain-circle indicator (green check when done),
 * semibold title + muted subtitle, and a position-dependent CTA. */
function ChecklistRow({
  task,
  cta,
}: {
  task: OnboardingTask;
  cta: "primary" | "arrow" | "none";
}) {
  return (
    <li className="flex items-center gap-4 border-b border-panora-border px-5 py-[14px]">
      {/* Indicator */}
      {task.done ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[0.9px] border-[rgba(34,32,26,0.15)] bg-panora-green text-white shadow-[0px_1.8px_0.9px_rgba(0,0,0,0.1)]">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      ) : (
        <span className="h-8 w-8 shrink-0 rounded-full border-[1.5px] border-panora-border bg-white" />
      )}

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] leading-5",
            task.done
              ? "font-medium text-panora-text-muted line-through"
              : "font-semibold text-[#162416]"
          )}
        >
          {task.label}
        </p>
        {!task.done && (
          <p className="text-[13px] leading-5 text-panora-text-secondary">
            {task.description}
          </p>
        )}
      </div>

      {cta === "primary" && (
        <Link
          href={task.href}
          onClick={() => completeOnboardingTask(task.id)}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-[#173c2d] px-3 py-1.5 text-[13px] font-medium text-white shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#10301f]"
        >
          Démarrer
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
      {cta === "arrow" && (
        <Link
          href={task.href}
          onClick={() => completeOnboardingTask(task.id)}
          aria-label={task.label}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-panora-border bg-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-panora-drop"
        >
          <ArrowRight className="h-4 w-4 text-panora-text-secondary" />
        </Link>
      )}
    </li>
  );
}

/* Invite colleagues — optional, so it sits at the bottom of the list with a soft
 * brand-green pill and doesn't count toward progress. */
function InviteRow() {
  return (
    <li className="flex items-center gap-4 px-5 py-[14px]">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panora-green-light text-panora-green-dark">
        <Users className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold leading-5 text-[#162416]">
          Invitez vos collègues
        </p>
        <p className="text-[13px] leading-5 text-panora-text-secondary">
          Ajoutez votre équipe à votre espace, quand vous voulez.
        </p>
      </div>
      <Link
        href="/settings/workspace"
        className="shrink-0 rounded-lg bg-panora-green-light px-3 py-1.5 text-[13px] font-medium text-[#00784f] transition-colors hover:bg-panora-green/15"
      >
        Inviter +
      </Link>
    </li>
  );
}

/* Founder video — a personal welcome from Diane. Poster + play button, with a
 * deep-green footer bar identifying the founder. */
function FounderVideoCard() {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[rgba(34,32,26,0.1)] bg-white shadow-[0px_5px_5px_rgba(0,0,0,0.08),0px_18px_9px_rgba(0,0,0,0.03)]">
      <button
        type="button"
        className="group relative block h-[182px] w-full overflow-hidden bg-[#f3f3ee] text-left"
        aria-label="Lire le message de Diane, fondatrice de Panora"
      >
        <img
          src={DIANE_POSTER}
          alt="Diane, fondatrice de Panora"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[rgba(22,36,22,0.3)]" />
        <span className="absolute left-1/2 top-1/2 flex h-[52px] w-[52px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm transition-colors group-hover:bg-white/35">
          <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
        </span>
      </button>
      <div className="flex items-center gap-3 bg-[#162416] px-[15px] py-3">
        <img
          src={DIANE_AVATAR}
          alt=""
          className="h-9 w-9 rounded-full object-cover"
        />
        <div>
          <p className="text-[13px] font-medium leading-5 text-white">
            Un message de la fondatrice
          </p>
          <p className="text-[12px] leading-4 text-white/80">
            Diane · Fondatrice de Panora
          </p>
        </div>
      </div>
    </div>
  );
}

/* Care card — a visible, human accompaniment. Real faces + a concrete offer to
 * talk to someone, on a warm base with a soft green wash. */
function CareCard() {
  return (
    <div
      className="rounded-[12px] border border-[rgba(34,32,26,0.1)] p-5 shadow-[1px_4px_10px_0px_rgba(0,0,0,0.03)]"
      style={{
        backgroundImage:
          "radial-gradient(120% 140% at 92% 4%, rgba(0,162,114,0.12) 0%, rgba(0,162,114,0) 55%), linear-gradient(#faf8f5,#faf8f5)",
      }}
    >
      <div className="flex">
        {CARE_TEAM.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className={cn(
              "h-9 w-9 rounded-full border-[1.125px] border-panora-bg object-cover",
              i > 0 && "-ml-2.5"
            )}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <p className="text-[13px] font-medium leading-5 text-black">
          L&apos;équipe Panora, à votre disposition
        </p>
        <p className="text-[13px] font-medium leading-5 text-panora-text-secondary">
          Une question ? On répond vite et vous accompagne sur vos premières
          semaines.
        </p>
      </div>
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-[#173c2d] px-3 py-1.5 text-[13px] font-medium text-white shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#10301f]"
        >
          <CalendarDays className="h-4 w-4" />
          Prendre 15 min
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-panora-border bg-white px-3 py-1.5 text-[13px] font-medium text-panora-text-secondary shadow-[0px_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-panora-drop"
        >
          <Mail className="h-4 w-4" />
          Écrire
        </button>
      </div>
    </div>
  );
}

/* Resources — two-column cards: badge + serif title + description + brand-green
 * link on the left, a 3D illustration on the right, over a warm base with a
 * faint aurora at the bottom edge. */
type Resource = {
  badge: string;
  badgeIcon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: string;
};

const RESOURCES: Resource[] = [
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
  {
    badge: "Cotation",
    badgeIcon: CalendarDays,
    title: "Calendrier de sortie cotation",
    description:
      "Les produits et assureurs déjà cotables, et ceux qui arrivent bientôt.",
    cta: "Consulter",
    href: "/matrice-couverture",
    icon: "/onboarding/icons/cloche.png",
  },
];

function ResourceCard({
  badge,
  badgeIcon: BadgeIcon,
  title,
  description,
  cta,
  href,
  icon,
}: Resource) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[151px] items-start gap-7 overflow-hidden rounded-[12px] border border-[rgba(34,32,26,0.1)] p-5 shadow-[1px_4px_10px_0px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_12px_28px_-10px_rgba(23,60,45,0.22)]"
    >
      {/* Warm base + faint aurora bleeding in from the bottom-right */}
      <span aria-hidden className="absolute inset-0 bg-[#f3f3ee]" />
      <img
        aria-hidden
        src="/onboarding/empty-state-landscape.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(167deg, #f3f3ee 54%, rgba(243,243,238,0) 98%)",
        }}
      />

      <div className="relative flex flex-1 flex-col gap-[21px] self-stretch">
        <div className="flex flex-col gap-2.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-panora-border bg-white px-2 py-1 text-[12px] font-medium text-panora-text-secondary">
            <BadgeIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {badge}
          </span>
          <div className="flex flex-col gap-2">
            <p className="font-serif text-[24px] leading-7 tracking-[-0.5px] text-panora-text">
              {title}
            </p>
            <p className="text-[13px] leading-5 text-panora-text-secondary">
              {description}
            </p>
          </div>
        </div>
        <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-panora-green">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>

      <img
        src={icon}
        alt=""
        className="relative h-[124px] w-[124px] shrink-0 object-contain drop-shadow-[2px_5px_11px_rgba(0,0,0,0.07)] transition-transform duration-300 group-hover:scale-[1.05] group-hover:rotate-2"
      />
    </Link>
  );
}

/* Quote recorder — a CONTRIBUTION, not a task. */
function QuoteRecorderWidget() {
  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-panora-border bg-white p-5 shadow-[1px_4px_10px_0px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#f1e6fb] text-[#6d28a8]">
          <MonitorPlay className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6d28a8]">
            Contribuer
          </p>
          <p className="text-[14px] font-medium text-panora-text">
            Enregistreur de cotation
          </p>
        </div>
      </div>
      <p className="text-[12px] leading-[18px] text-panora-text-secondary">
        Un assureur ou un extranet pas encore automatisé ? Enregistrez votre
        session de cotation à l&apos;écran : notre équipe s&apos;en sert pour
        l&apos;encoder et le rendre automatique — pour vous et tout votre
        cabinet.
      </p>
      <div className="mt-auto flex items-center gap-3 pt-1">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-[#173c2d] px-3.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#10301f]"
        >
          <MonitorPlay className="h-3.5 w-3.5" />
          Enregistrer une session
        </button>
        <a
          href="#"
          className="text-[13px] font-medium text-panora-text-secondary transition-colors hover:text-panora-text"
        >
          En savoir plus
        </a>
      </div>
    </div>
  );
}

/* Matrice — the products/insurers already available for automatic quoting. */
function MatriceWidget() {
  return (
    <Link
      href="/matrice-couverture"
      className="group flex flex-col gap-3 rounded-[12px] border border-panora-border bg-white p-5 shadow-[1px_4px_10px_0px_rgba(0,0,0,0.03)] transition-colors hover:bg-panora-drop/40"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-panora-green-light text-panora-green-dark">
          <LayoutGrid className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-panora-green-dark">
            Référence
          </p>
          <p className="text-[14px] font-medium text-panora-text">
            Matrice des produits cotables
          </p>
        </div>
      </div>
      <p className="text-[12px] leading-[18px] text-panora-text-secondary">
        Consultez les produits et les assureurs déjà disponibles à la cotation
        automatique, et repérez ce qui est en cours d&apos;ajout.
      </p>
      <span className="mt-auto flex items-center gap-1.5 pt-1 text-[13px] font-medium text-panora-green-dark">
        Voir la matrice
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
