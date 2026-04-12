import type { Metadata } from "next";
import LoginForm from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión — Nexo",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[--color-surface-muted] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[--color-text]">
            Nexo
          </h1>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            Panel de administración
          </p>
        </div>

        <div className="rounded-[--radius-card] border border-[--color-border] bg-[--color-surface-raised] p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
