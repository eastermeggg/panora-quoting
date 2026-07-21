// Reactive store for the broker's "prise en main" (onboarding) progress.
//
// Powers two surfaces that must stay in sync: the circular progress widget in
// the Sidebar and the arrival hub at /bienvenue.
//
// The checklist follows a PROGRESSIVE order: registration (pre-done) → first
// analysis → first comparison → then, only if the quoting agent is available on
// the workspace, quoting setup → first quote. Inviting colleagues is optional
// and lives OUTSIDE the checklist (handled by the hub). Every feature onboarding
// is user-level — each person runs their own the first time. State is in-memory
// only (prototype).

import { useSyncExternalStore } from "react";

export type OnboardingTaskId =
  | "inscription"
  | "test_analyse"
  | "test_comparaison"
  | "modele_devoir"
  | "setup_cotation"
  | "launch_quote";

export type OnboardingRole = "admin" | "member";

export type OnboardingTask = {
  id: OnboardingTaskId;
  label: string;
  description: string;
  href: string;
  done: boolean;
};

function buildTasks(quotingAvailable: boolean): OnboardingTask[] {
  // Pre-checked on arrival: signing up / joining the org is already done, so
  // the broker starts with visible momentum (one checkmark from the start).
  const inscription: OnboardingTask = {
    id: "inscription",
    label: "Inscription / rejoindre mon organisation",
    description: "Votre compte est créé et votre espace est prêt",
    href: "/bienvenue",
    done: true,
  };
  // The two "first use" feature tasks route into the shared guided launch
  // experience (intro modal → explanatory video → real result) via ?onboard=.
  const testAnalyse: OnboardingTask = {
    id: "test_analyse",
    label: "Lancez une première analyse de contrat",
    description: "Décortiquer un premier contrat",
    href: "/quoting/comparison?onboard=analyse",
    done: false,
  };
  const testComparaison: OnboardingTask = {
    id: "test_comparaison",
    label: "Lancez une première comparaison",
    description: "Comparez plusieurs devis côte à côte",
    href: "/quoting/comparison?onboard=comparaison",
    done: false,
  };
  // Quoting is gated on the workspace having the quoting agent. Its setup lives
  // in the dedicated quoting onboarding at /onboarding.
  const setupCotation: OnboardingTask = {
    id: "setup_cotation",
    label: "Configurer l'agent de cotation",
    description: "Connectez vos assureurs pour lancer vos cotations",
    href: "/onboarding",
    done: false,
  };
  // Cotation runs by e-mail — the in-app action leads to the quoting tutorial
  // (the end of the quoting onboarding), not a direct launch.
  const launchQuote: OnboardingTask = {
    id: "launch_quote",
    label: "Lancer une première cotation",
    description: "La cotation se fait par e-mail, on vous guide pas à pas",
    href: "/onboarding",
    done: false,
  };

  const base = [inscription, testAnalyse, testComparaison];
  return quotingAvailable ? [...base, setupCotation, launchQuote] : base;
}

let role: OnboardingRole = "admin";
let quotingAvailable = true;
let tasks: OnboardingTask[] = buildTasks(quotingAvailable);
let dismissed = false;

const subscribers = new Set<() => void>();

function notify(): void {
  subscribers.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

function getSnapshot(): OnboardingTask[] {
  return tasks;
}

export function useOnboardingTasks(): OnboardingTask[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export type OnboardingProgress = {
  done: number;
  total: number;
  percent: number;
  complete: boolean;
  dismissed: boolean;
};

function computeProgress(): OnboardingProgress {
  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent, complete: done === total, dismissed };
}

// Snapshot cached so useSyncExternalStore sees a stable reference between
// notifications (recomputed only when the store mutates).
let progressSnapshot: OnboardingProgress = computeProgress();

function getProgressSnapshot(): OnboardingProgress {
  return progressSnapshot;
}

export function useOnboardingProgress(): OnboardingProgress {
  return useSyncExternalStore(
    subscribe,
    getProgressSnapshot,
    getProgressSnapshot
  );
}

function refresh(): void {
  tasks = [...tasks];
  progressSnapshot = computeProgress();
  notify();
}

/** Scope the checklist to the role (admin adds the devoir de conseil task) and
 *  the workspace's quoting availability. Idempotent: rebuilds only on change. */
export function configureOnboarding(opts: {
  role?: OnboardingRole;
  quotingAvailable?: boolean;
}): void {
  const nextRole = opts.role ?? role;
  const nextQuoting = opts.quotingAvailable ?? quotingAvailable;
  if (nextRole === role && nextQuoting === quotingAvailable && tasks.length > 0)
    return;
  role = nextRole;
  quotingAvailable = nextQuoting;
  tasks = buildTasks(quotingAvailable);
  progressSnapshot = computeProgress();
  notify();
}

export function completeOnboardingTask(id: OnboardingTaskId): void {
  const task = tasks.find((t) => t.id === id);
  if (!task || task.done) return;
  task.done = true;
  refresh();
}

export function toggleOnboardingTask(id: OnboardingTaskId): void {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.done = !task.done;
  refresh();
}

export function dismissOnboarding(): void {
  if (dismissed) return;
  dismissed = true;
  progressSnapshot = computeProgress();
  notify();
}

// ── Prototype preview helpers (state switcher) ──

/** Back to the "en cours" state: fresh task list (inscription pre-done). */
export function resetOnboardingProgress(): void {
  tasks = buildTasks(quotingAvailable);
  dismissed = false;
  progressSnapshot = computeProgress();
  notify();
}

/** Force the "done" state: every task complete (100%). */
export function completeAllOnboarding(): void {
  tasks = tasks.map((t) => ({ ...t, done: true }));
  progressSnapshot = computeProgress();
  notify();
}
