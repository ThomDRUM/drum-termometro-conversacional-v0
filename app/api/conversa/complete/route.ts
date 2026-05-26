import { NextResponse } from "next/server";
import { insert, updateById, selectOne } from "@/lib/butterbase";
import { waitForConversation, normalizeTranscript } from "@/lib/elevenlabs";
import { diagnose, buildFallback } from "@/lib/anthropic";

export const maxDuration = 90;

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

  await updateById("voice_conversations", voice.id, {
    elevenlabs_conversation_id: conversation_id,
    status: "concluida",
    transcript: transcript,
    extracted_variables: variables,
    duracao_seg: conv.metadata?.call_duration_secs ?? null,
    ended_at: new Date().toISOString(),
  });

  let diagnostico;
  let model = "fallback";
  try {
    const out = await diagnose(transcript, variables);
    diagnostico = out.diagnostico;
    model = out.model;
  } catch (err) {
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

  return NextResponse.json({ ok: true, response_id });
}
