"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.25em] text-accent font-medium">
          Algo travou
        </p>
        <h1 className="font-display text-4xl tracking-tight">
          A gente deu uma derrapada.
        </h1>
        <p className="text-muted leading-relaxed">
          Aconteceu um erro inesperado. Geralmente uma nova tentativa resolve. Se
          continuar, manda mensagem pra gente.
        </p>
        <button
          onClick={reset}
          className="rounded-full bg-foreground text-background px-8 py-4 font-medium hover:bg-accent transition"
        >
          Tentar de novo
        </button>
      </div>
    </main>
  );
}
