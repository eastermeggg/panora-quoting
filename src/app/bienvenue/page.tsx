import { Suspense } from "react";
import type { Metadata } from "next";
import { AppLayout } from "@/components/layout/AppLayout";
import { WelcomeHub } from "@/components/signup/WelcomeHub";
import { ProtoStateSwitcher } from "@/components/signup/ProtoStateSwitcher";

export const metadata: Metadata = {
  title: "Bienvenue - Panora",
};

export default function BienvenuePage() {
  return (
    <AppLayout>
      <Suspense>
        <WelcomeHub />
        <ProtoStateSwitcher />
      </Suspense>
    </AppLayout>
  );
}
