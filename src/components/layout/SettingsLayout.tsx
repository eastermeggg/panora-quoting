"use client";

import { SettingsSidebar } from "./SettingsSidebar";

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SettingsSidebar />
      <main className="flex-1 flex flex-col min-h-0 min-w-0">{children}</main>
    </div>
  );
}
