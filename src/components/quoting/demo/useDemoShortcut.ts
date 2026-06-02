"use client";

import { useEffect, useState } from "react";

/**
 * Demo-only keyboard shortcut: Cmd+Shift+D (Mac) / Ctrl+Shift+D (Win/Linux).
 * Toggles a boolean state. Used to reveal the demo command center during
 * client demos without surfacing any affordance in the broker UI.
 *
 * Not shipped: this is internal tooling, never visible to brokers.
 */
export function useDemoShortcut(): [boolean, () => void] {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isToggle = e.key.toLowerCase() === "d" && e.shiftKey && (e.metaKey || e.ctrlKey);
      if (isToggle) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return [open, () => setOpen((v) => !v)];
}
