"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";

function subscribe(callback: () => void) {
  // Reacciona a cambios del token en otras pestañas (login/logout)
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // En el servidor (y durante la hidratación) no hay token → "Cargando…"
  const token = useSyncExternalStore(subscribe, getToken, () => null);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--color-surface-muted)">
        <span className="text-sm text-(--color-text-muted)">Cargando…</span>
      </div>
    );
  }

  return <>{children}</>;
}
