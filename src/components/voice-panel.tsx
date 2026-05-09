"use client";

import { Mic, PauseCircle, Send, Sparkles, Waves } from "lucide-react";
import { useEffect, useState } from "react";

import { demoScripts, type DemoScript } from "@/lib/demo-scripts";

interface VoicePanelProps {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  isSubmitting: boolean;
  speechError: string | null;
  onTranscriptChange: (value: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmit: () => void;
  onScriptPick: (script: DemoScript) => void;
}

export function VoicePanel({
  transcript,
  isListening,
  isSupported,
  isSubmitting,
  speechError,
  onTranscriptChange,
  onStartListening,
  onStopListening,
  onSubmit,
  onScriptPick,
}: VoicePanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use false during SSR and initial hydration to match server output
  const effectivelySupported = mounted ? isSupported : false;
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-[rgba(31,53,50,0.14)] bg-[linear-gradient(180deg,rgba(252,248,240,0.98),rgba(244,236,227,0.94))] p-6 shadow-[0_30px_120px_rgba(31,53,50,0.16)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(195,79,55,0.13),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(44,125,119,0.16),transparent_28%)]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#b56d53]">
              Sala de espera viva
            </p>
            <h1 className="mt-4 max-w-xl font-[family:var(--font-display)] text-5xl leading-[0.9] text-[#173634] md:text-6xl">
              VoxTriage convierte síntomas en una sala que piensa contigo.
            </h1>
          </div>
          <div className="rounded-full border border-[rgba(31,53,50,0.1)] bg-white/65 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#275b57]">
            Demo es-MX
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-base leading-8 text-[#3e5852]">
          Habla como paciente o dispara uno de los tres guiones de jurado. El
          agente debe escuchar, clasificar, preguntar y construir una superficie
          A2UI visible sin formularios prehechos.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            disabled={!effectivelySupported}
            className="inline-flex items-center gap-3 rounded-full border border-[#1f4e4a] bg-[#173634] px-5 py-3 text-sm font-semibold tracking-[0.18em] text-[#f7f3ea] transition hover:bg-[#204541] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isListening ? <PauseCircle size={18} /> : <Mic size={18} />}
            {isListening ? "DETENER" : "HABLAR"}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!transcript.trim() || isSubmitting}
            className="inline-flex items-center gap-3 rounded-full border border-[#c04d31] bg-[#f6d4c8] px-5 py-3 text-sm font-semibold tracking-[0.18em] text-[#7e2f24] transition hover:bg-[#f0c1b0] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={18} />
            {isSubmitting ? "ANALIZANDO" : "ANALIZAR"}
          </button>
        </div>

        <div className="mt-8 rounded-[2rem] border border-[rgba(31,53,50,0.12)] bg-[#fffdf8]/80 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#4a6a63]">
            <Waves size={14} />
            Transcript en vivo
          </div>
          <textarea
            value={transcript}
            onChange={(event) => onTranscriptChange(event.target.value)}
            placeholder="Tengo dolor de pecho desde esta mañana, me cuesta respirar y tengo 62 años..."
            className="mt-4 min-h-36 w-full resize-none border-none bg-transparent font-medium text-[#183533] outline-none placeholder:text-[#91a8a2]"
          />
          {speechError ? (
            <p className="mt-3 text-sm text-[#a1402c]">{speechError}</p>
          ) : (
            <p className="mt-3 text-sm text-[#5c756f]">
              Si el micrófono falla, pega texto aquí y dispara el mismo pipeline
              de CopilotKit.
            </p>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#4a6a63]">
            <Sparkles size={14} />
            Scripts de jurado
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {demoScripts.map((script) => (
              <button
                key={script.id}
                type="button"
                onClick={() => onScriptPick(script)}
                className="group rounded-[1.75rem] border border-[rgba(31,53,50,0.1)] bg-white/75 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#1f4e4a] hover:shadow-[0_20px_50px_rgba(31,53,50,0.12)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c04d31]">
                  {script.label}
                </p>
                <h3 className="mt-3 font-[family:var(--font-display)] text-2xl text-[#173634]">
                  {script.emphasis}
                </h3>
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#516761]">
                  {script.transcript}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
