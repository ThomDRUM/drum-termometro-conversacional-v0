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
  const response = await selectOne(
    "assessment_responses",
    `id=eq.${id}`,
  );
  return NextResponse.json({ ready: true, result, response });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = (await req.json()) as {
    clicked_cta?: boolean;
    chosen_acao_index?: number;
  };
  const patch: Record<string, unknown> = {};
  if (typeof body.clicked_cta === "boolean") patch.clicked_cta = body.clicked_cta;
  if (typeof body.chosen_acao_index === "number")
    patch.chosen_acao_index = body.chosen_acao_index;

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
