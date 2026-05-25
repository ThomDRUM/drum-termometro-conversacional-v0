import { selectMany } from "./butterbase";
import type { Profile } from "./profiles";

type ResponseRow = {
  id: string;
  user_id: string | null;
  nome: string | null;
  email: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
};

type ResultRow = {
  response_id: string;
  result_profile: Profile;
  scores: Record<Profile, number> | null;
  anxiety_level: number | null;
  interpretacao: string | null;
  acoes: string[] | null;
  chosen_acao_index: number | null;
  clicked_cta: boolean;
  ai_model: string | null;
};

type VoiceRow = {
  response_id: string;
  elevenlabs_conversation_id: string | null;
  duracao_seg: number | null;
  transcript: Array<{ role: string; text: string; ts?: number }> | null;
  status: string;
};

export type Lead = {
  response_id: string;
  nome: string | null;
  email: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  result: ResultRow | null;
  voice: VoiceRow | null;
  score: number;
  band: "hot" | "warm" | "cold";
};

const TWO_DAYS = 1000 * 60 * 60 * 48;

function scoreLead(
  res: ResponseRow,
  result: ResultRow | null,
  voice: VoiceRow | null,
): number {
  let s = 0;
  if (result?.clicked_cta) s += 40;
  if (result?.chosen_acao_index != null) s += 20;
  if ((result?.anxiety_level ?? 0) >= 4) s += 15;
  if ((voice?.duracao_seg ?? 0) >= 240) s += 10;
  if (res.status === "concluido") s += 10;
  if (Date.now() - new Date(res.created_at).getTime() < TWO_DAYS) s += 5;
  return s;
}

function band(score: number): Lead["band"] {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

export async function listLeads(): Promise<Lead[]> {
  const [responses, results, voices] = await Promise.all([
    selectMany<ResponseRow>("assessment_responses", "order=created_at.desc"),
    selectMany<ResultRow>("assessment_results"),
    selectMany<VoiceRow>("voice_conversations"),
  ]);

  const resultByResponse = new Map(results.map((r) => [r.response_id, r]));
  const voiceByResponse = new Map(voices.map((v) => [v.response_id, v]));

  return responses.map((r) => {
    const result = resultByResponse.get(r.id) ?? null;
    const voice = voiceByResponse.get(r.id) ?? null;
    const score = scoreLead(r, result, voice);
    return {
      response_id: r.id,
      nome: r.nome,
      email: r.email,
      status: r.status,
      created_at: r.created_at,
      completed_at: r.completed_at,
      result,
      voice,
      score,
      band: band(score),
    };
  });
}

export async function getLead(responseId: string): Promise<Lead | null> {
  const leads = await listLeads();
  return leads.find((l) => l.response_id === responseId) ?? null;
}

export function leadStats(leads: Lead[]) {
  const total = leads.length;
  const completed = leads.filter((l) => l.status === "concluido").length;
  const cta = leads.filter((l) => l.result?.clicked_cta).length;
  const hot = leads.filter((l) => l.band === "hot").length;
  const last24h = leads.filter(
    (l) => Date.now() - new Date(l.created_at).getTime() < 86_400_000,
  ).length;
  const byProfile: Record<string, number> = {};
  for (const l of leads) {
    if (l.result?.result_profile) {
      byProfile[l.result.result_profile] =
        (byProfile[l.result.result_profile] ?? 0) + 1;
    }
  }
  return { total, completed, cta, hot, last24h, byProfile };
}
