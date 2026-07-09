"use client";

// TEMPORARY route — Figma capture harness for the VEOS feature.
// Renders every VEOS-linked component state statically so the whole set can be
// captured into Figma in one pass. Delete after capture; not part of the app.

import { useEffect } from "react";
import { FolderOpen, Pencil, X } from "lucide-react";
import { ConfigureVeosModal } from "@/components/settings/ConfigureVeosModal";
import { IntegrationRow } from "@/components/settings/IntegrationRow";
import { ClientSelector } from "@/components/quoting/ClientSelector";
import { CreateClientModal } from "@/components/quoting/CreateClientModal";
import { EtudeSelector } from "@/components/quoting/EtudeSelector";
import { CreateEtudeModal } from "@/components/quoting/CreateEtudeModal";
import { SendToVeosModal } from "@/components/quoting/SendToVeosModal";
import {
  BulkSendToVeosModal,
  type BulkDocument,
  type CrmSection,
} from "@/components/quoting/BulkSendToVeosModal";
import { integrationsCatalog } from "@/data/integrations-mock";
import { erpAdapters } from "@/data/erp-adapters";
import { getClientContracts } from "@/data/clients-mock";

const noop = () => {};
const veosIntegration = integrationsCatalog.find((i) => i.id === "veos")!;
const veos = erpAdapters.veos;
const marbleContracts = getClientContracts("marble");
const marbleEtudes = marbleContracts.filter((c) => c.status === "etude");

const bulkDocuments: BulkDocument[] = [
  { id: "devis-generali", label: "Devis Generali — RC Professionnelle.pdf", meta: "Reçu le 06/07 · 14 pages", category: "devis", insurerId: "generali", insurerName: "Generali", defaultChecked: true },
  { id: "cg-generali", label: "CG Generali — RC Professionnelle.pdf", meta: "Conditions générales", category: "conditions_generales", insurerId: "generali", insurerName: "Generali", defaultChecked: true },
  { id: "devis-axa", label: "Devis Axa — RC Professionnelle.pdf", meta: "Reçu le 07/07 · 11 pages", category: "devis", insurerId: "axa", insurerName: "Axa", defaultChecked: true },
  { id: "tableau-axa", label: "Tableau de garanties Axa.pdf", meta: "Extrait du devis", category: "tableau_garanties", insurerId: "axa", insurerName: "Axa", defaultChecked: false },
  { id: "devis-allianz", label: "Devis Allianz — RC Professionnelle.pdf", meta: "Reçu le 07/07 · 9 pages", category: "devis", insurerId: "allianz", insurerName: "Allianz", defaultChecked: true },
  { id: "synthese", label: "Synthèse comparative — Marble Tech SAS.pdf", meta: "Document Panora", category: "synthese", defaultChecked: true },
  { id: "recap", label: "Récapitulatif demande Panora.pdf", meta: "Auto-généré · Besoins client & contexte", category: "recap_demande", defaultChecked: true },
];

// Agent cotation — the VEOS étude already carries quoting-phase data:
// mix of nouveau (null), à jour (same) and conflits (different).
const crmSections: CrmSection[] = [
  {
    key: "contrat",
    label: "Données contrat",
    fields: [
      { label: "Référence", value: "COT-2026-042", veosValue: null, erpField: "contrat.reference_courtier", erpFieldOptions: ["contrat.reference_externe", "contrat.numero_dossier"] },
      { label: "Produit", value: "RC Professionnelle", veosValue: "RC Professionnelle", erpField: "contrat.produit", input: "multiselect", options: ["RC Professionnelle", "Multirisque bureau", "Protection juridique", "Cyber-risques"] },
      { label: "Courtier", value: "Delphine Howden", veosValue: "Delphine Howden", erpField: "contrat.gestionnaire", erpFieldOptions: ["contrat.apporteur"] },
      { label: "Assureurs sollicités", value: "Generali, Axa, Allianz", veosValue: null, erpField: "contrat.assureurs_consultes", erpFieldOptions: ["contrat.notes"] },
      { label: "Statut", value: "3 devis reçus", veosValue: "Étude en cours", erpField: "contrat.statut", erpFieldOptions: ["contrat.etape"] },
      { label: "Prime estimée", value: "4 100 € – 5 600 € / an", veosValue: "Budget client · 5 000 € TTC", erpField: "contrat.prime_estimee_ttc", erpFieldOptions: ["contrat.prime_ht"] },
      { label: "Date de demande", value: "08/07/2026", veosValue: null, erpField: "contrat.date_demande", erpFieldOptions: ["contrat.date_creation"] },
    ],
  },
  {
    key: "entreprise",
    label: "Entreprise",
    fields: [
      { label: "Raison sociale", value: "Marble Tech SAS", veosValue: "Marble Tech SAS", erpField: "client.raison_sociale" },
      { label: "SIREN", value: "00007U26464", veosValue: "00007U26464", erpField: "client.siren" },
      { label: "Effectif", value: "42 salariés", veosValue: "38 salariés", erpField: "client.effectif" },
      { label: "Chiffre d'affaires", value: "6,8 M€", veosValue: null, erpField: "client.ca_annuel" },
    ],
  },
];

