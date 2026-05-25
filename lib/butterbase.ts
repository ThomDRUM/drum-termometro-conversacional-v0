const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const API_BASE = SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn("Supabase env vars missing");
}

type Row = Record<string, unknown>;

async function request<T = unknown>(
  path: string,
  init: RequestInit & { headers?: Record<string, string> } = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "return=representation",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Butterbase ${res.status} ${path}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function insert<T = Row>(table: string, data: Row): Promise<T> {
  // PostgREST returns array even for single insert
  const rows = await request<T[]>(`/${table}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return Array.isArray(rows) ? rows[0] : (rows as T);
}

export async function updateById<T = Row>(
  table: string,
  id: string,
  data: Row,
): Promise<T> {
  const rows = await request<T[]>(`/${table}?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return Array.isArray(rows) ? rows[0] : (rows as T);
}

export async function selectOne<T = Row>(
  table: string,
  filter: string,
): Promise<T | null> {
  const rows = await request<T[]>(`/${table}?${filter}&limit=1`);
  return rows[0] ?? null;
}

export async function selectMany<T = Row>(
  table: string,
  query: string = "",
): Promise<T[]> {
  const path = query ? `/${table}?${query}` : `/${table}`;
  return request<T[]>(path);
}
