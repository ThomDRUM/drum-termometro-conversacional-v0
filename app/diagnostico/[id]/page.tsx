import ResultView from "./result-view";

export default async function DiagnosticoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="flex-1 flex items-start justify-center px-6 py-12 sm:py-20">
      <ResultView responseId={id} />
    </main>
  );
}
