"use client";

import { useEffect } from "react";
import { PROFILE_LABELS } from "@/lib/profiles";
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

  const result = lead.result;
  const transcript = lead.voice?.transcript ?? [];
  const acoes = Array.isArray(result?.acoes) ? result!.acoes : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="relative w-full max-w-2xl bg-background overflow-y-auto shadow-2xl">
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-subtle px-6 py-4 flex items-center justify-between z-10">
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-widest text-muted">
              Lead
            </p>
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
          <section className="grid grid-cols-3 gap-3">
            <Info label="Score" value={`${lead.score}`} />
            <Info
              label="Perfil"
              value={
                result?.result_profile
                  ? PROFILE_LABELS[result.result_profile]
                  : "—"
              }
            />
            <Info
              label="Ansiedade"
              value={
                result?.anxiety_level != null
                  ? `${result.anxiety_level}/5`
                  : "—"
              }
            />
            <Info label="Email" value={lead.email || "—"} />
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

          {result?.interpretacao && (
            <section className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted">
                Devolutiva
              </p>
              <article className="font-display text-base leading-relaxed text-foreground/90 space-y-3">
                {result.interpretacao.split(/\n\n+/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </article>
            </section>
          )}

          {acoes.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-muted">
                Ações sugeridas
                {result?.chosen_acao_index != null && (
                  <span className="ml-2 text-accent normal-case tracking-normal">
                    (escolheu a #{result.chosen_acao_index + 1} como quebra-gelo)
                  </span>
                )}
              </p>
              <ol className="space-y-2">
                {acoes.map((a, i) => {
                  const chosen = result?.chosen_acao_index === i;
                  return (
                    <li
                      key={i}
                      className={`flex gap-3 p-3 rounded-xl border ${
                        chosen
                          ? "bg-accent-soft border-accent"
                          : "border-subtle bg-surface"
                      }`}
                    >
                      <span className="text-muted font-mono text-xs pt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm">{a}</span>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

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

          <section className="text-xs text-muted space-y-1 pt-6 border-t border-subtle">
            <p>response_id: {lead.response_id}</p>
            <p>
              criado em:{" "}
              {new Date(lead.created_at).toLocaleString("pt-BR")}
            </p>
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
