"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useRouter } from "next/navigation";

const TARGET_SECONDS = 300; // 5 min

function Inner({ responseId }: { responseId: string }) {
  const router = useRouter();
  const conversationIdRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<
    "idle" | "connecting" | "live" | "processing" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [elapsed, setElapsed] = useState(0);

  const conv = useConversation({
    onConnect: ({ conversationId }) => {
      conversationIdRef.current = conversationId;
      setPhase("live");
    },
    onMessage: (msg: { source?: string; message?: string }) => {
      if (msg?.source === "ai" && typeof msg?.message === "string") {
        setCaption(msg.message);
      }
    },
    onDisconnect: async () => {
      const cid = conversationIdRef.current;
      if (!cid) {
        setPhase("error");
        setErrorMsg("Conversa não chegou a iniciar.");
        return;
      }
      setPhase("processing");
      try {
        const res = await fetch("/api/conversa/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ response_id: responseId, conversation_id: cid }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json() as { ok: boolean; diagnose_error?: string | null; ai_model?: string };
        if (data.diagnose_error) {
          console.error("[DRUM] diagnose error:", data.diagnose_error);
          setPhase("error");
          setErrorMsg("Erro na inferência: " + data.diagnose_error);
          return;
        }
        router.push(`/diagnostico/${responseId}`);
      } catch (e) {
        setPhase("error");
        setErrorMsg(String(e));
      }
    },
    onError: (msg) => {
      setPhase("error");
      setErrorMsg(msg);
    },
  });

  useEffect(() => {
    if (phase !== "live") return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const start = useCallback(async () => {
    setPhase("connecting");
    setErrorMsg(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const tokenRes = await fetch("/api/conversa/token");
      if (!tokenRes.ok) throw new Error(`token: ${await tokenRes.text()}`);
      const { signed_url } = (await tokenRes.json()) as { signed_url: string };
      await conv.startSession({
        signedUrl: signed_url,
        connectionType: "websocket",
      });
    } catch (e) {
      setPhase("error");
      setErrorMsg(String(e));
    }
  }, [conv]);

  // auto-start the conversation as soon as this view appears
  useEffect(() => {
    if (phase === "idle") void start();
  }, [phase, start]);

  return (
    <div className="flex flex-col items-center gap-10 w-full max-w-xl">
      {phase === "connecting" && (
        <div className="flex flex-col items-center gap-3 mt-12">
          <div className="w-8 h-8 border-2 border-subtle border-t-accent rounded-full animate-spin" />
          <p className="text-muted">Conectando…</p>
        </div>
      )}

      {phase === "live" && (
        <>
          <Waveform isSpeaking={conv.isSpeaking} getData={conv.getOutputByteFrequencyData} />

          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {conv.isSpeaking ? "Termômetro está falando" : "Te escutando"}
          </p>

          <Caption text={caption} visible={conv.isSpeaking} />

          <Progress elapsed={elapsed} total={TARGET_SECONDS} />

          <button
            onClick={() => conv.endSession()}
            className="mt-2 text-sm text-muted hover:text-accent transition-colors underline underline-offset-4"
          >
            Encerrar conversa
          </button>
        </>
      )}

      {phase === "processing" && <ProcessingState />}

      {phase === "error" && (
        <div className="flex flex-col items-center gap-3 text-center bg-accent-soft rounded-2xl px-6 py-5">
          <p className="text-foreground text-sm">{errorMsg || "Algo deu errado."}</p>
          <button
            onClick={start}
            className="text-sm font-medium text-accent hover:underline"
          >
            Tentar de novo
          </button>
        </div>
      )}
    </div>
  );
}

function Waveform({
  isSpeaking,
  getData,
}: {
  isSpeaking: boolean;
  getData: () => Uint8Array;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      let data: Uint8Array | null = null;
      try {
        data = getData();
      } catch {
        data = null;
      }
      const bars = 48;
      const gap = 4 * dpr;
      const barW = (w - gap * (bars - 1)) / bars;
      const centerY = h / 2;
      for (let i = 0; i < bars; i++) {
        const v = data ? data[Math.floor((i / bars) * data.length)] / 255 : 0;
        const amp = isSpeaking ? Math.max(v * h * 0.85, h * 0.04) : h * 0.04;
        const x = i * (barW + gap);
        ctx.fillStyle = isSpeaking ? "#c4634f" : "#7a6f6555";
        const y = centerY - amp / 2;
        const r = Math.min(barW / 2, amp / 2);
        roundRect(ctx, x, y, barW, amp, r);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [isSpeaking, getData]);
  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 sm:h-40"
      aria-hidden="true"
    />
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function Caption({ text, visible }: { text: string; visible: boolean }) {
  if (!text) return <div className="h-16" />;
  return (
    <p
      className={`min-h-16 text-center font-display text-lg sm:text-xl leading-snug text-foreground transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-50"
      }`}
    >
      {text}
    </p>
  );
}

function Progress({ elapsed, total }: { elapsed: number; total: number }) {
  const pct = Math.min(100, (elapsed / total) * 100);
  const mm = Math.floor(elapsed / 60);
  const ss = String(elapsed % 60).padStart(2, "0");
  return (
    <div className="w-full max-w-xs flex flex-col gap-2 items-center">
      <div className="h-1 w-full bg-subtle rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted font-mono">
        {mm}:{ss} <span className="text-muted/60">de ~5 min</span>
      </p>
    </div>
  );
}

const PROCESS_STEPS = [
  "Relendo o que você disse…",
  "Identificando o padrão por trás…",
  "Escrevendo a sua devolutiva…",
  "Quase lá — escolhendo as 3 ações…",
];

function ProcessingState() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setI((p) => (p + 1) % PROCESS_STEPS.length),
      2500,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-5 mt-12">
      <div className="w-10 h-10 border-2 border-subtle border-t-accent rounded-full animate-spin" />
      <p className="text-foreground font-display text-lg transition-opacity duration-300">
        {PROCESS_STEPS[i]}
      </p>
      <p className="text-xs text-muted">Pode levar de 20 a 40 segundos.</p>
    </div>
  );
}

export default function Conversa({ responseId }: { responseId: string }) {
  return (
    <ConversationProvider>
      <Inner responseId={responseId} />
    </ConversationProvider>
  );
}
