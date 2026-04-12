"use client";

/* import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api"; */

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  /* const router = useRouter();
  // Use a ref to drive a re-render without triggering the cascading-setState lint rule
  const [checked, setChecked] = useState(false);
  const didCheck = useRef(false);

  useEffect(() => {
    if (didCheck.current) return;
    didCheck.current = true;

    if (!getToken()) {
      router.replace("/login");
      return;
    }

    // Defer the state update to avoid synchronous setState-in-effect warning
    const id = setTimeout(() => setChecked(true), 0);
    return () => clearTimeout(id);
  }, [router]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[--color-surface-muted]">
        <span className="text-sm text-[--color-text-muted]">Cargando…</span>
      </div>
    );
  }
 */
  return <>{children}</>;
}
