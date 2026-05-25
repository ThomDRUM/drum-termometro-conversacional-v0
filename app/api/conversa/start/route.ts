import { NextResponse } from "next/server";
import { insert, selectOne } from "@/lib/butterbase";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    user_id?: string;
  };

  let nome: string | null = null;
  let email: string | null = null;

  if (body.user_id) {
    const user = await selectOne<{ nome: string; email: string }>(
      "users",
      `id=eq.${body.user_id}`,
    );
    if (user) {
      nome = user.nome;
      email = user.email;
    }
  }

  const response = await insert<{ id: string }>("assessment_responses", {
    template_id: process.env.TERMOMETRO_TEMPLATE_ID,
    user_id: body.user_id ?? null,
    nome,
    email,
    status: "enviado",
  });

  const voice = await insert<{ id: string }>("voice_conversations", {
    response_id: response.id,
    status: "iniciada",
  });

  return NextResponse.json({ response_id: response.id, voice_id: voice.id });
}
