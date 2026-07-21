import { Suspense } from "react";
import type { Metadata } from "next";
import { SignupFlow } from "@/components/signup/SignupFlow";
import { ProtoStateSwitcher } from "@/components/signup/ProtoStateSwitcher";

export const metadata: Metadata = {
  title: "Créer un compte - Panora",
};

export default function SignupPage() {
  return (
    <Suspense>
      <SignupFlow />
      <ProtoStateSwitcher />
    </Suspense>
  );
}
