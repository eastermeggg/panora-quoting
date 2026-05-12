"use client";

import { BrandingSettings } from "@/data/branding";

interface ExportOpts {
  branding: BrandingSettings;
  clientName: string;
  productLabel: string;
  syntheseMarkdown: string;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function downloadSynthesePdf(opts: ExportOpts) {
  try {
    const [{ pdf }, { SynthesePDFDocument }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("./pdf/SynthesePDF"),
    ]);
    const blob = await pdf(<SynthesePDFDocument {...opts} />).toBlob();
    triggerDownload(blob, `${opts.clientName} - Synthèse.pdf`);
  } catch (err) {
    console.error("[PDF export] failed:", err);
    alert(
      `Échec de l'export PDF.\n\n${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

export async function downloadSyntheseDocx(opts: ExportOpts) {
  try {
    const { buildSyntheseDocxBlob } = await import("./docx/SyntheseDocx");
    const blob = await buildSyntheseDocxBlob(opts);
    triggerDownload(blob, `${opts.clientName} - Synthèse.docx`);
  } catch (err) {
    console.error("[DOCX export] failed:", err);
    alert(
      `Échec de l'export DOCX.\n\n${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

/**
 * Open the synthèse PDF in a new browser tab using the browser's native PDF
 * viewer. Opens the tab synchronously on click (avoids pop-up blockers), shows
 * a small loading shim while the PDF builds, then swaps in the blob URL — the
 * generated PDF is identical to what `downloadSynthesePdf` produces.
 */
export async function previewSynthesePdf(opts: ExportOpts) {
  // No features string → the browser returns a usable Window reference and
  // opens a new tab (rather than a popup that may be blocked).
  const win = window.open("about:blank", "_blank");
  if (!win) {
    alert(
      "Impossible d'ouvrir l'aperçu PDF. Veuillez autoriser les pop-ups pour ce site."
    );
    return;
  }
  try {
    win.document.title = `Aperçu — ${opts.clientName}`;
    win.document.body.style.cssText =
      "margin:0;background:#22201a;color:#faf8f5;font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;font-size:13px;letter-spacing:0.04em;";
    win.document.body.textContent = "Génération de l'aperçu PDF…";
  } catch {
    // about:blank in some browsers blocks DOM access until the page commits.
  }

  try {
    const [{ pdf }, { SynthesePDFDocument }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("./pdf/SynthesePDF"),
    ]);
    const blob = await pdf(<SynthesePDFDocument {...opts} />).toBlob();
    const url = URL.createObjectURL(blob);
    win.location.replace(url);
    // Keep the blob alive long enough for the user to read / save / reload.
    setTimeout(() => URL.revokeObjectURL(url), 300_000);
  } catch (err) {
    console.error("[PDF preview] failed:", err);
    try {
      win.close();
    } catch {}
    alert(
      `Échec de l'aperçu PDF.\n\n${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}
