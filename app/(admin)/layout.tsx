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
      <div className="flex min-h-screen items-start">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
