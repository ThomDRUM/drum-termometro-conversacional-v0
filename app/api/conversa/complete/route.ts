import { NextResponse } from "next/server";
import { insert, updateById, selectOne } from "@/lib/butterbase";
import { waitForConversation, normalizeTranscript } from "@/lib/elevenlabs";
import { diagnose, buildFallback } from "@/lib/anthropic";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { response_id, conversation_id } = (await req.json()) as {
    response_id: string;
    conversation_id: string;
  };

  if (!response_id || !conversation_id) {
    return NextResponse.json(
      { error: "response_id and conversation_id required" },
      { status: 400 },
    );
  }

  const conv = await waitForConversation(conversation_id);
  const { transcript, variables } = normalizeTranscript(conv);

  const duracao     = conv.metadata?.call_duration_secs ?? 0;
  const userTurns   = transcript.filter((t) => t.role === "user").length;
  const termination = conv.metadata?.termination_reason ?? "unknown";

  console.log(
    `[complete] conv status: ${conv.status}, duracao: ${duracao}s, user turns: ${userTurns}, termination: ${termination}, variables:`,
    JSON.stringify(variables),
  );

  const voice = await selectOne<{ id: string }>(
    "voice_conversations",
    `response_id=eq.${response_id}`,
  );
  if (!voice) {
    return NextResponse.json(
      { error: `voice_conversation for response ${response_id} not found` },
      { status: 404 },
    );
  }

  // ── Checagem de qualidade ──────────────────────────────────
  // Insuficiente: dados mínimos para qualquer análise
  const isInsufficient = duracao < 60 || userTurns < 2;
  // Curta: válida mas abaixo do ideal — entrega com disclaimer
  const isShort = !isInsufficient && (duracao < 120 || userTurns < 4);

  await updateById("voice_conversations", voice.id, {
    elevenlabs_conversation_id: conversation_id,
    status: isInsufficient ? "insuficiente" : "concluida",
    transcript: transcript,
    extracted_variables: variables,
    duracao_seg: duracao || null,
    ended_at: new Date().toISOString(),
  });

  if (isInsufficient) {
    console.log(`[complete] Conversa insuficiente — duracao: ${duracao}s, turns: ${userTurns}, termination: ${termination}`);
    await updateById("assessment_responses", response_id, {
      status: "insuficiente",
      completed_at: new Date().toISOString(),
    });
    return NextResponse.json({ insufficient: true, response_id });
  }

  // ── Diagnóstico ───────────────────────────────────────────
  let diagnostico;
  let model = "fallback";
  let diagnoseError: string | null = null;
  try {
    const out = await diagnose(transcript, variables);
    diagnostico = out.diagnostico;
    model = out.model;
  } catch (err) {
    diagnoseError = String(err);
    console.error("Anthropic failed, using fallback:", err);
    diagnostico = buildFallback();
  }

  await insert("assessment_results", {
    response_id,
    phase:    diagnostico.phase,
    pathway:  diagnostico.pathway,
    clarity:  diagnostico.clarity,
    tension:  diagnostico.tension,
    actions:  diagnostico.actions,
    metadata: diagnostico.metadata,
    ai_model: model,
  });

  await updateById("assessment_responses", response_id, {
    status: "concluido",
    completed_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, response_id, conversa_curta: isShort, diagnose_error: diagnoseError, ai_model: model });
}
