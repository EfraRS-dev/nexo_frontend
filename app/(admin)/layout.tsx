import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "./_components/AuthGuard";

export const metadata: Metadata = {
  title: {
    template: "%s — Nexo Admin",
    default: "Nexo Admin",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
