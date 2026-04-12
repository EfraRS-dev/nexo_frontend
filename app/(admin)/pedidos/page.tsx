import type { Metadata } from "next";
import OrdersClient from "./_components/OrdersClient";

export const metadata: Metadata = {
  title: "Pedidos",
};

export default function PedidosPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[--color-text]">Pedidos</h1>
        <p className="text-sm text-[--color-text-muted]">
          Gestión y seguimiento de pedidos
        </p>
      </div>
      <OrdersClient />
    </div>
  );
}
