"use client";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ShadingType,
  PageOrientation,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeightRule,
  BorderStyle,
  ImageRun,
  Footer,
  VerticalAlign,
  TableLayoutType,
  TabStopType,
} from "docx";
import { BrandingSettings, getLogoDimensions } from "@/data/branding";
import { MdBlock, MdSpan, parseMarkdownBlocks } from "../markdown";

interface SyntheseDocxOpts {
  branding: BrandingSettings;
  clientName: string;
  productLabel: string;
  syntheseMarkdown: string;
}

// A4 dimensions
const PAGE_WIDTH = 11906; // 8.27" × 1440 twips/in
const PAGE_HEIGHT = 16838; // 11.69" × 1440

// Cover section — zero margins for full bleed
const COVER_MARGIN = 0;

// Content section — normal margins
const CONTENT_MARGIN = 1080; // ~0.75"
const CONTENT_WIDTH = PAGE_WIDTH - 2 * CONTENT_MARGIN;

// Cover row heights (twips). A4 = 16838 twips. Sum stays slightly under so Word
// has no excuse to overflow into a second page — also gives breathing room for
// implicit section markers.
const COVER_BANNER_HEIGHT = 10400;
const COVER_MIDDLE_HEIGHT = 5300;
const COVER_FOOTER_HEIGHT = 900;
// Total: 16600 twips (236 twips ≈ 12pt below the A4 ceiling).

// Inner padding inside the cover banner / middle (twips)
const COVER_INNER_PAD = 800;

function hexFromCssColor(color: string): string {
  return color.replace("#", "").toUpperCase();
}

async function logoImageData(
  logoDataUrl: string | null
): Promise<{ bytes: Uint8Array; type: "png" | "jpg" } | null> {
  if (!logoDataUrl) return null;
  try {
    const isSvg = logoDataUrl.startsWith("data:image/svg");
    if (isSvg) return null;
    const base64 = logoDataUrl.split(",")[1] ?? "";
    if (!base64) return null;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return {
      bytes,
      type: logoDataUrl.includes("image/png") ? "png" : "jpg",
    };
  } catch {
    return null;
  }
}

export async function buildSyntheseDocxBlob({
  branding,
  clientName,
  productLabel,
  syntheseMarkdown,
}: SyntheseDocxOpts): Promise<Blob> {
  const blocks = parseMarkdownBlocks(syntheseMarkdown);
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const primaryHex = hexFromCssColor(branding.primaryColor);
  const titleFont = branding.titleFont;
  const logo = await logoImageData(branding.logoDataUrl);

  const logoDimensions = getLogoDimensions(branding);

  const coverTable = buildCoverTable({
    primaryHex,
    titleFont,
    clientName,
    productLabel,
    today,
    logo,
    logoDimensions,
  });

  const contentChildren: (Paragraph | Table)[] = [];
  for (const block of blocks) {
    contentChildren.push(...renderBlock(block));
  }

  const document = new Document({
    creator: "Panora",
    title: `${clientName} - Synthèse`,
    styles: {
      default: {
        document: {
          run: { font: "Inter", size: 20, color: "22201A" },
          paragraph: { spacing: { line: 300 } },
        },
      },
    },
    sections: [
      // Section 1: cover (zero margins for full-bleed color)
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
            },
            margin: {
              top: COVER_MARGIN,
              right: COVER_MARGIN,
              bottom: COVER_MARGIN,
              left: COVER_MARGIN,
              header: 0,
              footer: 0,
              gutter: 0,
            },
          },
        },
        children: [coverTable],
      },
      // Section 2: content with normal margins
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
            },
            margin: {
              top: 720,
              right: CONTENT_MARGIN,
              bottom: 1080,
              left: CONTENT_MARGIN,
            },
          },
        },
        children: contentChildren,
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 0 },
                children: [
                  new TextRun({
                    text: `${clientName} · ${today}`,
                    font: "Inter",
                    size: 16,
                    color: "85827B",
                  }),
                ],
              }),
            ],
          }),
        },
      },
    ],
  });

  return Packer.toBlob(document);
}

interface CoverTableArgs {
  primaryHex: string;
  titleFont: string;
  clientName: string;
  productLabel: string;
  today: string;
  logo: { bytes: Uint8Array; type: "png" | "jpg" } | null;
  logoDimensions: { width: number; height: number };
}

