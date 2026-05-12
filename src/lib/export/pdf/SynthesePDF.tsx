"use client";

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import {
  BrandingSettings,
  getOnColorPalette,
  getTitleFontOption,
} from "@/data/branding";
import { MdBlock, MdSpan, parseMarkdownBlocks } from "../markdown";

const FONTSOURCE = "https://cdn.jsdelivr.net/fontsource/fonts";

// Body font — always Inter (regular + italic across weights)
Font.register({
  family: "Inter",
  fonts: [
    { src: `${FONTSOURCE}/inter@latest/latin-400-normal.ttf`, fontWeight: 400, fontStyle: "normal" },
    { src: `${FONTSOURCE}/inter@latest/latin-500-normal.ttf`, fontWeight: 500, fontStyle: "normal" },
    { src: `${FONTSOURCE}/inter@latest/latin-600-normal.ttf`, fontWeight: 600, fontStyle: "normal" },
    { src: `${FONTSOURCE}/inter@latest/latin-700-normal.ttf`, fontWeight: 700, fontStyle: "normal" },
    { src: `${FONTSOURCE}/inter@latest/latin-400-italic.ttf`, fontWeight: 400, fontStyle: "italic" },
    { src: `${FONTSOURCE}/inter@latest/latin-500-italic.ttf`, fontWeight: 500, fontStyle: "italic" },
    { src: `${FONTSOURCE}/inter@latest/latin-600-italic.ttf`, fontWeight: 600, fontStyle: "italic" },
    { src: `${FONTSOURCE}/inter@latest/latin-700-italic.ttf`, fontWeight: 700, fontStyle: "italic" },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const registeredTitleFonts = new Set<string>();
function ensureTitleFontRegistered(fontName: string) {
  if (registeredTitleFonts.has(fontName)) return;
  const opt = getTitleFontOption(fontName);
  // Skip Inter — already registered above
  if (opt.name === "Inter") {
    registeredTitleFonts.add(fontName);
    return;
  }
  Font.register({
    family: opt.name,
    fonts: [
      { src: opt.regularTtfUrl, fontWeight: 400 },
      { src: opt.mediumTtfUrl, fontWeight: 600 },
    ],
  });
  registeredTitleFonts.add(fontName);
}

interface SynthesePDFProps {
  branding: BrandingSettings;
  clientName: string;
  productLabel: string;
  syntheseMarkdown: string;
}

export function SynthesePDFDocument({
  branding,
  clientName,
  productLabel,
  syntheseMarkdown,
}: SynthesePDFProps) {
  ensureTitleFontRegistered(branding.titleFont);
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const blocks = parseMarkdownBlocks(syntheseMarkdown);

  const styles = makeStyles(branding);

  return (
    <Document title={`${clientName} - Synthèse`} author="Panora">
      {/* Cover page */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverBanner}>
          <Text style={styles.coverEyebrow}>SYNTHÈSE COMPARATIVE</Text>
          <Text style={styles.coverTitle}>
            Proposition{"\n"}d&apos;assurance {productLabel}
          </Text>
        </View>
        <View style={styles.coverMiddle}>
          <View>
            <Text style={styles.coverLabel}>PRÉPARÉ POUR</Text>
            <Text style={styles.coverClient}>{clientName}</Text>
          </View>
          <Text style={styles.coverDesc}>
            Étude personnalisée · {productLabel}.{"\n"}Comparatif des garanties, franchises et exclusions sur les porteurs de risque retenus.
          </Text>
        </View>
        <View style={styles.coverFooter}>
          {branding.logoDataUrl ? (
            <Image src={branding.logoDataUrl} style={styles.coverLogo} />
          ) : (
            <Text style={styles.coverLogoFallback}>VOTRE LOGO</Text>
          )}
          <Text style={styles.coverDate}>ÉDITÉ LE {today.replace(/\//g, "/")}</Text>
        </View>
      </Page>

      {/* Content pages */}
      <Page size="A4" style={styles.contentPage} wrap>
        {blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} styles={styles} />
        ))}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}

interface PdfStyles {
  coverPage: ReturnType<typeof StyleSheet.create>[string];
  coverBanner: ReturnType<typeof StyleSheet.create>[string];
  coverEyebrow: ReturnType<typeof StyleSheet.create>[string];
  coverTitle: ReturnType<typeof StyleSheet.create>[string];
  coverMiddle: ReturnType<typeof StyleSheet.create>[string];
  coverLabel: ReturnType<typeof StyleSheet.create>[string];
  coverClient: ReturnType<typeof StyleSheet.create>[string];
  coverDesc: ReturnType<typeof StyleSheet.create>[string];
  coverFooter: ReturnType<typeof StyleSheet.create>[string];
  coverLogo: ReturnType<typeof StyleSheet.create>[string];
  coverLogoFallback: ReturnType<typeof StyleSheet.create>[string];
  coverDate: ReturnType<typeof StyleSheet.create>[string];
  contentPage: ReturnType<typeof StyleSheet.create>[string];
  h1: ReturnType<typeof StyleSheet.create>[string];
  h2: ReturnType<typeof StyleSheet.create>[string];
  h3: ReturnType<typeof StyleSheet.create>[string];
  paragraph: ReturnType<typeof StyleSheet.create>[string];
  bullet: ReturnType<typeof StyleSheet.create>[string];
  bulletText: ReturnType<typeof StyleSheet.create>[string];
  table: ReturnType<typeof StyleSheet.create>[string];
  tableRow: ReturnType<typeof StyleSheet.create>[string];
  tableHeaderRow: ReturnType<typeof StyleSheet.create>[string];
  tableCell: ReturnType<typeof StyleSheet.create>[string];
  tableHeaderCell: ReturnType<typeof StyleSheet.create>[string];
  hr: ReturnType<typeof StyleSheet.create>[string];
  bold: ReturnType<typeof StyleSheet.create>[string];
  italic: ReturnType<typeof StyleSheet.create>[string];
  code: ReturnType<typeof StyleSheet.create>[string];
  pageNumber: ReturnType<typeof StyleSheet.create>[string];
}

function makeStyles(branding: BrandingSettings): PdfStyles {
  const titleFamily = getTitleFontOption(branding.titleFont).name;
  const banner = getOnColorPalette(branding.primaryColor);
  // Hex variants for @react-pdf (which handles solid colors more reliably than rgba)
  const bannerFg = banner.isDark ? "#ffffff" : "#0e1116";
  const bannerFgMuted = banner.isDark ? "#fafaf7" : "#0e1116";
  const bannerMutedOpacity = banner.isDark ? 0.55 : 0.55;
  return StyleSheet.create({
    coverPage: {
      flexDirection: "column",
      backgroundColor: "#ffffff",
      fontFamily: "Inter",
    },
    coverBanner: {
      backgroundColor: branding.primaryColor,
      flexGrow: 0,
      flexShrink: 0,
      height: 530,
      padding: 40,
      flexDirection: "column",
      justifyContent: "space-between",
      color: "#fafaf7",
    },
    coverEyebrow: {
      fontFamily: "Inter",
      fontWeight: 500,
      fontSize: 7.5,
      letterSpacing: 1.4,
      color: bannerFgMuted,
      opacity: bannerMutedOpacity,
    },
    coverTitle: {
      fontFamily: titleFamily,
      fontWeight: 400,
      fontSize: 54,
      letterSpacing: -0.8,
      lineHeight: 1.05,
      color: bannerFg,
    },
    coverMiddle: {
      flexGrow: 1,
      flexShrink: 1,
      paddingHorizontal: 40,
      paddingTop: 44,
      paddingBottom: 30,
      flexDirection: "column",
      gap: 14,
    },
    coverLabel: {
      fontFamily: "Inter",
      fontWeight: 500,
      fontSize: 7.5,
      letterSpacing: 1.4,
      color: "#0e1116",
      opacity: 0.5,
      marginBottom: 6,
    },
    coverClient: {
      fontFamily: "Inter",
      fontWeight: 600,
      fontSize: 26,
      letterSpacing: -0.5,
      color: "#0e1116",
    },
    coverDesc: {
      fontFamily: "Inter",
      fontSize: 11,
      lineHeight: 1.5,
      color: "#0e1116",
      marginTop: 6,
    },
    coverFooter: {
      flexGrow: 0,
      flexShrink: 0,
      borderTopWidth: 1,
      borderTopColor: "#eae7e0",
      paddingHorizontal: 40,
      paddingVertical: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    coverLogo: {
      height: 18,
      maxWidth: 160,
      objectFit: "contain",
    },
    coverLogoFallback: {
      fontFamily: "Inter",
      fontSize: 10,
      letterSpacing: 1.6,
      color: "#0e1116",
      opacity: 0.35,
    },
    coverDate: {
      fontFamily: "Inter",
      fontWeight: 500,
      fontSize: 7.5,
      letterSpacing: 1.4,
      color: "#0e1116",
      opacity: 0.5,
    },
    contentPage: {
      flexDirection: "column",
      backgroundColor: "#ffffff",
      paddingHorizontal: 48,
      paddingTop: 56,
      paddingBottom: 60,
      fontFamily: "Inter",
      color: "#22201a",
      fontSize: 10,
      lineHeight: 1.5,
    },
    h1: {
      fontFamily: "Inter",
      fontSize: 22,
      fontWeight: 600,
      color: "#22201a",
      marginBottom: 12,
      marginTop: 4,
    },
    h2: {
      fontFamily: "Inter",
      fontSize: 14,
      fontWeight: 600,
      color: "#22201a",
      marginTop: 18,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#eae7e0",
      paddingBottom: 4,
    },
    h3: {
      fontFamily: "Inter",
      fontSize: 11,
      fontWeight: 600,
      color: "#22201a",
      marginTop: 10,
      marginBottom: 4,
    },
    paragraph: {
      fontSize: 10,
      lineHeight: 1.55,
      marginBottom: 6,
      color: "#22201a",
    },
    bullet: {
      flexDirection: "row",
      marginBottom: 3,
      paddingLeft: 4,
    },
    bulletText: {
      fontSize: 10,
      lineHeight: 1.55,
      color: "#22201a",
      flex: 1,
    },
    table: {
      marginVertical: 8,
      borderWidth: 1,
      borderColor: "#eae7e0",
      borderRadius: 3,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#eae7e0",
    },
    tableHeaderRow: {
      flexDirection: "row",
      backgroundColor: "#faf8f5",
      borderBottomWidth: 1,
      borderBottomColor: "#eae7e0",
    },
    tableCell: {
      flex: 1,
      paddingHorizontal: 6,
      paddingVertical: 5,
      fontSize: 9,
      color: "#22201a",
      borderRightWidth: 1,
      borderRightColor: "#eae7e0",
    },
    tableHeaderCell: {
      flex: 1,
      paddingHorizontal: 6,
      paddingVertical: 5,
      fontSize: 9,
      fontWeight: 600,
      color: "#22201a",
      borderRightWidth: 1,
      borderRightColor: "#eae7e0",
    },
    hr: {
      borderBottomWidth: 1,
      borderBottomColor: "#eae7e0",
      marginVertical: 10,
    },
    bold: {
      fontWeight: 700,
    },
    italic: {
      fontStyle: "italic",
    },
    code: {
      fontFamily: "Inter",
      fontSize: 9,
      backgroundColor: "#f4f1eb",
    },
    pageNumber: {
      position: "absolute",
      bottom: 28,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: "Inter",
      fontSize: 8,
      color: "#85827b",
    },
  });
}

function BlockRenderer({ block, styles }: { block: MdBlock; styles: PdfStyles }) {
  if (block.type === "heading") {
    const style =
      block.depth === 1 ? styles.h1 : block.depth === 2 ? styles.h2 : styles.h3;
    return <Text style={style}>{block.text}</Text>;
  }
  if (block.type === "paragraph") {
    return (
      <Text style={styles.paragraph}>
        <SpanRenderer spans={block.spans} styles={styles} />
      </Text>
    );
  }
  if (block.type === "list") {
    return (
      <View style={{ marginBottom: 6 }}>
        {block.items.map((spans, idx) => (
          <View key={idx} style={styles.bullet}>
            <Text style={{ ...styles.bulletText, flex: 0, width: 12 }}>
              {block.ordered ? `${idx + 1}.` : "•"}
            </Text>
            <Text style={styles.bulletText}>
              <SpanRenderer spans={spans} styles={styles} />
            </Text>
          </View>
        ))}
      </View>
    );
  }
  if (block.type === "table") {
    return (
      <View style={styles.table} wrap={false}>
        <View style={styles.tableHeaderRow}>
          {block.header.map((cell, i) => (
            <Text
              key={i}
              style={
                i === block.header.length - 1
                  ? { ...styles.tableHeaderCell, borderRightWidth: 0 }
                  : styles.tableHeaderCell
              }
            >
              {cell}
            </Text>
          ))}
        </View>
        {block.rows.map((row, ri) => (
          <View
            key={ri}
            style={
              ri === block.rows.length - 1
                ? { ...styles.tableRow, borderBottomWidth: 0 }
                : styles.tableRow
            }
          >
            {row.map((cell, ci) => (
              <Text
                key={ci}
                style={
                  ci === row.length - 1
                    ? { ...styles.tableCell, borderRightWidth: 0 }
                    : styles.tableCell
                }
              >
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </View>
    );
  }
  if (block.type === "hr") {
    return <View style={styles.hr} />;
  }
  if (block.type === "blockquote") {
    return (
      <View
        style={{
          borderLeftWidth: 2,
          borderLeftColor: "#eae7e0",
          paddingLeft: 8,
          marginVertical: 6,
        }}
      >
        <Text style={styles.paragraph}>
          <SpanRenderer spans={block.spans} styles={styles} />
        </Text>
      </View>
    );
  }
  return null;
}

function SpanRenderer({ spans, styles }: { spans: MdSpan[]; styles: PdfStyles }) {
  return (
    <>
      {spans.map((span, i) => {
        if (span.kind === "bold")
          return (
            <Text key={i} style={styles.bold}>
              {span.value}
            </Text>
          );
        if (span.kind === "italic")
          return (
            <Text key={i} style={styles.italic}>
              {span.value}
            </Text>
          );
        if (span.kind === "code")
          return (
            <Text key={i} style={styles.code}>
              {span.value}
            </Text>
          );
        return <Text key={i}>{span.value}</Text>;
      })}
    </>
  );
}
