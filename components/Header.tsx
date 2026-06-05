"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";

export default function Header() {
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    getMe()
      .then((me) => {
        if (activo) setNombre(me.restaurante_nombre);
      })
      .catch(() => {
        /* simplemente no muestra el nombre */
      });
    return () => {
      activo = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center border-b border-(--color-border) bg-(--color-surface) px-6">
      <span className="text-sm font-semibold text-(--color-text)">
        {nombre ?? "…"}
      </span>
    </header>
  );
}
