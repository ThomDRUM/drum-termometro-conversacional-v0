import { requireAdmin } from "@/lib/admin";
import { listLeads, leadStats } from "@/lib/leads";
import LeadsTable from "./leads-table";
import { PROFILE_LABELS } from "@/lib/profiles";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const leads = await listLeads();
  const stats = leadStats(leads);

  return (
    <main className="flex-1 px-6 sm:px-10 pb-20">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="flex items-baseline justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
              Painel
            </p>
            <h1 className="font-display text-4xl tracking-tight">Leads</h1>
          </div>
          <LogoutButton />
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Completados" value={stats.completed} />
          <Stat label="Clicaram CTA" value={stats.cta} accent />
          <Stat label="Quentes" value={stats.hot} accent />
          <Stat label="Últimas 24h" value={stats.last24h} />
        </section>

        <section className="bg-surface border border-subtle rounded-2xl p-5 sm:p-6 space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted">
            Distribuição dos perfis
          </p>
          <ProfileChart byProfile={stats.byProfile} total={stats.completed} />
        </section>

        <LeadsTable leads={leads} />
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface border border-subtle rounded-2xl p-4">
      <p className="text-xs text-muted uppercase tracking-widest">{label}</p>
      <p
        className={`font-display text-3xl tracking-tight mt-1 ${
          accent ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ProfileChart({
  byProfile,
  total,
}: {
  byProfile: Record<string, number>;
  total: number;
}) {
  if (total === 0) {
    return <p className="text-sm text-muted">Nenhum diagnóstico ainda.</p>;
  }
  return (
    <div className="space-y-2">
      {Object.entries(PROFILE_LABELS).map(([key, label]) => {
        const v = byProfile[key] ?? 0;
        const pct = total > 0 ? (v / total) * 100 : 0;
        return (
          <div
            key={key}
            className="grid grid-cols-[1fr_auto] gap-3 items-center"
          >
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">{label}</span>
              </div>
              <div className="h-1.5 bg-subtle rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-muted font-mono w-12 text-right">
              {v} ({Math.round(pct)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { clearAdminCookie } = await import("@/lib/admin");
        await clearAdminCookie();
        const { redirect } = await import("next/navigation");
        redirect("/admin/login");
      }}
    >
      <button
        type="submit"
        className="text-sm text-muted hover:text-accent transition underline underline-offset-4"
      >
        Sair
      </button>
    </form>
  );
}
