"use client";

import { useState, useMemo } from "react";
import { PATHWAYS, PHASES, type Pathway, type Phase } from "@/lib/taxonomy";
import type { Lead } from "@/lib/leads";
import LeadDrawer from "./lead-drawer";

type BandFilter    = "all" | "hot" | "warm" | "cold";
type PathwayFilter = "all" | Pathway;
type PhaseFilter   = "all" | Phase;

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [band,     setBand]     = useState<BandFilter>("all");
  const [pathway,  setPathway]  = useState<PathwayFilter>("all");
  const [phase,    setPhase]    = useState<PhaseFilter>("all");
  const [ctaOnly,  setCtaOnly]  = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return [...leads]
      .filter((l) => band    === "all" || l.band === band)
      .filter((l) => pathway === "all" || l.result?.pathway?.name === pathway)
      .filter((l) => phase   === "all" || l.result?.phase?.name   === phase)
      .filter((l) => !ctaOnly || l.result?.clicked_cta)
      .sort((a, b) => b.score - a.score);
  }, [leads, band, pathway, phase, ctaOnly]);

  const sel = leads.find((l) => l.response_id === selected) ?? null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Band filters */}
        <FilterButton active={band === "all"}  onClick={() => setBand("all")}>Todos</FilterButton>
        <FilterButton active={band === "hot"}  onClick={() => setBand("hot")}  dotColor="bg-accent">Quentes</FilterButton>
        <FilterButton active={band === "warm"} onClick={() => setBand("warm")} dotColor="bg-amber-500">Mornos</FilterButton>
        <FilterButton active={band === "cold"} onClick={() => setBand("cold")} dotColor="bg-zinc-400">Frios</FilterButton>

        <div className="w-px h-5 bg-subtle mx-1" />

        {/* Pathway filter */}
        <select
          value={pathway}
          onChange={(e) => setPathway(e.target.value as PathwayFilter)}
          className="bg-surface border border-subtle rounded-full px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todas as trajetórias</option>
          {PATHWAYS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Phase filter */}
        <select
          value={phase}
          onChange={(e) => setPhase(e.target.value as PhaseFilter)}
          className="bg-surface border border-subtle rounded-full px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
        >
          <option value="all">Todas as fases</option>
          {PHASES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* CTA filter */}
        <label className="flex items-center gap-2 text-sm text-muted ml-2 cursor-pointer">
          <input
            type="checkbox"
            checked={ctaOnly}
            onChange={(e) => setCtaOnly(e.target.checked)}
            className="accent-accent"
          />
          Só quem clicou CTA
        </label>

        <span className="ml-auto text-sm text-muted">
          {filtered.length} de {leads.length}
        </span>
      </div>

      <div className="overflow-x-auto bg-surface border border-subtle rounded-2xl">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted">
            <tr className="border-b border-subtle">
              <th className="text-left px-4 py-3 font-medium">Score</th>
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Fase</th>
              <th className="text-left px-4 py-3 font-medium">Trajetória</th>
              <th className="text-left px-4 py-3 font-medium">Clareza</th>
              <th className="text-left px-4 py-3 font-medium">CTA</th>
              <th className="text-left px-4 py-3 font-medium">Quando</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted text-sm">
                  Nenhum lead com esses filtros.
                </td>
              </tr>
            )}
            {filtered.map((l) => (
              <tr
                key={l.response_id}
                onClick={() => setSelected(l.response_id)}
                className="border-b border-subtle/60 last:border-0 hover:bg-accent-soft/40 cursor-pointer transition"
              >
                <td className="px-4 py-3">
                  <ScoreBadge band={l.band} score={l.score} />
                </td>
                <td className="px-4 py-3 font-medium">
                  {l.nome || <span className="text-muted">—</span>}
                </td>
                <td className="px-4 py-3 text-muted text-xs">
                  {l.email || "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {l.result?.phase?.name ?? (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {l.result?.pathway?.name ?? (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted text-xs">
                  {l.result?.clarity?.label ?? "—"}
                </td>
                <td className="px-4 py-3">
                  {l.result?.clicked_cta ? (
                    <span className="text-accent text-xs font-medium">✓ sim</span>
                  ) : (
                    <span className="text-muted text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted text-xs">
                  {timeAgo(l.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && <LeadDrawer lead={sel} onClose={() => setSelected(null)} />}
    </section>
  );
}

function FilterButton({
  children,
  active,
  onClick,
  dotColor,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition ${
        active
          ? "bg-foreground text-background"
          : "bg-surface border border-subtle text-foreground hover:border-accent/40"
      }`}
    >
      {dotColor && <span className={`w-2 h-2 rounded-full ${dotColor}`} />}
      {children}
    </button>
  );
}

function ScoreBadge({ band, score }: { band: Lead["band"]; score: number }) {
  const colors = {
    hot:  "bg-accent text-background",
    warm: "bg-amber-100 text-amber-900",
    cold: "bg-subtle text-muted",
  };
  return (
    <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-md text-xs font-mono font-medium ${colors[band]}`}>
      {score}
    </span>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "agora";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
