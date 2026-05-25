import { NextResponse } from "next/server";

const AGENT_ID = process.env.ELEVENLABS_AGENT_ID!;
const API_KEY = process.env.ELEVENLABS_API_KEY!;

export async function GET() {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${AGENT_ID}`,
    { headers: { "xi-api-key": API_KEY }, cache: "no-store" },
  );
  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json(
      { error: `ElevenLabs ${res.status}: ${body}` },
      { status: 500 },
    );
  }
  const data = (await res.json()) as { signed_url: string };
  return NextResponse.json({ signed_url: data.signed_url });
}
