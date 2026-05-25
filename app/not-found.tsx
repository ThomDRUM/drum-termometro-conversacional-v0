import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
          404
        </p>
        <h1 className="font-display text-4xl tracking-tight">
          Não achamos essa página.
        </h1>
        <p className="text-muted">
          Talvez você tenha vindo de um link antigo. Bora começar do início?
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-foreground text-background px-8 py-4 font-medium hover:bg-accent transition"
        >
          Voltar pra home
        </Link>
      </div>
    </main>
  );
}
