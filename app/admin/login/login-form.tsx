"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Erro");
      }
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setErr(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
          Acesso restrito
        </p>
        <h1 className="font-display text-3xl tracking-tight">Painel DRUM</h1>
      </header>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Senha de admin</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          className="w-full bg-surface border border-subtle rounded-xl px-4 py-3 text-base focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
        />
      </label>

      {err && (
        <p className="text-accent text-sm bg-accent-soft rounded-lg px-4 py-2">
          {err}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-foreground text-background py-3 font-medium hover:bg-accent transition disabled:opacity-50"
      >
        {loading ? "Verificando…" : "Entrar"}
      </button>
    </form>
  );
}
