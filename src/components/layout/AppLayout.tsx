"use client";

import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-panora-bg">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-0 min-w-0 py-2.5 pr-2.5">
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-panora-border rounded-[12px] shadow-sm overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
