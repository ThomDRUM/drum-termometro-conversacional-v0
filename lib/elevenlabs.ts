const API_KEY = process.env.ELEVENLABS_API_KEY!;

export type Turn = { role: "agent" | "user"; text: string; ts?: number };

export type ElevenLabsConversation = {
  conversation_id: string;
  status: string;
  transcript: Array<{
    role: "agent" | "user";
    message: string | null;
    time_in_call_secs: number;
  }>;
  analysis?: {
    data_collection_results?: Record<
      string,
      { value: unknown; rationale?: string }
    >;
    transcript_summary?: string;
  };
  metadata?: {
    call_duration_secs?: number;
    start_time_unix_secs?: number;
    termination_reason?: string;
  };
};

export async function getConversation(
  conversationId: string,
): Promise<ElevenLabsConversation> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
    { headers: { "xi-api-key": API_KEY }, cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export function normalizeTranscript(
  conv: ElevenLabsConversation,
): { transcript: Turn[]; variables: Record<string, unknown> } {
  const transcript: Turn[] = conv.transcript
    .filter((t) => t.message)
    .map((t) => ({
      role: t.role,
      text: t.message!,
      ts: t.time_in_call_secs,
    }));
  const variables: Record<string, unknown> = {};
  const results = conv.analysis?.data_collection_results;
  if (results) {
    for (const [k, v] of Object.entries(results)) variables[k] = v.value;
  }
  return { transcript, variables };
}

// Poll until the ElevenLabs side finishes processing (transcript + analysis).
// Important: ElevenLabs sets status "done" as soon as the call ends, but the
// transcript is populated asynchronously. We must wait for both conditions.
export async function waitForConversation(
  conversationId: string,
  { maxMs = 30_000, intervalMs = 2_000 } = {},
): Promise<ElevenLabsConversation> {
  const deadline = Date.now() + maxMs;
  let last: ElevenLabsConversation | null = null;
  while (Date.now() < deadline) {
    try {
      last = await getConversation(conversationId);
      const statusReady = last.status === "done" || last.status === "processed";
      const transcriptReady = last.transcript.length > 0;
      if (statusReady && transcriptReady) return last;
    } catch {
      // ignore transient
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  if (!last) throw new Error("ElevenLabs conversation never appeared");
  return last;
}
