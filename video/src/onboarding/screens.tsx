import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, sans, serif, shadowCard, shadowFloat } from "./theme";
import {
  Bullet,
  Caption,
  Check,
  Cursor,
  Field,
  Flower,
  GhostButton,
  Green,
  PrimaryButton,
  Rise,
  SignupFrame,
  Sub,
  Title,
  Wordmark,
} from "./kit";
import { AppShell } from "./appshell";

const FOOTER_CTA: [number, number] = [1052, 1004];
const startCursor: [number, number] = [880, 560];

/* ============================================================== */
/* Act title cards                                                */
/* ============================================================== */

export const TitleCard: React.FC<{
  kicker: string;
  title: string;
  sub: string;
  tone?: "admin" | "collab";
  index: string;
}> = ({ kicker, title, sub, tone = "admin", index }) => {
  const accent = tone === "collab" ? C.purple : C.green;
  return (
    <AbsoluteFill
      style={{
        background: C.deep,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(90% 60% at 50% 30%, rgba(0,162,114,0.30), transparent 60%)",
        }}
      />
      <Rise delay={2} style={{ position: "relative", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
          <Flower size={64} color="rgba(255,255,255,0.92)" />
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: accent === C.purple ? "#c9a5ec" : "#7fd8ba",
            marginBottom: 14,
          }}
        >
          {index} · {kicker}
        </div>
        <div
          style={{
            fontFamily: serif,
            fontSize: 74,
            color: C.white,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 22,
            color: "rgba(255,255,255,0.7)",
            marginTop: 20,
          }}
        >
          {sub}
        </div>
      </Rise>
    </AbsoluteFill>
  );
};

/* ============================================================== */
/* Right-panel visuals                                            */
/* ============================================================== */

const PanelCard: React.FC<{ children: React.ReactNode; w?: number }> = ({
  children,
  w = 320,
}) => (
  <div
    style={{
      width: w,
      background: C.white,
      borderRadius: 14,
      boxShadow: shadowFloat,
      padding: 16,
    }}
  >
    {children}
  </div>
);

const WorkspacePreview = () => (
  <PanelCard>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <Flower size={18} />
      <span style={{ fontFamily: serif, fontSize: 17, color: C.text }}>Panora</span>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: C.drop,
        borderRadius: 8,
        padding: "8px 10px",
        marginBottom: 14,
      }}
    >
      <div style={{ width: 20, height: 20, borderRadius: 6, background: C.nav }} />
      <span style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.text }}>
        CEGEAS
      </span>
      <span style={{ marginLeft: "auto", color: C.muted }}>⌄</span>
    </div>
    <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 8 }}>
      Vos assistants IA
    </div>
    {["Centre de pilotage", "Assistant cotation", "Assistant analyse", "Assistant support"].map(
      (l) => (
        <div key={l} style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 0" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: C.green }} />
          <span style={{ fontFamily: sans, fontSize: 14, color: C.muted }}>{l}</span>
        </div>
      ),
    )}
  </PanelCard>
);

const VeosPreview = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 320 }}>
    <PanelCard>
      <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 700, color: C.text }}>VEOS</div>
      <div style={{ fontFamily: sans, fontSize: 13, color: C.muted, marginTop: 4 }}>
        Panora synchronise vos clients, contrats et documents.
      </div>
    </PanelCard>
    <div
      style={{
        background: C.deep,
        color: C.white,
        borderRadius: 12,
        padding: "10px 14px",
        fontFamily: sans,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      Assistants IA prêts à agir
    </div>
    <PanelCard>
      {[
        ["Client retrouvé : Atelier Arkos", "Dossier pré-rempli"],
        ["Contrat RC Pro détecté", "Analyse prête à lancer"],
      ].map(([a, b]) => (
        <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
          <span style={{ fontFamily: sans, fontSize: 12.5, color: C.muted }}>{a}</span>
          <span style={{ fontFamily: sans, fontSize: 12.5, color: C.greenDark, fontWeight: 600 }}>
            {b}
          </span>
        </div>
      ))}
    </PanelCard>
  </div>
);

const AgentsPreview = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 330 }}>
    <div style={{ fontFamily: sans, fontSize: 16, fontWeight: 600, color: C.white }}>
      Pilotez vos assistants IA
    </div>
    {[
      ["Agent Cotation", "2/4 devis reçus", C.purple, 0.55],
      ["Agent Analyse", "Comparaison prête", C.warning, 0.8],
    ].map(([name, badge, col, pct]) => (
      <PanelCard key={name as string} w={330}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: sans, fontSize: 14.5, fontWeight: 600, color: C.text }}>
            {name}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: sans,
              fontSize: 12,
              fontWeight: 600,
              color: col as string,
              background: `${col}1a`,
              padding: "3px 9px",
              borderRadius: 999,
            }}
          >
            {badge}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: C.drop, marginTop: 12 }}>
          <div
            style={{
              width: `${(pct as number) * 100}%`,
              height: "100%",
              borderRadius: 999,
              background: col as string,
            }}
          />
        </div>
      </PanelCard>
    ))}
  </div>
);