function buildCoverTable({
  primaryHex,
  titleFont,
  clientName,
  productLabel,
  today,
  logo,
  logoDimensions,
}: CoverTableArgs): Table {
  // ---- Banner row content ----
  const eyebrow = new Paragraph({
    spacing: { before: 0, after: 0 },
    children: [
      new TextRun({
        text: "SYNTHÈSE COMPARATIVE",
        font: "Inter",
        size: 18,
        color: "FAFAF7",
        characterSpacing: 60,
      }),
    ],
  });

  // Big title sits at the BOTTOM of the banner cell.
  // VerticalAlign.BOTTOM on the cell pushes content down; eyebrow + title need
  // to be split, so we instead let eyebrow sit at top and use a spacer to push
  // the title to the bottom of the cell.
  const bannerSpacers = spacerParagraphs(14, primaryHex);

  const title1 = new Paragraph({
    spacing: { before: 0, after: 0, line: 480 },
    children: [
      new TextRun({
        text: "Proposition",
        font: titleFont,
        size: 96,
        color: "FFFFFF",
      }),
    ],
  });

  const title2 = new Paragraph({
    spacing: { before: 0, after: 0, line: 480 },
    children: [
      new TextRun({
        text: `d'assurance ${productLabel}`,
        font: titleFont,
        size: 96,
        color: "FFFFFF",
      }),
    ],
  });

  const bannerCell = new TableCell({
    width: { size: PAGE_WIDTH, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: primaryHex },
    margins: {
      top: COVER_INNER_PAD,
      bottom: COVER_INNER_PAD,
      left: COVER_INNER_PAD,
      right: COVER_INNER_PAD,
    },
    verticalAlign: VerticalAlign.TOP,
    children: [eyebrow, ...bannerSpacers, title1, title2],
  });

  // ---- Middle row content ----
  const preparedLabel = new Paragraph({
    spacing: { before: 0, after: 120 },
    children: [
      new TextRun({
        text: "PRÉPARÉ POUR",
        font: "Inter",
        size: 16,
        color: "868178",
        characterSpacing: 60,
      }),
    ],
  });

  const clientLine = new Paragraph({
    spacing: { before: 0, after: 320 },
    children: [
      new TextRun({
        text: clientName,
        font: "Inter",
        size: 48,
        bold: true,
        color: "0E1116",
      }),
    ],
  });

  const desc = new Paragraph({
    spacing: { before: 0, after: 0, line: 320 },
    children: [
      new TextRun({
        text: `Étude personnalisée · ${productLabel}.`,
        font: "Inter",
        size: 22,
        color: "0E1116",
      }),
      new TextRun({ break: 1 }),
      new TextRun({
        text: "Comparatif des garanties, franchises et exclusions sur les porteurs de risque retenus.",
        font: "Inter",
        size: 22,
        color: "0E1116",
      }),
    ],
  });

  const middleCell = new TableCell({
    width: { size: PAGE_WIDTH, type: WidthType.DXA },
    margins: {
      top: COVER_INNER_PAD,
      bottom: COVER_INNER_PAD,
      left: COVER_INNER_PAD,
      right: COVER_INNER_PAD,
    },
    verticalAlign: VerticalAlign.TOP,
    children: [preparedLabel, clientLine, desc],
  });

  // ---- Footer row content ----
  const footerChildren: (TextRun | ImageRun)[] = [];
  if (logo) {
    footerChildren.push(
      new ImageRun({
        data: logo.bytes,
        transformation: logoDimensions,
        type: logo.type,
      })
    );
  }
  footerChildren.push(
    new TextRun({
      text: "\t",
      font: "Inter",
      size: 16,
    }),
    new TextRun({
      text: `ÉDITÉ LE ${today}`,
      font: "Inter",
      size: 16,
      color: "868178",
      characterSpacing: 60,
    })
  );

  const footerPara = new Paragraph({
    spacing: { before: 0, after: 0 },
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: PAGE_WIDTH - 2 * COVER_INNER_PAD,
      },
    ],
    children: footerChildren,
  });

  const footerCell = new TableCell({
    width: { size: PAGE_WIDTH, type: WidthType.DXA },
    margins: {
      top: 200,
      bottom: 200,
      left: COVER_INNER_PAD,
      right: COVER_INNER_PAD,
    },
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "EAE7E0" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    children: [footerPara],
  });

  return new Table({
    width: { size: PAGE_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths: [PAGE_WIDTH],
    borders: noBorders(),
    rows: [
      new TableRow({
        height: { value: COVER_BANNER_HEIGHT, rule: HeightRule.EXACT },
        children: [bannerCell],
      }),
      new TableRow({
        height: { value: COVER_MIDDLE_HEIGHT, rule: HeightRule.EXACT },
        children: [middleCell],
      }),
      new TableRow({
        height: { value: COVER_FOOTER_HEIGHT, rule: HeightRule.EXACT },
        children: [footerCell],
      }),
    ],
  });
}

