"use client";

import { redirect, useParams, useSearchParams } from "next/navigation";

/** Legacy route: tarification is now the default tab of the unified detail. */
export default function TarificationRedirect() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const launch = searchParams.get("launch") === "1" ? "?launch=1" : "";
  redirect(`/souscription/dossier/${params?.id ?? ""}${launch}`);
}
