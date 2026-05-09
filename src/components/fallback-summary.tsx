import type { TriageSessionState } from "@/lib/triage-session";

interface FallbackSummaryProps {
  session: TriageSessionState;
  errorMessage?: string | null;
}

export function FallbackSummary({
  session,
  errorMessage,
}: FallbackSummaryProps) {
  return (
    <section className="rounded-[2rem] border border-black/10 bg-white/90 p-6 text-[#000000] shadow-[0_20px_80px_rgba(0,0,0,0.05)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#000000]">
        Resumen Clínico Estructurado
      </p>
      <h3 className="mt-3 font-[family:var(--font-display)] text-3xl leading-none text-[#000000]">
        Análisis de triage
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#000000]">
        {errorMessage ||
          "Información recopilada durante la interacción con el paciente."}
      </p>

      <dl className="mt-6 grid gap-4 text-sm">
        <div className="rounded-2xl bg-black/5 p-4">
          <dt className="text-[0.7rem] uppercase tracking-[0.3em] text-[#000000]">
            Urgencia
          </dt>
          <dd className="mt-2 text-xl font-semibold text-[#000000]">
            {session.urgencyLevel ? `${session.urgencyLevel}/5` : "Pendiente"}
          </dd>
        </div>
        <div className="rounded-2xl bg-black/5 p-4">
          <dt className="text-[0.7rem] uppercase tracking-[0.3em] text-[#000000]">
            Zona
          </dt>
          <dd className="mt-2 text-xl font-semibold text-[#000000]">
            {session.bodyZone || "Sin identificar"}
          </dd>
        </div>
        <div className="rounded-2xl bg-black/5 p-4">
          <dt className="text-[0.7rem] uppercase tracking-[0.3em] text-[#000000]">
            Síntomas
          </dt>
          <dd className="mt-2 leading-6 text-[#000000]">
            {session.symptoms.length > 0
              ? session.symptoms.join(", ")
              : "Sin síntomas estructurados aún."}
          </dd>
        </div>
        <div className="rounded-2xl bg-black/5 p-4">
          <dt className="text-[0.7rem] uppercase tracking-[0.3em] text-[#000000]">
            Próxima pregunta
          </dt>
          <dd className="mt-2 leading-6 text-[#000000]">
            {session.followUpQuestion || "Sin seguimiento todavía."}
          </dd>
        </div>
      </dl>
    </section>
  );
}
