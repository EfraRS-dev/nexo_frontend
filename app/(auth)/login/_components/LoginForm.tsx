"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login, setToken, ApiError } from "@/lib/api";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { access_token } = await login({ email, password });
      setToken(access_token);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? "Credenciales incorrectas"
            : `Error ${err.status}: ${err.message}`,
        );
      } else {
        setError("No se pudo conectar con el servidor");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-(--color-text)"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text) outline-none transition-colors focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20"
          placeholder="admin@restaurante.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-(--color-text)"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-text) outline-none transition-colors focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 h-10 rounded-lg bg-(--color-brand) px-4 text-sm font-medium text-(--color-brand-foreground) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
    </form>
  );
}
