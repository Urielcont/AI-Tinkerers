"use client";

import {
  Activity,
  HeartPulse,
  MessagesSquare,
  ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";

import { A2UIStage } from "@/components/a2ui-stage";
import { FallbackSummary } from "@/components/fallback-summary";
import { BodyHeatMap } from "@/components/body-heat-map";
import { AgentActionUI } from "@/components/agent-action-ui";
import type { TriageSessionState } from "@/lib/triage-session";

interface TriageStageProps {
  session: TriageSessionState;
  runtimeError: string | null;
}

function severityLabel(level: number | null) {
  if (!level) return "Pendiente";
  if (level >= 4) return "Alta";
  if (level === 3) return "Media";
  return "Baja";
}

export function TriageStage({ session, runtimeError }: TriageStageProps) {
  const canRenderA2UI = !!session.a2uiSurface && !runtimeError;

  return (
    <section className="rounded-[2.5rem] border border-[rgba(0,0,0,0.08)] bg-[#fdfaf3] p-8 text-[#000000] shadow-[0_40px_140px_rgba(0,0,0,0.15)]">
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-black/5 pb-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#000000]">
            Centro generativo
          </p>
          <h2 className="mt-4 font-[family:var(--font-display)] text-5xl font-medium tracking-tight text-[#000000]">
            Superficie clínica <span className="text-[#000000]">A2UI</span>
          </h2>
        </div>
        <div className="grid min-w-[20rem] grid-cols-2 gap-4">
          <StageMetric
            icon={<ShieldAlert size={16} className="text-[#000000]" />}
            label="Urgencia"
            value={severityLabel(session.urgencyLevel)}
          />
          <StageMetric
            icon={<HeartPulse size={16} className="text-[#000000]" />}
            label="Zona"
            value={session.bodyZone || "Escuchando..."}
          />
          <StageMetric
            icon={<Activity size={16} className="text-[#000000]" />}
            label="Signos"
            value={String(session.vitalsNeeded.length)}
          />
          <StageMetric
            icon={<MessagesSquare size={16} className="text-[#000000]" />}
            label="Análisis"
            value={session.followUpQuestion ? "Completado" : "Procesando"}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mt-8"
      >
        {session.activeAGUIQuestion && (
           <div className="mb-8">
              <AgentActionUI 
                question={session.activeAGUIQuestion} 
                onSubmit={(answer) => {
                  // Esto se maneja vía CopilotKit handler, pero podemos añadir feedback aquí
                }}
              />
           </div>
        )}

        {canRenderA2UI && session.a2uiSurface ? (
          <div className={session.a2uiSurface.surfaceType === "medical_summary_surface" ? "grid gap-6 lg:grid-cols-[240px_1fr]" : ""}>
            {session.a2uiSurface.surfaceType === "medical_summary_surface" && (
              <div className="flex justify-center lg:justify-start">
                <BodyHeatMap 
                  zone={session.bodyZone} 
                  severity={session.urgencyLevel || 1} 
                />
              </div>
            )}
            <A2UIStage payload={session.a2uiSurface} />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
             <div className="flex justify-center lg:justify-start">
                <BodyHeatMap 
                  zone={session.bodyZone} 
                  severity={session.urgencyLevel || 1} 
                />
              </div>
            <FallbackSummary session={session} errorMessage={runtimeError} />
          </div>
        )}
      </motion.div>
    </section>
  );
}

function StageMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-black/10 bg-black/5 p-3 backdrop-blur">
      <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.3em] text-[#000000]">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-lg font-semibold text-[#000000]">{value}</p>
    </div>
  );
}