const JoinPreview = () => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: 999,
        margin: "0 auto 20px",
        background: "linear-gradient(140deg,#7b68ee,#6d5ef0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: serif,
        fontSize: 40,
        color: C.white,
        boxShadow: shadowFloat,
      }}
    >
      C
    </div>
    <div style={{ fontFamily: sans, fontSize: 16, color: "rgba(255,255,255,0.85)" }}>
      8 membres dans cet espace
    </div>
  </div>
);

/* ============================================================== */
/* Signup screens                                                 */
/* ============================================================== */

export const AuthScreen: React.FC<{ dur: number }> = ({ dur }) => (
  <>
    <SignupFrame centered right={<div />}>
      <div style={{ width: 420 }}>
        <Rise>
          <Title>
            Créez votre compte <Green>gratuit</Green>
          </Title>
          <Sub>Pas de carte bancaire requise.</Sub>
        </Rise>
        <Rise delay={8} style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 10 }}>
          <GhostButton label="Continuer avec Google" icon="G" />
          <GhostButton label="Continuer avec Microsoft" icon="⊞" />
        </Rise>
        <Rise delay={14} style={{ margin: "18px 0", textAlign: "center", fontFamily: sans, fontSize: 13, color: C.muted }}>
          Ou continuer avec votre e-mail
        </Rise>
        <Rise delay={18}>
          <Field label="Adresse e-mail professionnelle" value="benjamin@cegeas.fr" focus />
        </Rise>
        <Rise delay={24} style={{ marginTop: 16 }}>
          <PrimaryButton label="Créer mon compte" wide />
        </Rise>
      </div>
    </SignupFrame>
    <Cursor from={startCursor} to={[700, 760]} moveStart={26} moveEnd={dur - 16} clickAt={dur - 12} />
    <Caption tag="Admin · 1" title="Création de compte" sub="E-mail pro, SSO Google / Microsoft — sans carte bancaire." />
  </>
);

export const OtpScreen: React.FC<{ dur: number; join?: boolean }> = ({ dur, join }) => {
  const frame = useCurrentFrame();
  const filled = Math.min(6, Math.floor(interpolate(frame, [10, dur - 20], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  return (
    <>
      <SignupFrame centered right={<div />}>
        <div style={{ width: 460, textAlign: "center" }}>
          <Rise style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 52 }}>✉️</div>
          </Rise>
          <Rise delay={6}>
            <Title size={30}>{join ? "Vérifiez votre adresse e-mail" : "Jetez un coup d'œil à vos e-mails"}</Title>
            <Sub>
              {join
                ? "Pour rejoindre CEGEAS, saisissez le code — aucun mot de passe à créer."
                : "Un lien magique + le code ci-dessous vous attendent."}
            </Sub>
          </Rise>
          <Rise delay={14} style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 26 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 52,
                  height: 62,
                  borderRadius: 10,
                  border: `1px solid ${i < filled ? C.green : C.inputBorder}`,
                  boxShadow: i === filled ? `0 0 0 3px ${C.greenLight}` : shadowCard,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: sans,
                  fontSize: 26,
                  fontWeight: 600,
                  color: C.text,
                  background: C.white,
                }}
              >
                {i < filled ? String("204815"[i]) : ""}
              </div>
            ))}
          </Rise>
          <Rise delay={22} style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
            <PrimaryButton label={join ? "Rejoindre l'espace" : "Finaliser la création du compte"} />
          </Rise>
        </div>
      </SignupFrame>
      <Caption
        tag={join ? "Collab · 2" : "Admin · 2"}
        title="Vérification e-mail"
        sub="Code à 6 chiffres — lien magique, pas de mot de passe."
        tone={join ? "collab" : "admin"}
      />
    </>
  );
};

