"use client";

import { useEffect, useState } from "react";
import { PROFILE_LABELS, PROFILES, type Profile } from "@/lib/profiles";

type ResultRow = {
  result_profile: Profile;
  scores: Record<Profile, number>;
  anxiety_level: number | null;
  interpretacao: string;
  acoes: string[];
  clicked_cta: boolean;
  chosen_acao_index: number | null;
};

type ApiResponse =
  | { ready: false }
  | { ready: true; result: ResultRow; response: { nome?: string | null } };

export default function ResultView({ responseId }: { responseId: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [ctaClicked, setCtaClicked] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      while (!cancelled) {
        const res = await fetch(`/api/diagnostico/${responseId}`, {
          cache: "no-store",
        });
        const json = (await res.json()) as ApiResponse;
        if (json.ready) {
          setData(json);
          if (typeof json.result.chosen_acao_index === "number") {
            setChosen(json.result.chosen_acao_index);
          }
          return;
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    poll();
    return () => {
      cancelled = true;
    };
  }, [responseId]);

  async function pickAction(i: number) {
    setChosen(i);
    await fetch(`/api/diagnostico/${responseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chosen_acao_index: i }),
    });
  }

  async function clickCta() {
    setCtaClicked(true);
    await fetch(`/api/diagnostico/${responseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clicked_cta: true }),
    });
  }

  if (!data || !data.ready) {
    return <ResultSkeleton />;
  }

  const { result } = data;
  const acoes = Array.isArray(result.acoes) ? result.acoes : [];
  const scores = normalizeScores(result.scores);
  const ctaReady = chosen !== null;

  return (
    <div className="max-w-2xl w-full space-y-12">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
          Seu perfil
        </p>
        <h1 className="font-display text-4xl sm:text-5xl tracking-tight leading-tight">
          {PROFILE_LABELS[result.result_profile]}
        </h1>
      </header>

      <article className="space-y-5 font-display text-lg sm:text-xl leading-relaxed text-foreground/90">
        {result.interpretacao.split(/\n\n+/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

      <ScoresBar scores={scores} dominant={result.result_profile} />

      <section className="space-y-5">
        <div className="space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl tracking-tight">
            Escolha uma pra começar
          </h2>
          <p className="text-muted leading-relaxed">
            Escolha <strong className="text-foreground">uma</strong> dessas 3 ações pra ser o quebra-gelo da
            sua primeira conversa com a DRUM. Pode fazer durante os próximos 30
            dias — o mentor vai te perguntar como foi.
          </p>
        </div>
        <div className="space-y-3">
          {acoes.map((a, i) => {
            const isChosen = chosen === i;
            return (
              <button
                key={i}
                onClick={() => pickAction(i)}
                className={`w-full text-left flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition ${
                  isChosen
                    ? "bg-accent-soft border-accent shadow-sm"
                    : "bg-surface border-subtle hover:border-accent/40"
                }`}
              >
                <span
                  className={`mt-1 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    isChosen ? "border-accent bg-accent" : "border-muted/40"
                  }`}
                  aria-hidden="true"
                >
                  {isChosen && (
                    <span className="w-2 h-2 rounded-full bg-background" />
                  )}
                </span>
                <span
                  className={`text-base sm:text-lg leading-snug ${
                    isChosen ? "text-foreground" : "text-foreground/85"
                  }`}
                >
                  {a}
                </span>
              </button>
            );
          })}
        </div>
        {chosen === null && (
          <p className="text-xs text-muted">
            Selecione uma pra liberar o próximo passo.
          </p>
        )}
      </section>

      {result.anxiety_level != null && (
        <p className="text-sm text-muted">
          Ansiedade declarada hoje:{" "}
          <span className="text-foreground font-medium">
            {result.anxiety_level}/5
          </span>
        </p>
      )}

      <div className="pt-8 border-t border-subtle space-y-3">
        <button
          onClick={clickCta}
          disabled={!ctaReady || ctaClicked || result.clicked_cta}
          className="w-full rounded-full bg-foreground text-background py-5 font-medium hover:bg-accent transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {ctaClicked || result.clicked_cta
            ? "Anotado — entraremos em contato"
            : ctaReady
              ? "Marcar conversa com a DRUM"
              : "Escolha uma ação acima"}
        </button>
        <p className="text-xs text-muted text-center">
          Sem cobrança. A gente te chama por email pra marcar a primeira
          conversa.
        </p>
      </div>
    </div>
  );
}

function normalizeScores(raw: unknown): Record<Profile, number> {
  const out: Record<Profile, number> = {
    paralisado_por_opcao: 0,
    atrasado: 0,
    executor_sem_norte: 0,
    esperando_permissao: 0,
  };
  if (raw && typeof raw === "object") {
    for (const p of PROFILES) {
      const v = (raw as Record<string, unknown>)[p];
      if (typeof v === "number") out[p] = v;
    }
  }
  return out;
}

function ScoresBar({
  scores,
  dominant,
}: {
  scores: Record<Profile, number>;
  dominant: Profile;
}) {
  return (
    <section className="space-y-3 bg-surface border border-subtle rounded-2xl p-5 sm:p-6">
      <p className="text-xs uppercase tracking-widest text-muted">
        Distribuição dos perfis
      </p>
      <div className="space-y-2">
        {PROFILES.map((p) => {
          const v = scores[p] ?? 0;
          const pct = Math.round(v * 100);
          const isDom = p === dominant;
          return (
            <div key={p} className="grid grid-cols-[1fr_auto] gap-3 items-center">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span
                    className={
                      isDom ? "text-foreground font-medium" : "text-muted"
                    }
                  >
                    {PROFILE_LABELS[p]}
                  </span>
                </div>
                <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isDom ? "bg-accent" : "bg-muted/40"} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted font-mono w-10 text-right">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ResultSkeleton() {
  return (
    <div className="max-w-2xl w-full space-y-12 animate-pulse">
      <div className="space-y-3">
        <div className="h-3 w-24 bg-subtle rounded" />
        <div className="h-12 w-3/4 bg-subtle rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-5 w-full bg-subtle rounded" />
        <div className="h-5 w-11/12 bg-subtle rounded" />
        <div className="h-5 w-10/12 bg-subtle rounded" />
        <div className="h-5 w-9/12 bg-subtle rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-16 bg-subtle rounded-2xl" />
        <div className="h-16 bg-subtle rounded-2xl" />
        <div className="h-16 bg-subtle rounded-2xl" />
      </div>
    </div>
  );
}
