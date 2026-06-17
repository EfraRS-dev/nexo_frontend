import type { Metadata } from "next";
import RestauranteClient from "./_components/RestauranteClient";

export const metadata: Metadata = {
  title: "Mi restaurante",
};

export default function RestaurantePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-(--color-text)">Mi restaurante</h1>
        <p className="text-sm text-(--color-text-muted)">
          La información que el agente usa al atender a tus clientes
        </p>
      </div>
      <RestauranteClient />
    </div>
  );
}
