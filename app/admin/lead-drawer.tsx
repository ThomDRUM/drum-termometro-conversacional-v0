"use client";

import { useEffect } from "react";
import { ACTION_TYPE_LABELS } from "@/lib/taxonomy";
import type { Lead } from "@/lib/leads";

export default function LeadDrawer({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const result     = lead.result;
  const transcript = lead.voice?.transcript ?? [];
  const actions    = Array.isArray(result?.actions) ? result!.actions : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="relative w-full max-w-2xl bg-background overflow-y-auto shadow-2xl">
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-subtle px-6 py-4 flex items-center justify-between z-10">
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-widest text-muted">Lead</p>
            <h2 className="font-display text-xl tracking-tight">
              {lead.nome || "Sem nome"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition text-sm"
            aria-label="Fechar"
          >
            Fechar ✕
          </button>
        </header>

        <div className="px-6 py-6 space-y-8">

          {/* ── Stats grid ── */}
          <section className="grid grid-cols-3 gap-3">
            <Info label="Score" value={`${lead.score}`} />
            <Info
              label="Fase"
              value={result?.phase?.name ?? "—"}
            />
            <Info
              label="Trajetória"
              value={result?.pathway?.name ?? "—"}
            />
            <Info label="Email" value={lead.email || "—"} />
            <Info label="Telefone" value={lead.telefone || "—"} />
            <Info
              label="Clareza"
              value={
                result?.clarity?.label
                  ? `${result.clarity.label} (${result.clarity.total_points_0_to_2}/2)`
                  : "—"
              }
            />
            <Info
              label="Tensão"
              value={result?.tension?.name ?? "—"}
            />
            <Info
              label="Ansiedade"
              value={
                result?.metadata?.anxiety_score_1_to_5 != null
                  ? `${result.metadata.anxiety_score_1_to_5}/5`
                  : "—"
              }
            />
            <Info
              label="Duração"
              value={
                lead.voice?.duracao_seg != null
                  ? `${Math.floor(lead.voice.duracao_seg / 60)}m ${lead.voice.duracao_seg % 60}s`
                  : "—"
              }
            />
            <Info
              label="CTA"
              value={result?.clicked_cta ? "✓ Clicou" : "Não"}
            />
          </section>

          {/* ── Fase description ── */}
          {result?.phase?.short_description && (
            <section className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted">
                Momento ({result.phase.name})
              </p>
              <p className="text-sm leading-relaxed text-foreground/85">
                {result.phase.short_description}
              </p>
            </section>
          )}

          {/* ── Pathway description ── */}
          {result?.pathway?.short_description && (
            <section className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted">
                Caminho ({result.pathway.name})
              </p>
              <p className="text-sm leading-relaxed text-foreground/85">
                {result.pathway.short_description}
              </p>
            </section>
          )}

          {/* ── Tension description ── */}
          {result?.tension?.short_description && (
            <section className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted">
                Tensão ({result.tension.name})
              </p>
              <p className="text-sm leading-relaxed text-foreground/85">
                {result.tension.short_description}
              </p>
            </section>
          )}

          {/* ── Actions ── */}
          {actions.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted">
                Ações sugeridas
                {result?.chosen_action_type && (
                  <span className="ml-2 text-accent normal-case tracking-normal">
                    (escolheu: {ACTION_TYPE_LABELS[result.chosen_action_type as keyof typeof ACTION_TYPE_LABELS]})
                  </span>
                )}
              </p>
              <ol className="space-y-3">
                {actions.map((a) => {
                  const chosen = result?.chosen_action_type === a.type;
                  return (
                    <li
                      key={a.type}
                      className={`p-4 rounded-xl border space-y-1 ${
                        chosen
                          ? "bg-accent-soft border-accent"
                          : "border-subtle bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-widest text-muted">
                          {ACTION_TYPE_LABELS[a.type]}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted leading-relaxed">{a.description}</p>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {/* ── Raw summary ── */}
          {result?.metadata?.raw_summary && (
            <section className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted">
                Resumo da conversa
              </p>
              <p className="text-sm text-foreground/85 leading-relaxed">
                {result.metadata.raw_summary}
              </p>
            </section>
          )}

          {/* ── Transcript ── */}
          {transcript.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted">
                Transcrição ({transcript.length} turnos)
              </p>
              <div className="space-y-3 bg-surface border border-subtle rounded-2xl p-4 max-h-96 overflow-y-auto">
                {transcript.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <span
                      className={`text-xs font-medium uppercase tracking-wider shrink-0 w-12 pt-0.5 ${
                        t.role === "agent" ? "text-accent" : "text-muted"
                      }`}
                    >
                      {t.role === "agent" ? "DRUM" : "User"}
                    </span>
                    <p className="text-sm text-foreground/85 leading-relaxed">
                      {t.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Meta ── */}
          <section className="text-xs text-muted space-y-1 pt-6 border-t border-subtle">
            <p>response_id: {lead.response_id}</p>
            <p>criado em: {new Date(lead.created_at).toLocaleString("pt-BR")}</p>
            {lead.voice?.elevenlabs_conversation_id && (
              <p>conv ElevenLabs: {lead.voice.elevenlabs_conversation_id}</p>
            )}
            {result?.ai_model && <p>modelo: {result.ai_model}</p>}
          </section>
        </div>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="text-sm text-foreground truncate">{value}</p>
    </div>
  );
}
