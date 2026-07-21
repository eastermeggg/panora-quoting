"use client";

import { useEffect } from "react";
import { getProtoScenario, applyProtoScenario } from "@/data/proto-scenario";

/* Re-applies the persisted prototype scenario on every full load, at the app
 * root — so it reaches ALL routes (including settings, which uses its own
 * layout). No-op when no scenario has been chosen (default app behavior). */
export function ProtoScenarioInit() {
  useEffect(() => {
    const s = getProtoScenario();
    if (s) applyProtoScenario(s);
  }, []);
  return null;
}
