"use client";

/**
 * Demo command center — internal tooling, NEVER shipped to brokers.
 *
 * Triggered by Cmd+Shift+D. Lets the demo runner manipulate the comparison
 * state in real time during a client demo, without waiting for timers or
 * having to navigate through real broker flows.
 *
 * Visual treatment: dark zinc, muted accents. Distinct from broker palette
 * (warm cream + green + serif) so it cannot be mistaken for a broker
 * affordance, but quiet enough not to fight for attention.
 *
 * ─── Growing the panel ─────────────────────────────────────────────
 * Each new iteration should add a `<DemoSection>` block in the body
 * of this component to expose its capability as a demo trigger.
 * Example for iter 01 (add row via chat): a button that injects a
 * pre-canned "Quelle garantie veux-tu ajouter ?" agent message into
 * the chat. Keep triggers atomic (one verb per button) and place the
 * new section in chronological order of the iteration (01, 02, …).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Play, Plus, RefreshCw, MessageSquarePlus, GripVertical } from "lucide-react";
import type {
  CellState,
  CellDetail,
  CellValue,
  ComparisonData,
  GuaranteeRow,
  InsurerData,
} from "@/data/mock";

interface DemoCommandCenterProps {
  open: boolean;
  onClose: () => void;
  insurers: InsurerData[];
  setInsurers: React.Dispatch<React.SetStateAction<InsurerData[]>>;
  comparisonData: ComparisonData | undefined;
  setComparisonData: React.Dispatch<
    React.SetStateAction<ComparisonData | undefined>
  >;
  initialInsurers: InsurerData[];
  initialComparisonData: ComparisonData | undefined;
  /** Iter 01: trigger the add-row chat flow for a chosen subgroup without
   *  having to scroll the grid to find the "+" button. */
  onTriggerAddRow?: (sectionPath: { productIndex: number; subGroupIndex: number; sectionTitle: string }) => void;
}

type RowSelector = {
  productIndex: number;
  subGroupIndex: number;
  rowIndex: number;
  label: string;
};

const STATE_OPTIONS: { value: CellState; label: string }[] = [
  { value: "extracted", label: "Extraite" },
  { value: "override", label: "Override courtier" },
  { value: "unavailable", label: "Non disponible" },
  { value: "extracting", label: "Extraction en cours" },
];

