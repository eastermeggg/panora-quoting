"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  GraduationCap,
  MessageCircleQuestion,
  CircleUserRound,
  FileText,
  FileUp,
  ScanSearch,
  Columns3,
  Send,
  UserPlus,
  Play,
  CalendarDays,
  Mail,
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
  type OnboardingTaskId,
} from "@/data/onboarding-store";
import { applyProtoScenario } from "@/data/proto-scenario";
import { ProgressRing } from "./ProgressRing";
import { FlowerOutline } from "./ui";
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

/* Per-task icon + CTA label for the checklist rows (progressive order). */
const TASK_META: Record<OnboardingTaskId, { icon: LucideIcon; cta: string }> = {
  inscription: { icon: CircleUserRound, cta: "" },
  test_analyse: { icon: ScanSearch, cta: "Analyser" },
  test_comparaison: { icon: Columns3, cta: "Comparer" },
  modele_devoir: { icon: FileUp, cta: "Uploader" },
  setup_cotation: { icon: FileText, cta: "Configurer" },
  launch_quote: { icon: Send, cta: "Lancer" },
};

/* Arrival hub after the global onboarding. Role-aware (admin vs member) and
 * Kiosk-inspired: header progress bar, one dominant CTA (the cotation setup —
 * user-level, shared by every user), a role-scoped checklist, and an Academy +
 * FAQ widget row. Kept in sync with the sidebar "Prise en main" widget. */