// Agent analyse — docs-only push (crmSections=[] hides the Données step).
const comparisonDocs: BulkDocument[] = [
  { id: "export-synthese", label: "Synthèse — Marble Tech SAS.pdf", meta: "Export Panora", category: "synthese", defaultChecked: true },
  { id: "export-tableau", label: "Tableau comparatif — Marble Tech SAS.xlsx", meta: "Export Panora", category: "tableau_garanties", defaultChecked: true },
  { id: "export-devoir", label: "Devoir de conseil — Marble Tech SAS.pdf", meta: "Export Panora", category: "devoir_conseil", defaultChecked: false },
  { id: "gen-email", label: "Email de présentation — Marble Tech SAS.txt", meta: "Document généré · Relance CFO", category: "autre", defaultChecked: true },
  { id: "gen-synthese", label: "Synthèse interne — Comité.pdf", meta: "Document généré · Synthèse interne", category: "synthese", defaultChecked: true },
];

// Agent souscription — l'étude VEOS devient contrat : conflits nombreux
// (prime estimée → prime finale, statut étude → émis, franchise négociée).
const sousDocuments: BulkDocument[] = [
  { id: "cp-signees", label: "Conditions particulières signées — Marble Tech SAS.pdf", meta: "Signé le 28/08 · 8 pages", category: "contrat", defaultChecked: true },
  { id: "attestation", label: "Attestation RC Pro 2026.pdf", meta: "Émise le 01/09", category: "attestation", defaultChecked: true },
  { id: "devis-final", label: "Devis retenu — Hiscox.pdf", meta: "Version finale", category: "devis", defaultChecked: true },
  { id: "quittance", label: "Quittance 1re échéance.pdf", meta: "Prélèvement 01/09", category: "autre", defaultChecked: false },
];

const sousCrmSections: CrmSection[] = [
  {
    key: "contrat-emis",
    label: "Contrat émis",
    fields: [
      { label: "N° de police", value: "POL-2026-1187", veosValue: null, erpField: "contrat.numero_police", erpFieldOptions: ["contrat.reference_externe"] },
      { label: "Statut", value: "Contrat émis", veosValue: "Étude en cours", erpField: "contrat.statut", erpFieldOptions: ["contrat.etape"] },
      { label: "Assureur retenu", value: "Hiscox", veosValue: null, erpField: "contrat.assureur", erpFieldOptions: ["contrat.compagnie"] },
      { label: "Prime finale", value: "4 890 € TTC / an", veosValue: "Estimée · 4 100 – 5 600 €", erpField: "contrat.prime_ttc", erpFieldOptions: ["contrat.prime_ht"] },
      { label: "Franchise", value: "2 500 €", veosValue: "1 000 €", erpField: "contrat.franchise", erpFieldOptions: ["contrat.franchise_rc"] },
      { label: "Date d'effet", value: "01/09/2026", veosValue: null, erpField: "contrat.date_effet", erpFieldOptions: ["contrat.date_signature"] },
      { label: "Échéance principale", value: "01/09", veosValue: "01/09", erpField: "contrat.echeance" },
    ],
  },
];

