import { Suspense } from "react";
import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/AppLayout";
import { WelcomeHub } from "@/components/signup/WelcomeHub";

export const metadata: Metadata = {
  title: "Bienvenue - Panora",
};

export default function BienvenuePage() {
  // The "Aperçu proto" switcher now lives in the shared Sidebar (AppLayout).
  return (
    <AppLayout>
      <Suspense>
        <WelcomeHub />
      </Suspense>
    </AppLayout>
  );
}