export const WorkspaceScreen: React.FC<{ dur: number; collab?: boolean }> = ({ dur, collab }) => (
  <>
    <SignupFrame
      right={collab ? <JoinPreview /> : <WorkspacePreview />}
      footer={{ back: true, cta: "Étape suivante" }}
    >
      <div style={{ width: 500 }}>
        <Rise>
          <Title size={30}>
            {collab ? (
              <>
                <Green>Parlez-nous</Green> de vous
              </>
            ) : (
              <>
                <Green>Personnalisez</Green> votre workspace
              </>
            )}
          </Title>
          <Sub>
            {collab
              ? "Votre profil au sein de CEGEAS, visible par vos collègues."
              : "Dites-nous en plus sur qui vous êtes et votre cabinet."}
          </Sub>
        </Rise>
        <Rise delay={10} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {!collab && <Field label="Nom du cabinet" value="CEGEAS" />}
          <div style={{ display: "flex", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <Field label="Prénom" value={collab ? "Camille" : "Benjamin"} />
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Nom" value={collab ? "Rousseau" : "Perrier"} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {!collab && (
              <div style={{ flex: 1 }}>
                <Field label="Structure" value="Cabinet de courtage" />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <Field label="Rôle" value={collab ? "Chargé de clientèle" : "Fondateur / Dirigeant"} />
            </div>
          </div>
        </Rise>
      </div>
    </SignupFrame>
    <Cursor from={startCursor} to={FOOTER_CTA} moveStart={dur - 40} moveEnd={dur - 14} clickAt={dur - 10} />
    <Caption
      tag={collab ? "Collab · 3" : "Admin · 3"}
      title={collab ? "Validation du profil" : "Profil & cabinet"}
      sub={collab ? "Nom et rôle pré-remplis depuis l'invitation — le collaborateur valide." : "Cabinet, structure, rôle — l'admin configure l'organisation."}
      tone={collab ? "collab" : "admin"}
    />
  </>
);

export const VeosScreen: React.FC<{ dur: number }> = ({ dur }) => (
  <>
    <SignupFrame right={<VeosPreview />} footer={{ back: true, cta: "Étape suivante" }}>
      <div style={{ width: 500 }}>
        <Rise>
          <Title size={30}>
            Connectez votre <Green>ERP VEOS</Green>
          </Title>
          <Sub>En connectant votre environnement VEOS, Panora :</Sub>
        </Rise>
        <Rise delay={8} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <Bullet>Retrouve vos clients et contrats sans ressaisie</Bullet>
          <Bullet>Donne un contexte réel à vos assistants IA</Bullet>
          <Bullet>Pré-remplit vos demandes de cotation</Bullet>
          <Bullet>Chaque action reste soumise à votre validation</Bullet>
        </Rise>
        <Rise delay={18} style={{ marginTop: 22, display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Field label="URL de l'environnement" value="https://veos.cegeas.com" />
          </div>
        </Rise>
        <Rise delay={22} style={{ marginTop: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: sans,
              fontSize: 13,
              color: C.muted,
            }}
          >
            🔒 Données en Europe · DDA / RGPD · chiffrées · pas d'entraînement
          </div>
        </Rise>
      </div>
    </SignupFrame>
    <Caption tag="Admin · 4" title="Connexion ERP VEOS" sub="Synchronise clients & contrats. Skippable — le collaborateur ne la voit jamais." />
  </>
);

const Surface: React.FC<{ type: string; name: string; caps: string[]; soon?: number }> = ({
  type,
  name,
  caps,
  soon,
}) => (
  <div
    style={{
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      background: C.white,
      boxShadow: shadowCard,
      padding: 16,
    }}
  >
    <div style={{ fontFamily: sans, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted }}>
      {type}
    </div>
    <div style={{ fontFamily: sans, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 10 }}>
      {name}
    </div>
    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      {caps.map((c, i) => (
        <div key={c} style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Check size={16} />
          <span style={{ fontFamily: sans, fontSize: 13.5, color: C.text }}>{c}</span>
          {soon === i && (
            <span
              style={{
                marginLeft: "auto",
                fontFamily: sans,
                fontSize: 11,
                fontWeight: 600,
                color: C.muted,
                border: `1px solid ${C.border}`,
                borderRadius: 999,
                padding: "2px 8px",
              }}
            >
              Bientôt
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export const AgentsScreen: React.FC<{ dur: number; collab?: boolean }> = ({ dur, collab }) => (
  <>
    <SignupFrame right={<AgentsPreview />} footer={{ back: true, cta: "Étape suivante" }}>
      <div style={{ width: 520 }}>
        <Rise>
          <Title size={28}>
            Découvrez votre <Green>équipe d'assistants</Green> IA
          </Title>
          <Sub>Trois surfaces qui couvrent votre dossier de bout en bout, activées selon votre cabinet.</Sub>
        </Rise>
        <Rise delay={8} style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 11 }}>
          <Surface type="Agent autonome" name="Collecte & Cotation" caps={["Déclenchement par e-mail", "Extranets assureurs interrogés", "Suivi des devis et alertes"]} />
          <Surface type="Assistant" name="Comparaison & Synthèse" caps={["Analyse : garanties, franchises, exclusions", "Comparaison poste par poste", "Synthèse client : écarts et trous de garantie"]} />
          <Surface type="Production" name="Partage & Conseil" caps={["Présentation au branding du cabinet", "Documents personnalisés", "Devoir de conseil conforme"]} soon={2} />
        </Rise>
        <Rise delay={16} style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, background: C.greenLight, borderRadius: 14, padding: "12px 16px" }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <span style={{ fontFamily: sans, fontSize: 13.5, color: C.text }}>
            <b>Et partout, Ask</b> — une question sur n'importe quel contrat, devis ou comparatif.
          </span>
        </Rise>
      </div>
    </SignupFrame>
    <Caption
      tag={collab ? "Collab · 4" : "Admin · 5"}
      title="Équipe d'assistants"
      sub="Surfaces corrélées aux feature flags de l'organisation — absentes plutôt que verrouillées."
      tone={collab ? "collab" : "admin"}
    />
  </>
);

export const InviteScreen: React.FC<{ dur: number; collab?: boolean }> = ({ dur, collab }) => (
  <>
    <SignupFrame right={<div />} footer={{ back: true, cta: "Accéder à mon espace" }}>
      <div style={{ width: 480 }}>
        <Rise>
          <Title size={30}>
            Invitez vos <Green>collègues</Green>
          </Title>
          <Sub>Votre espace est prêt. Ajoutez les collègues qui pourraient être intéressés par Panora.</Sub>
        </Rise>
        <Rise delay={10} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Adresse e-mail professionnelle" value="marie@cegeas.fr" />
          <Field label="" value="thomas@cegeas.fr" />
          <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.green }}>
            + Ajouter une autre invitation
          </div>
        </Rise>
      </div>
    </SignupFrame>
    <Cursor from={startCursor} to={FOOTER_CTA} moveStart={dur - 42} moveEnd={dur - 14} clickAt={dur - 10} />
    <Caption
      tag={collab ? "Collab · 5" : "Admin · 6"}
      title="Inviter l'équipe"
      sub="Étape non bloquante — « Accéder à mon espace » mène au hub."
      tone={collab ? "collab" : "admin"}
    />
  </>
);

export const JoinScreen: React.FC<{ dur: number }> = ({ dur }) => (
  <>
    <SignupFrame centered right={<div />}>
      <div style={{ width: 460, textAlign: "center" }}>
        <Rise style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 999,
              background: "linear-gradient(140deg,#7b68ee,#6d5ef0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: serif,
              fontSize: 36,
              color: C.white,
            }}
          >
            C
          </div>
        </Rise>
        <Rise delay={6}>
          <div style={{ fontFamily: sans, fontSize: 15, color: C.muted, marginBottom: 8 }}>
            Benjamin Perrier vous a invité·e à rejoindre
          </div>
          <Title size={32}>
            CEGEAS <Green>sur Panora</Green>
          </Title>
          <Sub>Vos collègues ont déjà configuré l'espace — aucun compte à créer, rejoignez-les et commencez à coter.</Sub>
        </Rise>
        <Rise delay={14} style={{ marginTop: 22 }}>
          <div
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              textAlign: "left",
            }}
          >
            <span style={{ fontSize: 16 }}>✉️</span>
            <span style={{ fontFamily: sans, fontSize: 14, color: C.text }}>camille.rousseau@cegeas.fr</span>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: sans,
                fontSize: 11,
                fontWeight: 700,
                color: C.greenDark,
                background: C.greenLight,
                borderRadius: 999,
                padding: "3px 9px",
              }}
            >
              Invité·e
            </span>
          </div>
        </Rise>
        <Rise delay={20} style={{ marginTop: 20 }}>
          <PrimaryButton label="Rejoindre l'espace" wide />
        </Rise>
      </div>
    </SignupFrame>
    <Cursor from={startCursor} to={[700, 800]} moveStart={dur - 42} moveEnd={dur - 14} clickAt={dur - 10} />
    <Caption tag="Collab · 1" title="Rejoindre l'organisation" sub="Identité issue de l'invitation — pas de création de compte, cabinet déjà configuré." tone="collab" />
  </>
);