function spacerParagraphs(count: number, fillHex: string): Paragraph[] {
  return Array.from({ length: count }, () =>
    new Paragraph({
      spacing: { before: 0, after: 0, line: 360 },
      children: [
        new TextRun({
          text: " ",
          font: "Inter",
          size: 24,
          color: fillHex,
        }),
      ],
    })
  );
}

function noBorders() {
  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  return {
    top: none,
    bottom: none,
    left: none,
    right: none,
    insideHorizontal: none,
    insideVertical: none,
  };
}

function spansToRuns(spans: MdSpan[]): TextRun[] {
  return spans.map(
    (span) =>
      new TextRun({
        text: span.value,
        font: "Inter",
        size: 20,
        bold: span.kind === "bold",
        italics: span.kind === "italic",
        color: "22201A",
      })
  );
}

function renderBlock(block: MdBlock): (Paragraph | Table)[] {
  if (block.type === "heading") {
    const sizeMap = { 1: 36, 2: 26, 3: 22, 4: 20, 5: 20, 6: 20 } as const;
    const headingLevelMap = {
      1: HeadingLevel.HEADING_1,
      2: HeadingLevel.HEADING_2,
      3: HeadingLevel.HEADING_3,
      4: HeadingLevel.HEADING_4,
      5: HeadingLevel.HEADING_5,
      6: HeadingLevel.HEADING_6,
    } as const;
    return [
      new Paragraph({
        heading: headingLevelMap[block.depth],
        spacing: {
          before: block.depth === 1 ? 80 : 240,
          after: 120,
        },
        children: [
          new TextRun({
            text: block.text,
            font: "Inter",
            size: sizeMap[block.depth],
            bold: true,
            color: "22201A",
          }),
        ],
      }),
    ];
  }
  if (block.type === "paragraph") {
    return [
      new Paragraph({
        spacing: { before: 0, after: 140, line: 320 },
        children: spansToRuns(block.spans),
      }),
    ];
  }
  if (block.type === "list") {
    return block.items.map(
      (spans, idx) =>
        new Paragraph({
          bullet: block.ordered ? undefined : { level: 0 },
          spacing: { before: 0, after: 60 },
          children: block.ordered
            ? [
                new TextRun({
                  text: `${idx + 1}. `,
                  font: "Inter",
                  size: 20,
                }),
                ...spansToRuns(spans),
              ]
            : spansToRuns(spans),
        })
    );
  }
  if (block.type === "table") {
    return [buildContentTable(block.header, block.rows)];
  }
  if (block.type === "hr") {
    return [
      new Paragraph({
        spacing: { before: 100, after: 100 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "EAE7E0" },
        },
        children: [new TextRun({ text: "" })],
      }),
    ];
  }
  if (block.type === "blockquote") {
    return [
      new Paragraph({
        spacing: { before: 100, after: 100 },
        border: {
          left: { style: BorderStyle.SINGLE, size: 6, color: "EAE7E0", space: 8 },
        },
        indent: { left: 240 },
        children: spansToRuns(block.spans),
      }),
    ];
  }
  return [];
}

function buildContentTable(header: string[], rows: string[][]): Table {
  const colCount = Math.max(header.length, ...rows.map((r) => r.length));
  const colWidth = Math.floor(CONTENT_WIDTH / colCount);
  const columnWidths = Array.from({ length: colCount }, () => colWidth);

  const headerCells = Array.from({ length: colCount }, (_, i) => {
    const text = header[i] ?? "";
    return new TableCell({
      width: { size: colWidth, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, color: "auto", fill: "FAF8F5" },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      verticalAlign: VerticalAlign.CENTER,
      children: [
        new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({
              text,
              font: "Inter",
              size: 18,
              bold: true,
              color: "22201A",
            }),
          ],
        }),
      ],
    });
  });

  const bodyRows = rows.map(
    (row) =>
      new TableRow({
        children: Array.from({ length: colCount }, (_, i) => {
          const text = row[i] ?? "";
          return new TableCell({
            width: { size: colWidth, type: WidthType.DXA },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            verticalAlign: VerticalAlign.TOP,
            children: [
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text,
                    font: "Inter",
                    size: 18,
                    color: "22201A",
                  }),
                ],
              }),
            ],
          });
        }),
      })
  );

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    columnWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headerCells,
      }),
      ...bodyRows,
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "EAE7E0" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "EAE7E0" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "EAE7E0" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "EAE7E0" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "EAE7E0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "EAE7E0" },
    },
  });
}
