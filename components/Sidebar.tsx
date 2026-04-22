"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/api";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/pedidos", label: "Pedidos", icon: "📋" },
  { href: "/menu", label: "Menú", icon: "🍽" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <aside className="sticky top-0 self-start flex h-screen w-56 flex-col bg-(--color-sidebar-bg) text-(--color-sidebar-text)">
      {/* Brand */}
      <div className="flex h-14 items-center px-5 border-b border-white/10">
        <span className="text-lg font-bold tracking-tight text-white">
          Nexo
        </span>
        <span className="ml-2 text-xs text-(--color-sidebar-text)/60">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-(--color-sidebar-active) text-white font-medium"
                      : "text-(--color-sidebar-text) hover:bg-(--color-sidebar-hover) hover:text-white"
                  }`}
                >
                  <span className="text-base leading-none">{icon}</span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-(--color-sidebar-text) transition-colors hover:bg-(--color-sidebar-hover) hover:text-white"
        >
          <span className="text-base leading-none">↩</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