export function DemoCommandCenter({
  open,
  onClose,
  insurers,
  setInsurers,
  comparisonData,
  setComparisonData,
  initialInsurers,
  initialComparisonData,
  onTriggerAddRow,
}: DemoCommandCenterProps) {
  // ─── Draggable position ──────────────────────────────────────────
  // The panel can be dragged anywhere by the header. Position persists
  // in localStorage so it stays put across opens within the session.
  const POSITION_KEY = "panora-demo-panel-pos";
  const PANEL_WIDTH = 340;
  const DEFAULT_MARGIN = 16;
  const [position, setPosition] = useState<{ x: number; y: number } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(POSITION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") return parsed;
      }
    } catch {}
    return null; // null = anchor to bottom-right default
  });
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);

  // If position is null, anchor to bottom-right via CSS. If position is set,
  // use absolute top/left to allow free placement.
  function startDrag(e: React.MouseEvent<HTMLDivElement>) {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    dragRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    setDragging(true);
    // Lock onto position immediately so subsequent moves are absolute
    setPosition({ x: rect.left, y: rect.top });
  }

  useEffect(() => {
    if (!dragging) return;
    function onMove(e: MouseEvent) {
      if (!dragRef.current) return;
      const x = e.clientX - dragRef.current.offsetX;
      const y = e.clientY - dragRef.current.offsetY;
      // Clamp inside viewport
      const maxX = window.innerWidth - PANEL_WIDTH;
      const maxY = window.innerHeight - 60; // keep header in view at minimum
      setPosition({
        x: Math.max(0, Math.min(maxX, x)),
        y: Math.max(0, Math.min(maxY, y)),
      });
    }
    function onUp() {
      setDragging(false);
      dragRef.current = null;
    }
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  // Persist position
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (position === null) {
      window.localStorage.removeItem(POSITION_KEY);
    } else {
      try {
        window.localStorage.setItem(POSITION_KEY, JSON.stringify(position));
      } catch {}
    }
  }, [position]);

  function resetPosition() {
    setPosition(null);
  }

  // Flat list of (product, subGroup, row) so the row dropdown is selectable
  const rows = useMemo<RowSelector[]>(() => {
    if (!comparisonData?.products) return [];
    const out: RowSelector[] = [];
    comparisonData.products.forEach((product, productIndex) => {
      product.subGroups.forEach((subGroup, subGroupIndex) => {
        subGroup.rows.forEach((row, rowIndex) => {
          out.push({
            productIndex,
            subGroupIndex,
            rowIndex,
            label: `${subGroup.title} · ${row.label}`,
          });
        });
      });
    });
    return out;
  }, [comparisonData]);

  // Flat list of subgroups for the "Add row" trigger (iter 01)
  const subgroups = useMemo<{ productIndex: number; subGroupIndex: number; sectionTitle: string }[]>(() => {
    if (!comparisonData?.products) return [];
    const out: { productIndex: number; subGroupIndex: number; sectionTitle: string }[] = [];
    comparisonData.products.forEach((product, productIndex) => {
      product.subGroups.forEach((subGroup, subGroupIndex) => {
        out.push({ productIndex, subGroupIndex, sectionTitle: subGroup.title });
      });
    });
    return out;
  }, [comparisonData]);

  // ─── Form: force cell state ──────────────────────────────────────
  const [rowKey, setRowKey] = useState<string>("0-0-0");
  const [insurerId, setInsurerId] = useState<string>(insurers[0]?.id ?? "");
  const [stateValue, setStateValue] = useState<CellState>("override");

  // ─── Form: iter 01 trigger add row ───────────────────────────────
  const [addRowSubgroupKey, setAddRowSubgroupKey] = useState<string>("0-0");

  // ─── Form: replay extraction ─────────────────────────────────────
  const [replayKind, setReplayKind] = useState<"row" | "column">("row");
  const [replayRowKey, setReplayRowKey] = useState<string>("0-0-0");
  const [replayInsurerId, setReplayInsurerId] = useState<string>(
    insurers[0]?.id ?? ""
  );

  // ─── Form: simulate offer ────────────────────────────────────────
  const newOfferCount = useRef(1);

  // ─── Mutators ────────────────────────────────────────────────────

  function applyForceState() {
    const [pi, sgi, ri] = rowKey.split("-").map(Number);
    setComparisonData((prev) => {
      if (!prev?.products?.[pi]?.subGroups?.[sgi]?.rows?.[ri]) return prev;
      const next = structuredClone(prev) as ComparisonData;
      const row = next.products[pi].subGroups[sgi].rows[ri];
      row.details = row.details ?? {};
      const existing = row.details[insurerId] ?? {
        title: row.label,
        covered: true,
        insurerId,
        insurerName: insurers.find((i) => i.id === insurerId)?.name ?? insurerId,
        description: "",
        cellType: "guarantee" as const,
      };
      row.details[insurerId] = { ...existing, state: stateValue };
      // Coerce value so the badge renders something for unavailable/extracting
      if (stateValue === "unavailable" || stateValue === "extracting") {
        row.values[insurerId] = { type: "empty" };
      }
      return next;
    });
  }

  function simulateNewOffer() {
    const id = `demo-${newOfferCount.current++}`;
    const name = `Démo Assureur ${newOfferCount.current - 1}`;
    // Add the insurer
    setInsurers((prev) => [
      ...prev,
      {
        id,
        name,
        logo: "🟣",
        logoColor: "#75505d",
        hasCode: true,
        status: "completed",
        reference: `DEMO-${newOfferCount.current - 1}`,
        documents: [],
        pricing: [],
        quoteInfo: [],
        allSteps: [],
      },
    ]);
    // Add extracting cells to every guarantee row
    setComparisonData((prev) => {
      if (!prev?.products) return prev;
      const next = structuredClone(prev) as ComparisonData;
      next.products.forEach((product) => {
        product.subGroups.forEach((subGroup) => {
          subGroup.rows.forEach((row) => {
            row.values[id] = { type: "empty" };
            row.details = row.details ?? {};
            row.details[id] = {
              title: row.label,
              covered: true,
              insurerId: id,
              insurerName: name,
              description: "Extraction en cours…",
              cellType: "guarantee",
              state: "extracting",
            };
          });
        });
      });
      return next;
    });
    // After 2s, fill with mock values
    window.setTimeout(() => {
      setComparisonData((prev) => {
        if (!prev?.products) return prev;
        const next = structuredClone(prev) as ComparisonData;
        next.products.forEach((product) => {
          product.subGroups.forEach((subGroup) => {
            subGroup.rows.forEach((row) => {
              const filled = mockFillRow(row, id);
              row.values[id] = filled.value;
              row.details = row.details ?? {};
              row.details[id] = {
                ...row.details[id]!,
                state: "extracted",
                description: "Valeur extraite — démo",
              } as CellDetail;
              if (filled.detailExtra) {
                row.details[id] = { ...row.details[id]!, ...filled.detailExtra };
              }
            });
          });
        });
        return next;
      });
    }, 2000);
  }

  function replayExtraction() {
    const target =
      replayKind === "row"
        ? { kind: "row" as const, key: replayRowKey }
        : { kind: "column" as const, insurerId: replayInsurerId };
    // Snapshot current details before overwriting state
    const snapshot = comparisonData
      ? (structuredClone(comparisonData) as ComparisonData)
      : undefined;
    // Set to extracting
    setComparisonData((prev) => {
      if (!prev?.products) return prev;
      const next = structuredClone(prev) as ComparisonData;
      next.products.forEach((product, pi) => {
        product.subGroups.forEach((sg, sgi) => {
          sg.rows.forEach((row, ri) => {
            if (target.kind === "row") {
              const [tpi, tsgi, tri] = target.key.split("-").map(Number);
              if (pi !== tpi || sgi !== tsgi || ri !== tri) return;
              Object.keys(row.values).forEach((iid) => {
                row.details = row.details ?? {};
                row.details[iid] = {
                  ...(row.details[iid] ?? {
                    title: row.label,
                    covered: true,
                    insurerId: iid,
                    insurerName: iid,
                    description: "",
                    cellType: "guarantee" as const,
                  }),
                  state: "extracting",
                };
              });
            } else {
              row.details = row.details ?? {};
              row.details[target.insurerId] = {
                ...(row.details[target.insurerId] ?? {
                  title: row.label,
                  covered: true,
                  insurerId: target.insurerId,
                  insurerName: target.insurerId,
                  description: "",
                  cellType: "guarantee" as const,
                }),
                state: "extracting",
              };
            }
          });
        });
      });
      return next;
    });
    // After 1.5s, restore from snapshot
    window.setTimeout(() => {
      if (snapshot) setComparisonData(snapshot);
    }, 1500);
  }

  function reset() {
    setInsurers(initialInsurers);
    setComparisonData(initialComparisonData);
    newOfferCount.current = 1;
  }

  if (!open) return null;

  const positionStyle: React.CSSProperties = position
    ? { top: position.y, left: position.x }
    : { bottom: DEFAULT_MARGIN, right: DEFAULT_MARGIN };

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-label="Démo — panneau de contrôle interne"
      className={`fixed z-50 w-[340px] max-h-[calc(100vh-2rem)] overflow-y-auto bg-zinc-900 text-zinc-200 rounded-md shadow-[0_8px_28px_rgba(0,0,0,0.32)] border border-zinc-800 text-[12px] ${dragging ? "select-none" : ""}`}
      style={positionStyle}
    >
      {/* Drag handle header */}
      <div
        onMouseDown={startDrag}
        onDoubleClick={resetPosition}
        className={`flex items-center justify-between px-3 py-2 border-b border-zinc-800 sticky top-0 bg-zinc-900 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        title="Glisser pour déplacer · Double-clic pour réinitialiser la position"
      >
        <div className="flex items-center gap-1.5 text-zinc-300">
          <GripVertical className="w-3 h-3 text-zinc-600 shrink-0" />
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
          <span className="text-[11px] font-medium tracking-wide">Démo · non shippé</span>
        </div>
        <button
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          aria-label="Fermer le panneau démo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section 1: Force cell state */}
      <DemoSection title="Forcer un état de cellule">
        <DemoSelect
          label="Ligne"
          value={rowKey}
          onChange={setRowKey}
          options={rows.map((r) => ({
            value: `${r.productIndex}-${r.subGroupIndex}-${r.rowIndex}`,
            label: r.label,
          }))}
        />
        <DemoSelect
          label="Assureur"
          value={insurerId}
          onChange={setInsurerId}
          options={insurers.map((i) => ({ value: i.id, label: i.name }))}
        />
        <DemoSelect
          label="État"
          value={stateValue}
          onChange={(v) => setStateValue(v as CellState)}
          options={STATE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        <DemoButton onClick={applyForceState} icon={Play}>
          Appliquer
        </DemoButton>
      </DemoSection>

      {/* Section 2: Simulate offer arrival */}
      <DemoSection title="Simuler une arrivée d’offre">
        <p className="text-[11px] text-zinc-500 leading-4">
          Nouvelle colonne en extraction, remplie après 2s.
        </p>
        <DemoButton onClick={simulateNewOffer} icon={Plus}>
          Ajouter assureur fictif
        </DemoButton>
      </DemoSection>

      {/* Section 3: Replay extraction */}
      <DemoSection title="Rejouer une extraction">
        <DemoSelect
          label="Cible"
          value={replayKind}
          onChange={(v) => setReplayKind(v as "row" | "column")}
          options={[
            { value: "row", label: "Une ligne" },
            { value: "column", label: "Une colonne (assureur)" },
          ]}
        />
        {replayKind === "row" ? (
          <DemoSelect
            label="Ligne"
            value={replayRowKey}
            onChange={setReplayRowKey}
            options={rows.map((r) => ({
              value: `${r.productIndex}-${r.subGroupIndex}-${r.rowIndex}`,
              label: r.label,
            }))}
          />
        ) : (
          <DemoSelect
            label="Assureur"
            value={replayInsurerId}
            onChange={setReplayInsurerId}
            options={insurers.map((i) => ({ value: i.id, label: i.name }))}
          />
        )}
        <DemoButton onClick={replayExtraction} icon={RefreshCw}>
          Rejouer (1,5s)
        </DemoButton>
      </DemoSection>

      {/* Iter 01: Trigger add-row conversation */}
      {onTriggerAddRow && (
        <DemoSection title="01 · Ajouter une garantie via chat">
          <p className="text-[11px] text-zinc-500 leading-4">
            Ouvre la conversation d&apos;ajout sans avoir à scroller jusqu&apos;au « + ».
          </p>
          <DemoSelect
            label="Famille cible"
            value={addRowSubgroupKey}
            onChange={setAddRowSubgroupKey}
            options={subgroups.map((sg) => ({
              value: `${sg.productIndex}-${sg.subGroupIndex}`,
              label: sg.sectionTitle,
            }))}
          />
          <DemoButton
            onClick={() => {
              const [pi, sgi] = addRowSubgroupKey.split("-").map(Number);
              const target = subgroups.find((s) => s.productIndex === pi && s.subGroupIndex === sgi);
              if (target) onTriggerAddRow(target);
            }}
            icon={MessageSquarePlus}
          >
            Démarrer la conversation
          </DemoButton>
        </DemoSection>
      )}

      {/* Section 4: Reset */}
      <DemoSection title="Réinitialiser" lastSection>
        <DemoButton onClick={reset} icon={RefreshCw} variant="danger">
          Tout réinitialiser
        </DemoButton>
      </DemoSection>

      {/* Footer kbd hint */}
      <div className="px-3 py-2 border-t border-zinc-800 text-[10px] text-zinc-500">
        <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">⌘⇧D</kbd>
        <span className="ml-1.5">pour fermer</span>
      </div>
    </aside>
  );
}

// ─── Sub-components (demo-only styling) ────────────────────────────

function DemoSection({
  title,
  children,
  lastSection,
}: {
  title: string;
  children: React.ReactNode;
  lastSection?: boolean;
}) {
  return (
    <div className={`px-3 py-2.5 ${lastSection ? "" : "border-b border-zinc-800"}`}>
      <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-500 mb-1.5">
        {title}
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function DemoSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DemoButton({
  onClick,
  children,
  icon: Icon,
  variant = "primary",
}: {
  onClick: () => void;
  children: React.ReactNode;
  icon: typeof Play;
  variant?: "primary" | "danger";
}) {
  const variantClasses =
    variant === "danger"
      ? "bg-zinc-800 hover:bg-zinc-700 text-rose-300 border border-zinc-700 hover:border-rose-400/40"
      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700";
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-[12px] font-medium transition-colors ${variantClasses}`}
    >
      <Icon className="w-3 h-3" />
      {children}
    </button>
  );
}

// ─── Mock fill for "simulate new offer" ────────────────────────────

function mockFillRow(
  row: GuaranteeRow,
  insurerId: string,
): { value: CellValue; detailExtra?: Partial<CellDetail> } {
  // Look at other insurers' values to produce a plausible value
  const otherValues = Object.entries(row.values).filter(
    ([id]) => id !== insurerId,
  );
  const sample = otherValues[Math.floor(Math.random() * otherValues.length)]?.[1];
  if (!sample) return { value: { type: "empty" } };
  if (sample.type === "check") return { value: { type: "check" } };
  if (sample.type === "cross") return { value: { type: "cross" } };
  if (sample.type === "text") return { value: { type: "text", value: sample.value } };
  return { value: { type: "empty" } };
}
