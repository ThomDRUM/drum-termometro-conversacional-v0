import { NextResponse } from "next/server";
import { selectOne } from "@/lib/butterbase";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const result = await selectOne(
    "assessment_results",
    `response_id=eq.${id}`,
  );
  if (!result) {
    return NextResponse.json({ ready: false });
  }

  const [response, voice] = await Promise.all([
    selectOne("assessment_responses", `id=eq.${id}`),
    selectOne<{
      duracao_seg: number | null;
      transcript: Array<{ role: string }> | null;
    }>("voice_conversations", `response_id=eq.${id}`),
  ]);

  // Compute conversa_curta from voice data (no schema change needed)
  const duracao    = voice?.duracao_seg ?? 0;
  const userTurns  = (voice?.transcript ?? []).filter((t) => t.role === "user").length;
  const conversaCurta = duracao < 120 || userTurns < 4;

  return NextResponse.json({ ready: true, result, response, conversa_curta: conversaCurta });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = (await req.json()) as {
    clicked_cta?: boolean;
    chosen_action_type?: string; // 'para_dentro' | 'para_fora' | 'prototipar'
  };

  const patch: Record<string, unknown> = {};
  if (typeof body.clicked_cta === "boolean") {
    patch.clicked_cta = body.clicked_cta;
  }
  if (typeof body.chosen_action_type === "string") {
    patch.chosen_action_type = body.chosen_action_type;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { updateById } = await import("@/lib/butterbase");
  const row = await selectOne<{ id: string }>(
    "assessment_results",
    `response_id=eq.${id}`,
  );
  if (row) {
    await updateById("assessment_results", row.id, patch);
  }
  return NextResponse.json({ ok: true });
}
