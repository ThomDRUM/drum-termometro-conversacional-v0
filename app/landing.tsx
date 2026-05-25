"use client";

import { useState } from "react";
import Conversa from "./conversa";

type Stage = "hero" | "form" | "conversa";

export default function Landing() {
  const [stage, setStage] = useState<Stage>("hero");
  const [responseId, setResponseId] = useState<string | null>(null);

  if (stage === "conversa" && responseId) {
    return <Conversa responseId={responseId} />;
  }

  if (stage === "form") {
    return (
      <SignupForm
        onBack={() => setStage("hero")}
        onReady={(rid) => {
          setResponseId(rid);
          setStage("conversa");
        }}
      />
    );
  }

  return <Hero onStart={() => setStage("form")} />;
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-12">
      <div className="space-y-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
          Para quem acabou de se formar
        </p>
        <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] tracking-tight">
          Em que ponto da sua{" "}
          <span className="italic text-accent">carreira</span> você está?
        </h1>
        <p className="text-lg text-muted leading-relaxed max-w-md mx-auto">
          Uma conversa de voz de 5 minutos. No final, você recebe uma devolutiva
          escrita — específica pra você, não um teste de revista.
        </p>
      </div>

      <button
        onClick={onStart}
        className="rounded-full bg-foreground text-background px-10 py-5 text-base font-medium hover:bg-accent transition-colors shadow-sm"
      >
        Começar — é grátis
      </button>

      <div className="w-full grid grid-cols-3 gap-3 sm:gap-6 text-center">
        <Stat n="5 min" label="de conversa" />
        <Stat n="4 perfis" label="possíveis" />
        <Stat n="3 ações" label="pros próximos 30 dias" />
      </div>

      <PreviewCard />

      <p className="text-xs text-muted text-center max-w-sm">
        Vamos pedir acesso ao seu microfone. Você pode encerrar a qualquer
        momento.
      </p>
    </div>
  );
}

function SignupForm({
  onBack,
  onReady,
}: {
  onBack: () => void;
  onReady: (responseId: string) => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const auth = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
      if (!auth.ok) throw new Error((await auth.json()).error || "Erro no cadastro");
      const { user_id } = (await auth.json()) as { user_id: string };

      const start = await fetch("/api/conversa/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id }),
      });
      if (!start.ok) throw new Error(await start.text());
      const { response_id } = (await start.json()) as { response_id: string };
      onReady(response_id);
    } catch (e) {
      setErr(String(e instanceof Error ? e.message : e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-md flex flex-col gap-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-muted hover:text-accent transition-colors self-start"
      >
        ← Voltar
      </button>

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
          Antes de começar
        </p>
        <h2 className="font-display text-3xl sm:text-4xl tracking-tight leading-tight">
          A gente precisa saber como te chamar de volta.
        </h2>
        <p className="text-muted leading-relaxed">
          Sua devolutiva fica salva no seu email. Se você voltar depois, é só
          entrar de novo com os mesmos dados.
        </p>
      </header>

      <div className="space-y-4">
        <Field
          label="Seu primeiro nome"
          value={nome}
          onChange={setNome}
          autoComplete="given-name"
          required
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <Field
          label="Senha"
          type="password"
          value={senha}
          onChange={setSenha}
          autoComplete="new-password"
          required
          hint="Mínimo 6 caracteres. Se já tiver conta, usamos a mesma."
          minLength={6}
        />
      </div>

      {err && (
        <p className="text-accent text-sm bg-accent-soft rounded-lg px-4 py-2">
          {err}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-foreground text-background py-4 px-6 font-medium hover:bg-accent transition disabled:opacity-50"
      >
        {loading ? "Preparando…" : "Começar conversa"}
      </button>

      <p className="text-xs text-muted text-center">
        Ao continuar, você concorda em ter sua conversa gravada e processada por
        IA pra gerar sua devolutiva.
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  type = "text",
  autoComplete,
  required,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="w-full bg-surface border border-subtle rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 items-center py-4 border-y border-subtle">
      <span className="font-display text-2xl">{n}</span>
      <span className="text-xs text-muted leading-tight">{label}</span>
    </div>
  );
}

function PreviewCard() {
  return (
    <div className="w-full bg-surface border border-subtle rounded-2xl p-6 sm:p-8 space-y-4 relative overflow-hidden">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted">
          Devolutiva exemplo
        </p>
        <p className="font-display text-xl">Esperando Permissão</p>
      </div>
      <div className="space-y-3 text-sm text-foreground/80 leading-relaxed select-none">
        <p>
          Você sabe o que quer — isso é mais do que muita gente tem. O que trava
          você é a espera: por uma condição, um aval, o momento certo. Você
          mencionou que <em>&quot;quando tiver mais experiência, aí sim&quot;</em>{" "}
          — mas o momento certo raramente chega…
        </p>
        <p className="text-muted/70 blur-[2px] select-none">
          E sobre o que você falou do seu pai e da empresa familiar, vale separar
          dois medos diferentes que apareceram na conversa…
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
    </div>
  );
}