/* ============================================================== */
/* Prise en main (hub)                                            */
/* ============================================================== */

const Task: React.FC<{ label: string; sub: string; done: boolean; cta?: boolean; admin?: boolean }> = ({
  label,
  sub,
  done,
  cta,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      background: C.white,
      padding: "14px 16px",
      boxShadow: shadowCard,
    }}
  >
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 999,
        background: done ? C.green : C.white,
        border: done ? "none" : `1.5px solid ${C.inputBorder}`,
        color: C.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      {done ? "✓" : ""}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: sans, fontSize: 15, fontWeight: 600, color: C.text }}>{label}</div>
      <div style={{ fontFamily: sans, fontSize: 13, color: C.muted }}>{sub}</div>
    </div>
    {cta && (
      <div
        style={{
          fontFamily: sans,
          fontSize: 14,
          fontWeight: 600,
          color: C.white,
          background: C.green,
          borderRadius: 9,
          padding: "8px 16px",
        }}
      >
        Démarrer →
      </div>
    )}
  </div>
);

export const HubScreen: React.FC<{ dur: number; collab?: boolean }> = ({ dur, collab }) => {
  const frame = useCurrentFrame();
  const done = collab ? 1 : 2;
  const total = collab ? 4 : 6;
  const grow = interpolate(frame, [10, 40], [0, done / total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const prenom = collab ? "Camille" : "Benjamin";
  return (
    <>
      <AppShell prenom={prenom} progress={0.35} bg={C.bg}>
        <div style={{ padding: "46px 60px", height: "100%", overflow: "hidden" }}>
          <Rise>
            <h1 style={{ fontFamily: serif, fontSize: 34, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
              Bienvenue {prenom}, ravis de vous compter parmi nous
            </h1>
          </Rise>
          <Rise delay={8} style={{ marginTop: 26, maxWidth: 780 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <span style={{ fontFamily: sans, fontSize: 18, fontWeight: 600, color: C.text }}>
                Accomplissez vos tâches de prise en main
              </span>
              <span style={{ marginLeft: "auto", fontFamily: sans, fontSize: 14, color: C.muted }}>
                {done}/{total} complétées
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: C.border, marginBottom: 20 }}>
              <div style={{ width: `${grow * 100}%`, height: "100%", borderRadius: 999, background: C.green }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Task done label="Inscription / rejoindre mon organisation" sub="Votre compte est créé et votre espace est prêt" />
              <Task done={done > 1} label="Lancez une première analyse de contrat" sub="Décortiquer un premier contrat" cta={done <= 1} />
              <Task done={false} label="Lancez une première comparaison" sub="Comparez plusieurs devis côte à côte" cta={done > 1} />
              {!collab && (
                <Task done={false} label="Configurer l'agent de cotation" sub="Connectez vos assureurs — réservé à l'admin" admin />
              )}
              <Task done={false} label="Générer et exporter un devoir de conseil" sub="Depuis une analyse, générez puis exportez la synthèse" />
            </div>
          </Rise>
        </div>
      </AppShell>
      <Caption
        tag={collab ? "Collab · 6" : "Admin · 7"}
        title="Prise en main"
        sub={collab ? "Checklist à 4 tâches — pas de configuration cotation pour le collaborateur." : "Checklist à 6 tâches — dont configuration cotation, réservée à l'admin."}
        tone={collab ? "collab" : "admin"}
      />
    </>
  );
};

/* ============================================================== */
/* Home screen                                                    */
/* ============================================================== */

const ActionCard: React.FC<{ icon: string; label: string; sub: string }> = ({ icon, label, sub }) => (
  <div
    style={{
      flex: 1,
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 16,
      padding: 20,
      boxShadow: shadowCard,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(120% 90% at 100% 0%, rgba(0,162,114,0.10), transparent 60%)",
      }}
    />
    <div style={{ position: "relative" }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: C.greenLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          marginBottom: 14,
        }}
      >
        {icon}
      </div>
      <div style={{ fontFamily: sans, fontSize: 17, fontWeight: 600, color: C.text }}>{label}</div>
      <div style={{ fontFamily: sans, fontSize: 13.5, color: C.muted, marginTop: 4 }}>{sub}</div>
    </div>
  </div>
);

export const HomeScreen: React.FC<{ dur: number; prenom?: string }> = ({ prenom = "Benjamin" }) => (
  <>
    <AppShell prenom={prenom} bg={C.bg}>
      <div style={{ padding: "46px 60px" }}>
        <Rise>
          <h1 style={{ fontFamily: serif, fontSize: 34, color: C.text, margin: 0, letterSpacing: "-0.02em" }}>
            Bonjour {prenom}, que souhaitez-vous faire aujourd'hui ?
          </h1>
          <div style={{ fontFamily: sans, fontSize: 15, color: C.muted, marginTop: 8 }}>
            Accédez rapidement à vos outils et suivez votre activité.
          </div>
        </Rise>
        <Rise delay={8} style={{ marginTop: 26, display: "flex", gap: 16, maxWidth: 980 }}>
          <ActionCard icon="🔍" label="Analyser un contrat" sub="Décortiquez un contrat, garanties comprises." />
          <ActionCard icon="⚖️" label="Comparer des devis" sub="Mettez vos devis en vis-à-vis." />
          <ActionCard icon="✉️" label="Lancer une cotation" sub="Vos demandes, portées de bout en bout." />
        </Rise>

        <Rise delay={16} style={{ marginTop: 30, maxWidth: 980 }}>
          <div style={{ fontFamily: sans, fontSize: 18, fontWeight: 600, color: C.text, marginBottom: 14 }}>
            À découvrir
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
            }}
          >
            <div
              style={{
                flex: 1.2,
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 20,
                boxShadow: shadowCard,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 80% at 100% 0%, rgba(0,162,114,0.16), transparent 60%)" }} />
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    fontFamily: sans,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.white,
                    background: C.deep,
                    borderRadius: 999,
                    padding: "4px 11px",
                  }}
                >
                  Nouveau
                </span>
                <div style={{ fontFamily: sans, fontSize: 17, fontWeight: 600, color: C.text, marginTop: 14 }}>
                  Nouvelles fonctionnalités comparaison & agent de tarification
                </div>
                <div style={{ fontFamily: sans, fontSize: 14, fontWeight: 600, color: C.green, marginTop: 14 }}>
                  Tout lire →
                </div>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["📣", "Notre changelog"],
                ["🎓", "Learning Academy"],
                ["💬", "Nous écrire"],
              ].map(([i, l]) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "13px 16px",
                    boxShadow: shadowCard,
                  }}
                >
                  <span style={{ fontSize: 17 }}>{i}</span>
                  <span style={{ fontFamily: sans, fontSize: 15, fontWeight: 500, color: C.text }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </Rise>
      </div>
    </AppShell>
    <Caption tag="Home" title="Écran d'accueil" sub="Après l'onboarding : actions rapides, changelog et activité récente." />
  </>
);

/* ============================================================== */
/* Outro                                                          */
/* ============================================================== */

export const Outro: React.FC = () => (
  <AbsoluteFill style={{ background: C.deep, alignItems: "center", justifyContent: "center" }}>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 60% at 50% 40%, rgba(0,162,114,0.28), transparent 60%)" }} />
    <Rise delay={2} style={{ position: "relative", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <Wordmark color={C.white} size={40} />
      </div>
      <div style={{ fontFamily: serif, fontSize: 46, color: C.white, letterSpacing: "-0.02em" }}>
        De l'invitation au premier devis.
      </div>
      <div style={{ fontFamily: sans, fontSize: 20, color: "rgba(255,255,255,0.7)", marginTop: 16 }}>
        Un onboarding, deux rôles, une équipe d'assistants.
      </div>
    </Rise>
  </AbsoluteFill>
);