export default function VeosFigmaCapturePage() {
  // The Figma capture serializer drops subtrees carrying dialog semantics on
  // a non-fixed inner element (ConfigureVeosModal, CreateClientModal put
  // role="dialog" + aria-modal on the dialog card — correct a11y, but the
  // capture skips them). Strip both here, in the harness only, before the
  // capture runs; ARIA attributes have no visual effect.
  useEffect(() => {
    document
      .querySelectorAll('.veos-stage [role="dialog"], .veos-stage [aria-modal]')
      .forEach((el) => {
        el.removeAttribute("aria-modal");
        el.removeAttribute("role");
      });
  }, []);

  return (
    <div className="min-h-screen bg-panora-bg px-12 py-12 flex flex-col gap-14">
      {/* Stage overrides: (1) viewport-relative max-heights → none so modals
          render full height; (2) fixed → absolute so the capture tool doesn't
          drop viewport-covering fixed overlays (cookie-banner heuristic) —
          inside the relative stage box, absolute inset-0 renders identically. */}
      <style>{`
        .veos-stage [class*="max-h-"] { max-height: none !important; }
        .veos-stage .fixed { position: absolute !important; }
      `}</style>
      {/* Figma html-to-design capture runtime — harness only. */}
      <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async />


      <header className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-panora-text-muted uppercase tracking-wider">
          Panora · capture Figma
        </span>
        <h1 className="text-[24px] font-serif text-panora-text">
          Composants VEOS — tous les états
        </h1>
      </header>

      {/* ── 1 · Connexion VEOS ─────────────────────────────────────── */}
      <SectionBlock title="1 · Configurer & connecter VEOS">
        <div className="flex flex-col gap-3 w-[720px]">
          <Caption text="Paramètres · Intégrations — ligne VEOS (non configuré / connecté)" />
          <IntegrationRow integration={veosIntegration} onConfigure={noop} onEdit={noop} />
          <IntegrationRow
            integration={veosIntegration}
            connection={{
              integrationId: "veos",
              status: "connected",
              accountLabel: "Token actif",
              lastSyncLabel: "Dernière sync · il y a 2 min",
              connectedAt: "2026-07-08",
            }}
            onConfigure={noop}
            onEdit={noop}
          />
        </div>
        <Caption text="Modales de configuration → section 5 (en fin de page — la capture Figma perd les modales trop haut placées)" />
      </SectionBlock>

      {/* ── 2 · Recherche client ───────────────────────────────────── */}
      <SectionBlock title="2 · Rechercher un client">
        <div className="flex flex-wrap gap-8 items-start">
          <FieldStage label="Recherche — résultats VEOS" height={420}>
            <ClientSelector value={null} onChange={noop} veosConnected defaultOpen />
          </FieldStage>
          <FieldStage label="Client sélectionné" height={110}>
            <ClientSelector value="marble" onChange={noop} veosConnected />
          </FieldStage>
          <FieldStage label="Aucun résultat — créer dans VEOS" height={200}>
            <ClientSelector value={null} onChange={noop} clients={[]} veosConnected defaultOpen />
          </FieldStage>
          <FieldStage label="VEOS non connecté" height={110}>
            <ClientSelector value={null} onChange={noop} veosConnected={false} />
          </FieldStage>
        </div>
        <Caption text="Modale « Créer un client » → section 5 (en fin de page — la capture Figma perd les modales trop haut placées)" />
      </SectionBlock>

      {/* ── 3 · Recherche étude ────────────────────────────────────── */}
      <SectionBlock title="3 · Rechercher une étude">
        <div className="flex flex-wrap gap-8 items-start">
          <FieldStage label="Recherche — études & contrats du client" height={420}>
            <EtudeSelector value="" onChange={noop} onCreate={noop} contracts={marbleContracts} statusLabels={veos.container.statuses} singular={veos.container.singular} defaultOpen />
          </FieldStage>
          <FieldStage label="Étude sélectionnée" height={110}>
            <EtudeSelector value="ctr-marble-etude-rcpro" onChange={noop} onCreate={noop} contracts={marbleEtudes} statusLabels={veos.container.statuses} singular={veos.container.singular} />
          </FieldStage>
          <FieldStage label="Contrat sélectionné — badge statut" height={110}>
            <EtudeSelector value="ctr-marble-rcpro" onChange={noop} onCreate={noop} contracts={marbleContracts} statusLabels={veos.container.statuses} singular={veos.container.singular} />
          </FieldStage>
          <FieldStage label="Aucune étude pour ce client" height={200}>
            <EtudeSelector value="" onChange={noop} onCreate={noop} contracts={[]} statusLabels={veos.container.statuses} singular={veos.container.singular} defaultOpen />
          </FieldStage>
          <FieldStage label="Brouillon — sera créée dans VEOS" height={110}>
            <EtudeDraftChip title="Étude RC Pro 2026" number="ETU-2026-431" erpName="VEOS" />
          </FieldStage>
        </div>
        <div className="flex flex-wrap gap-8 items-start">
          <ModalStage label="Créer une étude" width={560} height={460}>
            <CreateEtudeModal
              open
              initial={{ title: "Étude RC Pro 2026", number: "ETU-2026-431", product: "RC Professionnelle" }}
              productPlaceholder="RC Professionnelle"
              singular={veos.container.singular}
              erpName={veos.name}
              formLabels={veos.container.formLabels}
              hasExistingEtudes
              onBack={noop}
              onCancel={noop}
              onCreate={noop}
            />
          </ModalStage>
        </div>
      </SectionBlock>

      {/* ── 4 · Envoi documents & données — les trois agents ─────────── */}
      <SectionBlock title="4 · Envoyer documents & informations">
        <Caption text="Agent analyse — après chaque export : toast non bloquant, coin bas-droit" />
        <div className="flex flex-wrap gap-8 items-start">
          <ModalStage label="Toast post-export — proposition" width={470} height={330}>
            <SendToVeosModal state={{ status: "prompt", label: "Synthèse comparative — Marble Tech SAS.pdf" }} clientName="Marble Tech SAS" onDismiss={noop} onSend={noop} />
          </ModalStage>
          <ModalStage label="Toast post-export — en cours" width={470} height={330}>
            <SendToVeosModal state={{ status: "sending", label: "Synthèse comparative — Marble Tech SAS.pdf" }} clientName="Marble Tech SAS" onDismiss={noop} onSend={noop} />
          </ModalStage>
          <ModalStage label="Toast post-export — confirmé" width={470} height={300}>
            <SendToVeosModal state={{ status: "sent", label: "Synthèse comparative — Marble Tech SAS.pdf" }} clientName="Marble Tech SAS" onDismiss={noop} onSend={noop} />
          </ModalStage>
        </div>

        <Caption text="Agent cotation — fin de cotation : documents + données (nouveau / à jour / conflit)" />
        <div className="flex flex-wrap gap-8 items-start">
          <ModalStage label="Cotation — 1 · Client & contrat" width={960} height={620}>
            <BulkSendToVeosModal open clientId="marble" clientName="Marble Tech SAS" principalProduct="RC Pro" documents={bulkDocuments} crmSections={crmSections} onCancel={noop} />
          </ModalStage>
          <ModalStage label="Cotation — 2 · Documents" width={960} height={1000}>
            <BulkSendToVeosModal open clientId="marble" clientName="Marble Tech SAS" principalProduct="RC Pro" documents={bulkDocuments} crmSections={crmSections} onCancel={noop} initialStep={2} />
          </ModalStage>
          <ModalStage label="Cotation — 3 · Données, conflits à résoudre" width={960} height={900}>
            <BulkSendToVeosModal open clientId="marble" clientName="Marble Tech SAS" principalProduct="RC Pro" documents={bulkDocuments} crmSections={crmSections} onCancel={noop} initialStep={3} />
          </ModalStage>
        </div>

        <Caption text="Agent analyse — « Envoyer à VEOS » depuis l'onglet Présenter : documents seuls, l'étape Données disparaît" />
        <div className="flex flex-wrap gap-8 items-start">
          <ModalStage label="Analyse — 1 · Client & contrat (2 étapes)" width={960} height={620}>
            <BulkSendToVeosModal open clientId="marble" clientName="Marble Tech SAS" principalProduct="RC Pro" documents={comparisonDocs} crmSections={[]} onCancel={noop} />
          </ModalStage>
          <ModalStage label="Analyse — 2 · Documents (étape finale, envoi direct)" width={960} height={760}>
            <BulkSendToVeosModal open clientId="marble" clientName="Marble Tech SAS" principalProduct="RC Pro" documents={comparisonDocs} crmSections={[]} onCancel={noop} initialStep={2} />
          </ModalStage>
        </div>

        <Caption text="Agent souscription — contrat émis : l'étude VEOS devient contrat, conflits résolus champ par champ" />
        <div className="flex flex-wrap gap-8 items-start">
          <ModalStage label="Souscription — 2 · Pièces du contrat" width={960} height={700}>
            <BulkSendToVeosModal open clientId="marble" clientName="Marble Tech SAS" principalProduct="RC Pro" documents={sousDocuments} crmSections={sousCrmSections} onCancel={noop} initialStep={2} />
          </ModalStage>
          <ModalStage label="Souscription — 3 · Données du contrat émis" width={960} height={880}>
            <BulkSendToVeosModal open clientId="marble" clientName="Marble Tech SAS" principalProduct="RC Pro" documents={sousDocuments} crmSections={sousCrmSections} onCancel={noop} initialStep={3} />
          </ModalStage>
        </div>
      </SectionBlock>

      {/* ── 5 · Modales de configuration (placées en fin de page : la
             capture Figma perd les modales des premières sections) ──── */}
      <SectionBlock title="5 · Configurer VEOS & créer un client (modales)">
        <div className="flex flex-wrap gap-8 items-start">
          <ModalStage label="Étape 1 — Découvrir" width={680} height={620}>
            <ConfigureVeosModal integration={veosIntegration} onClose={noop} onConnected={noop} />
          </ModalStage>
          <ModalStage label="Étape 2 — Identifiants" width={680} height={480}>
            <ConfigureVeosModal integration={veosIntegration} onClose={noop} onConnected={noop} initialStep="credentials" />
          </ModalStage>
          <ModalStage label="Étape 2 — Connexion réussie" width={680} height={480}>
            <ConfigureVeosModal integration={veosIntegration} onClose={noop} onConnected={noop} initialStep="credentials" initialTest={{ status: "success" }} />
          </ModalStage>
        </div>
        <div className="flex flex-wrap gap-8 items-start">
          <ModalStage label="Créer un client — Personne morale" width={680} height={1150}>
            <CreateClientModal veosConnected initialName="Marble Tech SAS" onCancel={noop} onCreated={noop} />
          </ModalStage>
          <ModalStage label="Créer un client — Personne physique" width={680} height={900}>
            <CreateClientModal veosConnected initialType="PP" onCancel={noop} onCreated={noop} />
          </ModalStage>
        </div>
      </SectionBlock>
    </div>
  );
}

