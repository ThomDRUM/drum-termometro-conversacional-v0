import { createHash, randomBytes } from "node:crypto";

// Note: hackathon MVP. Not bcrypt/argon2 — single SHA-256 with per-user salt.
// Good enough to avoid storing plaintext; replace before any real launch.

export function hashSenha(senha: string, salt?: string): string {
  const useSalt = salt ?? randomBytes(8).toString("hex");
  const digest = createHash("sha256")
    .update(`${useSalt}:${senha}`)
    .digest("hex");
  return `${useSalt}$${digest}`;
}

export function verifySenha(senha: string, stored: string): boolean {
  const [salt, digest] = stored.split("$");
  if (!salt || !digest) return false;
  const got = createHash("sha256").update(`${salt}:${senha}`).digest("hex");
  return got === digest;
}