export function WelcomeHub() {
  const searchParams = useSearchParams();
  const prenom = searchParams.get("prenom")?.trim();
  // Role: collaborators arrive with ?collab=1 → member. Admins (workspace
  // creators) get the extra org-level "devoir de conseil" task.
  const role = searchParams.get("collab") === "1" ? "member" : "admin";
  // Quoting tasks (setup + first quote) only show if the workspace has the
  // quoting agent. Simulate "no quoting" with ?quoting=0.
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
  const { percent, done, total, complete } = useOnboardingProgress();

  // The "next" task to do — its CTA is primary; the rest reveal on hover.
  const nextId = tasks.find((t) => !t.done)?.id;

  // Post-onboarding home (activity-oriented) — previewable via ?state=home.
  if (stateParam === "home") return <HomeScreen prenom={prenom} />;

  // Quoting tools surface once the quoting agent is set up (?setup=done to demo).
  const setupDone =
    !!tasks.find((t) => t.id === "setup_cotation")?.done ||
    searchParams.get("setup") === "done";
  const quotingReady = quotingAvailable && setupDone;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-8 px-8 py-10">
        {/* Header + progress */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-serif text-[27px] leading-8 tracking-[-0.3px] text-panora-text">
              {prenom ? `Bienvenue ${prenom}` : "Bienvenue"}, ravis de vous
              compter parmi nous
            </h1>
            <p className="mt-1.5 text-[13px] leading-5 text-panora-text-secondary">
              {complete
                ? "Votre prise en main est terminée. Toute l'équipe reste à vos côtés."
                : "Diane et toute l'équipe Panora vous accompagnent pas à pas."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 sm:pt-1.5">
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-panora-border">
              <div
                className="h-full rounded-full bg-panora-green transition-[width] duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[13px] font-medium tabular-nums text-panora-text">
              {percent} %
            </span>
          </div>
        </div>

        {/* Two-column area (Kiosk layout): checklist on the left, a human right
            rail (founder video + care) on the right. */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          {/* Left: the progressive checklist + the optional (non-checklist)
              invite card. Each task has an icon + CTA — next task = primary
              CTA; others reveal a secondary CTA on hover. */}
          <div className="flex flex-col gap-4">
            <div className="rounded-[14px] border border-panora-border bg-white">
              <div className="flex items-center justify-between border-b border-panora-border px-5 py-3.5">
                <h3 className="text-[14px] font-medium text-panora-text">
                  Votre prise en main
                </h3>
                <span className="flex items-center gap-2 text-[12px] font-medium text-panora-text-secondary">
                  <ProgressRing percent={percent} size={16} strokeWidth={2} />
                  {done}/{total} terminé{done > 1 ? "s" : ""}
                </span>
              </div>
              <ul>
                {tasks.map((task, i) => (
                  <ChecklistRow
                    key={task.id}
                    task={task}
                    isNext={task.id === nextId}
                    showDivider={i > 0}
                  />
                ))}
              </ul>
            </div>

            {/* Inviting colleagues is optional — kept out of the to-do. */}
            <InviteCard />
          </div>

          {/* Right rail: the human touch */}
          <div className="flex flex-col gap-4">
            <FounderVideoCard />
            <CareCard />
          </div>
        </div>

        {/* Quoting tools — appear once the quoting agent is set up */}
        {quotingReady && (
          <div>
            <h2 className="mb-3 font-serif text-[18px] tracking-[-0.2px] text-panora-text">
              Vos outils de cotation
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <QuoteRecorderWidget />
              <MatriceWidget />
            </div>
          </div>
        )}

        {/* Bottom: resources — the brand gets louder here (landing-page look) */}
        <div>
          <h2 className="mb-3 font-serif text-[18px] tracking-[-0.2px] text-panora-text">
            Des ressources pour vous accompagner
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AcademyWidget />
            <FaqWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistRow({
  task,
  isNext,
  showDivider,
}: {
  task: OnboardingTask;
  isNext: boolean;
  showDivider: boolean;
}) {
  const meta = TASK_META[task.id];
  const Icon = meta.icon;

  return (
    <li
      className={cn(
        "group flex items-center gap-3.5 px-5 py-3.5 transition-colors",
        !task.done && "hover:bg-panora-drop/50",
        showDivider && "border-t border-panora-border/70"
      )}
    >
      {/* Icon square — green check when done, feature icon otherwise */}
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors",
          task.done
            ? "bg-panora-green text-white"
            : isNext
              ? "bg-panora-green-light text-panora-green-dark"
              : "bg-panora-tag text-panora-text-secondary"
        )}
      >
        {task.done ? (
          <Check className="h-4 w-4" strokeWidth={3} />
        ) : (
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        )}
      </span>

      <span className="flex-1 min-w-0">
        <span
          className={cn(
            "block text-[13px] font-medium leading-5",
            task.done ? "text-panora-text-muted line-through" : "text-panora-text"
          )}
        >
          {task.label}
        </span>
        <span className="block text-[12px] leading-4 text-panora-text-secondary">
          {task.description}
        </span>
      </span>

      {/* CTA — primary for the next task, secondary (hover) for the others */}
      {!task.done &&
        (isNext ? (
          <Link
            href={task.href}
            onClick={() => completeOnboardingTask(task.id)}
            className="btn-primary flex shrink-0 items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium"
          >
            {meta.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <Link
            href={task.href}
            onClick={() => completeOnboardingTask(task.id)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-panora-border bg-white px-3 py-1.5 text-[13px] font-medium text-panora-text-secondary opacity-0 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-opacity hover:bg-panora-drop focus:opacity-100 group-hover:opacity-100"
          >
            {meta.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
    </li>
  );
}

/* Invite colleagues — optional, so it sits outside the checklist and doesn't
 * count toward progress. Dashed border signals "nice to have, not a step". */
function InviteCard() {
  return (
    <div className="flex items-center gap-3.5 rounded-[14px] border border-dashed border-panora-border bg-panora-drop/40 px-5 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-panora-tag text-panora-text-secondary">
        <UserPlus className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-panora-text">
            Invitez vos collègues
          </span>
          <span className="rounded-full bg-panora-tag px-2 py-0.5 text-[11px] font-medium text-panora-text-secondary">
            Optionnel
          </span>
        </div>
        <span className="block text-[12px] leading-4 text-panora-text-secondary">
          Ajoutez votre équipe à votre espace, quand vous voulez.
        </span>
      </div>
      <Link
        href="/settings/workspace"
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-panora-border bg-white px-3 py-1.5 text-[13px] font-medium text-panora-text-secondary shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors hover:bg-panora-drop"
      >
        Inviter
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/* Founder video — a personal welcome from Diane. Puts a face on the product
 * from the first minute and signals real people behind the tool. */
function FounderVideoCard() {
  return (
    <div className="overflow-hidden rounded-[16px] border border-panora-border bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <button
        type="button"
        className="group relative block aspect-video w-full overflow-hidden bg-[#0b2621] text-left"
        aria-label="Lire le message de Diane, fondatrice de Panora"
      >
        <img
          src={DIANE_POSTER}
          alt="Diane, fondatrice de Panora"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25" />
        <span className="absolute left-3.5 top-3.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-panora-text shadow-sm">
          Message de la fondatrice
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm transition-colors group-hover:bg-white/35">
            <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
          </span>
        </span>
        <span className="absolute bottom-3.5 right-3.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[11px] tabular-nums text-white backdrop-blur-sm">
          1:24
        </span>
      </button>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <img
          src={DIANE_AVATAR}
          alt=""
          className="h-9 w-9 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-[13px] font-medium text-panora-text">
            « Bienvenue chez Panora »
          </p>
          <p className="text-[12px] leading-4 text-panora-text-secondary">
            Diane · Fondatrice de Panora
          </p>
        </div>
      </div>
    </div>
  );
}

/* Care card — a visible, human accompaniment. Real faces + a concrete offer to
 * talk to someone, so the broker never feels left alone on their journey. */
function CareCard() {
  return (
    <div className="rounded-[16px] border border-panora-green-border bg-panora-green-light/50 p-5">
      <div className="flex items-center gap-3">
        <span className="flex -space-x-2.5">
          {CARE_TEAM.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-8 w-8 rounded-full border-2 border-panora-green-light object-cover"
            />
          ))}
        </span>
        <span className="text-[12px] font-medium text-panora-green-dark">
          Votre équipe d&apos;accompagnement
        </span>
      </div>
      <p className="mt-3 text-[14px] font-medium text-panora-text">
        Un accompagnement humain, dès le départ
      </p>
      <p className="mt-1 text-[12px] leading-4 text-panora-text-secondary">
        Une question, un doute ? On vous répond vite — et on prend le temps de
        vous accompagner sur vos premières semaines.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Prendre 15 min
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-panora-border bg-white px-3.5 py-2 text-[13px] font-medium text-panora-text-secondary shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors hover:bg-panora-drop"
        >
          <Mail className="h-3.5 w-3.5" />
          Écrire à l&apos;équipe
        </button>
      </div>
    </div>
  );
}

/* Quote recorder — a CONTRIBUTION, not a task. Framed as helping Panora add a
 * carrier/extranet you use that isn't supported yet, with a clear explanation
 * of what it is and what it does. */
function QuoteRecorderWidget() {
  return (
    <div className="flex flex-col gap-3 rounded-[14px] border border-panora-border bg-white p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
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
        cabinet. Vous ne saisissez rien de plus que d&apos;habitude.
      </p>
      <div className="mt-auto flex items-center gap-3 pt-1">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-[#173c2d] px-3.5 py-2 text-[13px] font-medium text-white hover:bg-[#10301f] transition-colors"
        >
          <MonitorPlay className="h-3.5 w-3.5" />
          Enregistrer une session
        </button>
        <a
          href="#"
          className="text-[13px] font-medium text-panora-text-secondary hover:text-panora-text transition-colors"
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
      className="group flex flex-col gap-3 rounded-[14px] border border-panora-border bg-white p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors hover:bg-panora-drop/40"
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

/* Learning Academy — image-forward card on the aurora gradient, like the
 * marketing cards. Dark scrim keeps the white text legible. */
function AcademyWidget() {
  return (
    <Link
      href="#"
      className="group relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-[16px] border border-black/10 p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
    >
      <img
        src="/onboarding/empty-state-landscape.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
      <span className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
        <GraduationCap className="h-[18px] w-[18px]" />
      </span>
      <div className="relative">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
          Se former
        </span>
        <h3 className="mt-1 font-serif text-[22px] leading-7 tracking-[-0.3px] text-white">
          Panora Academy
        </h3>
        <p className="mt-1 max-w-[260px] text-[12px] leading-4 text-white/80">
          Formations courtes pour maîtriser vos assistants IA.
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-panora-text">
          Découvrir
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/* FAQ / Centre d'aide — deep-green brand block with the flower watermark. */
function FaqWidget() {
  return (
    <Link
      href="#"
      className="group relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-[16px] border border-black/15 bg-[#0b2621] p-5 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
    >
      <FlowerOutline
        className="absolute -right-6 -top-8 w-[150px] opacity-90"
        stroke="#2c5343"
      />
      <span className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
        <MessageCircleQuestion className="h-[18px] w-[18px]" />
      </span>
      <div className="relative">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-panora-green/90">
          Besoin d&apos;aide
        </span>
        <h3 className="mt-1 font-serif text-[22px] leading-7 tracking-[-0.3px] text-white">
          Questions fréquentes
        </h3>
        <p className="mt-1 max-w-[260px] text-[12px] leading-4 text-white/70">
          Consultez la FAQ ou contactez notre équipe care.
        </p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white transition-colors group-hover:bg-white/15">
          Ouvrir la FAQ
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