// ── Harness chrome ──────────────────────────────────────────────────────

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-[18px] font-serif text-panora-text border-b border-panora-border pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Caption({ text }: { text: string }) {
  return (
    <span className="text-[12px] font-medium text-panora-text-secondary">{text}</span>
  );
}

/** Contains `fixed inset-0` modals: the transform makes fixed positioning
 *  resolve against this box instead of the viewport. */
function ModalStage({ label, width, height, children }: { label: string; width: number; height: number; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col gap-2 shrink-0 m-0">
      <figcaption className="text-[12px] font-medium text-panora-text-secondary">{label}</figcaption>
      <div
        style={{ width, height, transform: "translateZ(0)" }}
        className="veos-stage relative rounded-xl overflow-hidden border border-panora-border bg-white"
      >
        {children}
      </div>
    </figure>
  );
}

function FieldStage({ label, height, children }: { label: string; height: number; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col gap-2 shrink-0 m-0 w-[440px]">
      <figcaption className="text-[12px] font-medium text-panora-text-secondary">{label}</figcaption>
      <div style={{ minHeight: height }} className="rounded-xl border border-panora-border bg-white p-5">
        {children}
      </div>
    </figure>
  );
}

/** Local copy of the preparation pages' EtudeDraftChip — capture only. */
function EtudeDraftChip({ title, number, erpName }: { title: string; number: string; erpName: string }) {
  return (
    <div className="flex items-center gap-3 h-12 px-3 bg-white border border-panora-green-border rounded-lg shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
      <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-panora-green-light border border-panora-green-border text-panora-green-dark">
        <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col min-w-0 flex-1 leading-tight">
        <span className="text-[13px] font-medium text-panora-text truncate">{title}</span>
        <span className="text-[11px] text-panora-text-muted truncate">
          {number} · Sera créée dans {erpName}
        </span>
      </div>
      <button type="button" className="flex items-center justify-center w-6 h-6 rounded-md text-panora-text-muted" aria-label="Modifier">
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button type="button" className="flex items-center justify-center w-6 h-6 rounded-md text-panora-text-muted" aria-label="Annuler la création">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
