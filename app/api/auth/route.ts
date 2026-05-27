import { NextResponse } from "next/server";
import { insert, selectOne } from "@/lib/butterbase";
import { hashSenha, verifySenha } from "@/lib/auth";

type User = { id: string; nome: string; email: string; telefone: string | null; senha_hash: string | null };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    nome?: string;
    email?: string;
    telefone?: string;
    senha?: string;
  } | null;

  if (!body?.email || !body?.senha) {
    return NextResponse.json(
      { error: "email e senha são obrigatórios" },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();
  const senha = body.senha;
  const nome = body.nome?.trim() || email.split("@")[0];
  const telefone = body.telefone?.trim() || null;

  const existing = await selectOne<User>("users", `email=eq.${encodeURIComponent(email)}`);

  if (existing) {
    if (!existing.senha_hash) {
      return NextResponse.json(
        { error: "Esse email já existe sem senha cadastrada." },
        { status: 409 },
      );
    }
    if (!verifySenha(senha, existing.senha_hash)) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
    }
    return NextResponse.json({
      user_id: existing.id,
      nome: existing.nome,
      created: false,
    });
  }

  const user = await insert<User>("users", {
    nome,
    email,
    telefone,
    senha_hash: hashSenha(senha),
    role: "mentorado",
  });

  return NextResponse.json({ user_id: user.id, nome: user.nome, created: true });
}
