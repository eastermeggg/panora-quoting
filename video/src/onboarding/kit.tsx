import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, sans, serif, shadowCard, shadowFloat } from "./theme";

/* -------------------------------------------------------------- */
/* Animation helpers                                              */
/* -------------------------------------------------------------- */

export const useEnter = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

export const Rise: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 18, children, style }) => {
  const e = useEnter(delay);
  return (
    <div
      style={{
        opacity: e,
        transform: `translateY(${interpolate(e, [0, 1], [y, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* -------------------------------------------------------------- */
/* Brand marks                                                    */
/* -------------------------------------------------------------- */

export const Flower: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = C.green,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <ellipse
        key={a}
        cx={12}
        cy={6}
        rx={3.4}
        ry={5.6}
        fill={color}
        transform={`rotate(${a} 12 12)`}
      />
    ))}
    <circle cx={12} cy={12} r={2.6} fill={C.white} />
  </svg>
);

export const Wordmark: React.FC<{ color?: string; size?: number }> = ({
  color = C.text,
  size = 22,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    <Flower size={size} color={C.green} />
    <span
      style={{
        fontFamily: serif,
        fontSize: size,
        letterSpacing: "-0.02em",
        color,
        fontWeight: 500,
      }}
    >
      Panora
    </span>
  </div>
);

/* -------------------------------------------------------------- */
/* Signup frame — left content column + right green visual panel  */
/* -------------------------------------------------------------- */

export const SignupFrame: React.FC<{
  children: React.ReactNode;
  right?: React.ReactNode;
  centered?: boolean;
  footer?: { back?: boolean; cta: string; ctaCursor?: boolean };
}> = ({ children, right, centered, footer }) => {
  return (
    <AbsoluteFill style={{ background: centered ? C.bg : C.white, padding: 20 }}>
      <div style={{ display: "flex", gap: 20, width: "100%", height: "100%" }}>
        {/* Left column */}
        <div
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ position: "absolute", top: 34, left: 40 }}>
            <Wordmark />
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 72px",
            }}
          >
            {children}
          </div>
          {footer && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: `1px solid ${C.border}`,
                padding: "22px 40px",
              }}
            >
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 15,
                  color: C.muted,
                  fontWeight: 500,
                  opacity: footer.back ? 1 : 0,
                }}
              >
                Précédent
              </div>
              <PrimaryButton label={footer.cta} />
            </div>
          )}
        </div>
        {/* Right visual panel */}
        <div style={{ width: "37%" }}>
          <RightPanel>{right}</RightPanel>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const RightPanel: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      position: "relative",
      width: "100%",
      height: "100%",
      borderRadius: 18,
      overflow: "hidden",
      background: C.deep,
    }}
  >
    {/* aurora glow */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(120% 80% at 50% 8%, rgba(0,162,114,0.42), transparent 60%), radial-gradient(90% 60% at 20% 100%, rgba(120,180,120,0.25), transparent 60%)",
      }}
    />
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 44,
      }}
    >
      {children ?? <Flower size={132} color="rgba(255,255,255,0.9)" />}
    </div>
  </div>
);

/* -------------------------------------------------------------- */
/* Primitives                                                     */
/* -------------------------------------------------------------- */

export const PrimaryButton: React.FC<{ label: string; wide?: boolean }> = ({
  label,
  wide,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      background: C.green,
      color: C.white,
      fontFamily: sans,
      fontSize: 16,
      fontWeight: 600,
      padding: wide ? "14px 0" : "13px 22px",
      width: wide ? "100%" : undefined,
      borderRadius: 10,
      boxShadow: "0 6px 16px rgba(0,162,114,0.28)",
    }}
  >
    {label}
    <span style={{ fontSize: 17, marginTop: -1 }}>→</span>
  </div>
);

export const GhostButton: React.FC<{ label: string; icon?: string }> = ({
  label,
  icon,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      border: `1px solid ${C.inputBorder}`,
      background: C.white,
      color: C.text,
      fontFamily: sans,
      fontSize: 15,
      fontWeight: 500,
      padding: "12px 16px",
      borderRadius: 10,
      boxShadow: shadowCard,
    }}
  >
    {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
    {label}
  </div>
);

export const Field: React.FC<{
  label: string;
  value?: string;
  placeholder?: string;
  focus?: boolean;
}> = ({ label, value, placeholder, focus }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
    <span
      style={{ fontFamily: sans, fontSize: 14, fontWeight: 500, color: C.text }}
    >
      {label}
    </span>
    <div
      style={{
        border: `1px solid ${focus ? C.green : C.inputBorder}`,
        boxShadow: focus
          ? `0 0 0 3px ${C.greenLight}`
          : shadowCard,
        background: C.white,
        borderRadius: 10,
        padding: "13px 15px",
        fontFamily: sans,
        fontSize: 15,
        color: value ? C.text : "#a8a49c",
      }}
    >
      {value || placeholder}
    </div>
  </div>
);

export const Title: React.FC<{
  children: React.ReactNode;
  size?: number;
}> = ({ children, size = 34 }) => (
  <h1
    style={{
      fontFamily: serif,
      fontSize: size,
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
      color: C.text,
      fontWeight: 500,
      margin: 0,
    }}
  >
    {children}
  </h1>
);

export const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p
    style={{
      fontFamily: sans,
      fontSize: 15,
      lineHeight: 1.5,
      color: C.muted,
      margin: "10px 0 0",
    }}
  >
    {children}
  </p>
);

export const Green = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: C.green }}>{children}</span>
);

export const Check: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: 999,
      background: C.greenLight,
      color: C.greenDark,
      fontSize: size * 0.55,
      flexShrink: 0,
    }}
  >
    ✓
  </span>
);

export const Bullet: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
    <Check size={18} />
    <span style={{ fontFamily: sans, fontSize: 15, color: C.text }}>
      {children}
    </span>
  </div>
);

/* -------------------------------------------------------------- */
/* Animated cursor + click ping                                   */
/* -------------------------------------------------------------- */

export const Cursor: React.FC<{
  from: [number, number];
  to: [number, number];
  moveStart: number;
  moveEnd: number;
  clickAt?: number;
}> = ({ from, to, moveStart, moveEnd, clickAt }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [moveStart, moveEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const x = interpolate(t, [0, 1], [from[0], to[0]]);
  const y = interpolate(t, [0, 1], [from[1], to[1]]);
  const press =
    clickAt !== undefined
      ? interpolate(frame, [clickAt - 3, clickAt, clickAt + 6], [1, 0.82, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const ping =
    clickAt !== undefined && frame >= clickAt
      ? interpolate(frame, [clickAt, clickAt + 18], [0, 1], {
          extrapolateRight: "clamp",
        })
      : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 50 }}>
      {ping > 0 && ping < 1 && (
        <div
          style={{
            position: "absolute",
            left: -6,
            top: -6,
            width: 44,
            height: 44,
            marginLeft: -22 + 6,
            marginTop: -22 + 6,
            borderRadius: 999,
            border: `2px solid ${C.green}`,
            opacity: 1 - ping,
            transform: `scale(${0.3 + ping * 1.3})`,
          }}
        />
      )}
      <svg
        width={30}
        height={30}
        viewBox="0 0 24 24"
        style={{ transform: `scale(${press})`, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
      >
        <path
          d="M5 3l14 8-6 1.5 3.5 6.5-3 1.5L10 14l-5 4z"
          fill={C.white}
          stroke={C.text}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/* -------------------------------------------------------------- */
/* Bottom caption bar                                             */
/* -------------------------------------------------------------- */

export const Caption: React.FC<{
  tag: string;
  title: string;
  sub: string;
  tone?: "admin" | "collab";
}> = ({ tag, title, sub, tone = "admin" }) => {
  const e = useEnter(4);
  const accent = tone === "collab" ? C.purple : C.green;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: "50%",
        transform: `translate(-50%, ${interpolate(e, [0, 1], [14, 0])}px)`,
        opacity: e,
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(8px)",
        border: `1px solid ${C.border}`,
        borderRadius: 999,
        padding: "12px 22px 12px 14px",
        boxShadow: shadowFloat,
        zIndex: 60,
      }}
    >
      <span
        style={{
          fontFamily: sans,
          fontSize: 13,
          fontWeight: 700,
          color: C.white,
          background: accent,
          borderRadius: 999,
          padding: "6px 12px",
          letterSpacing: "0.02em",
        }}
      >
        {tag}
      </span>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span
          style={{ fontFamily: sans, fontSize: 17, fontWeight: 600, color: C.text }}
        >
          {title}
        </span>
        <span style={{ fontFamily: sans, fontSize: 14, color: C.muted }}>
          {sub}
        </span>
      </div>
    </div>
  );
};
