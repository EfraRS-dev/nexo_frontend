import type { Metadata } from "next";
import MenuClient from "./_components/MenuClient";

export const metadata: Metadata = {
  title: "Menú",
};

export default function MenuPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[--color-text]">Menú</h1>
        <p className="text-sm text-[--color-text-muted]">
          Gestión de productos y disponibilidad
        </p>
      </div>
      <MenuClient />
    </div>
  );
}
