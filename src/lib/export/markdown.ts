import { marked, type Tokens } from "marked";

export type MdBlock =
  | { type: "heading"; depth: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: "paragraph"; spans: MdSpan[] }
  | { type: "list"; ordered: boolean; items: MdSpan[][] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "hr" }
  | { type: "blockquote"; spans: MdSpan[] };

export type MdSpan =
  | { kind: "text"; value: string }
  | { kind: "bold"; value: string }
  | { kind: "italic"; value: string }
  | { kind: "code"; value: string };

function inlineToSpans(tokens: Tokens.Generic[]): MdSpan[] {
  const spans: MdSpan[] = [];
  for (const tok of tokens) {
    if (tok.type === "text") {
      spans.push({ kind: "text", value: (tok as Tokens.Text).text });
    } else if (tok.type === "strong") {
      const inner = (tok as Tokens.Strong).tokens ?? [];
      spans.push({ kind: "bold", value: collapseTextTokens(inner) });
    } else if (tok.type === "em") {
      const inner = (tok as Tokens.Em).tokens ?? [];
      spans.push({ kind: "italic", value: collapseTextTokens(inner) });
    } else if (tok.type === "codespan") {
      spans.push({ kind: "code", value: (tok as Tokens.Codespan).text });
    } else if (tok.type === "br") {
      spans.push({ kind: "text", value: "\n" });
    } else if ("tokens" in tok && Array.isArray(tok.tokens)) {
      spans.push(...inlineToSpans(tok.tokens as Tokens.Generic[]));
    } else if ("text" in tok && typeof tok.text === "string") {
      spans.push({ kind: "text", value: tok.text });
    }
  }
  return spans;
}

function collapseTextTokens(tokens: Tokens.Generic[]): string {
  return tokens
    .map((t) => {
      if ("text" in t && typeof t.text === "string") return t.text;
      if ("tokens" in t && Array.isArray(t.tokens)) return collapseTextTokens(t.tokens as Tokens.Generic[]);
      return "";
    })
    .join("");
}

export function parseMarkdownBlocks(md: string): MdBlock[] {
  const tokens = marked.lexer(md);
  const blocks: MdBlock[] = [];

  for (const tok of tokens) {
    if (tok.type === "heading") {
      const t = tok as Tokens.Heading;
      blocks.push({ type: "heading", depth: t.depth as 1 | 2 | 3, text: t.text });
    } else if (tok.type === "paragraph") {
      const t = tok as Tokens.Paragraph;
      blocks.push({ type: "paragraph", spans: inlineToSpans(t.tokens ?? []) });
    } else if (tok.type === "list") {
      const t = tok as Tokens.List;
      blocks.push({
        type: "list",
        ordered: t.ordered,
        items: t.items.map((item) => inlineToSpans(item.tokens ?? [])),
      });
    } else if (tok.type === "table") {
      const t = tok as Tokens.Table;
      blocks.push({
        type: "table",
        header: t.header.map((cell) => cell.text),
        rows: t.rows.map((row) => row.map((cell) => cell.text)),
      });
    } else if (tok.type === "hr") {
      blocks.push({ type: "hr" });
    } else if (tok.type === "blockquote") {
      const t = tok as Tokens.Blockquote;
      const spans: MdSpan[] = [];
      for (const inner of t.tokens ?? []) {
        if (inner.type === "paragraph") {
          spans.push(...inlineToSpans((inner as Tokens.Paragraph).tokens ?? []));
          spans.push({ kind: "text", value: "\n" });
        }
      }
      blocks.push({ type: "blockquote", spans });
    } else if (tok.type === "space") {
      continue;
    }
  }
  return blocks;
}

export function spansToPlainText(spans: MdSpan[]): string {
  return spans.map((s) => s.value).join("");
}
