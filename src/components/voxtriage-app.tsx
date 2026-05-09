"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  useAgent,
  useAgentContext,
  useCopilotKit,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";
import { CopilotChat } from "@copilotkit/react-ui";
import { TriageStage } from "@/components/triage-stage";
import { VoicePanel } from "@/components/voice-panel";
import { AgentActionUI } from "@/components/agent-action-ui";
import "@copilotkit/react-ui/styles.css";
import type { DemoScript } from "@/lib/demo-scripts";
import { parseA2UISurfacePayload } from "@/lib/triage-schema";
import {
  createInitialTriageSession,
  triageSessionReducer,
} from "@/lib/triage-session";
import { useSpeech } from "@/hooks/use-speech";

interface RuntimeStatus {
  provider: {
    provider: "gemini";
    mode: "developer" | "vertex";
    model: string;
    apiVersion: "v1" | "v1beta";
    location?: string;
  };
  checks: {
    hasGeminiApiKey: boolean;
    hasGoogleApiKey: boolean;
    hasProjectEnv: boolean;
    hasCredentialsFileEnv: boolean;
    credentialsFileExists: boolean;
    adcReady: boolean;
    resolvedProjectId: string | null;
    authError: string | null;
  };
}

export function VoxTriageApp() {
  const [session, dispatch] = useReducer(
    triageSessionReducer,
    undefined,
    createInitialTriageSession,
  );
  const resolveAskPatient = useRef<((answer: string) => void) | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedTranscript, setLastSubmittedTranscript] = useState("");
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null);
  const [runtimeStatusError, setRuntimeStatusError] = useState<string | null>(
    null,
  );

  const {
    transcript,
    setTranscript,
    resetTranscript,
    isListening,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    speak,
  } = useSpeech();

  const { agent } = useAgent({ agentId: "default" });
  const { copilotkit } = useCopilotKit();

  const instructions = useMemo(
    () =>
      [
        "Eres VoxTriage, un asistente inteligente de pre-consulta médica.",
        "Habla SIEMPRE en español de México y mantén un tono profesional pero empático.",
        "Tu objetivo es realizar el triage inicial: identificar síntomas, severidad y zona corporal.",
        "ACCIONES FRONTEND (Úsalas frecuentemente):",
        "1. setUrgency: Define severidad (1-5).",
        "2. setBodyZone: head, chest, abdomen, back, arm, leg.",
        "3. setTimeline: Define duración y lista de síntomas.",
        "4. setVitalsChecklist: Lista de signos vitales a tomar (ej: Presión, Oxigenación).",
        "5. setFollowUpQuestion: Úsala para dar una conclusión o pregunta final estática.",
        "6. askPatient (AG-UI): Úsala SIEMPRE que necesites una respuesta inmediata del paciente para continuar el triage. Esto inyectará un componente interactivo.",
        "7. setA2UISurface (A2UI): Úsala para actualizar el resumen declarativo visual.",
        "DINAMISMO: Prefiere askPatient sobre setFollowUpQuestion si esperas que el paciente responda algo específico.",
      ].join(" "),
    [],
  );
  const sessionContext = useMemo(
    () => ({
      urgencyLevel: session.urgencyLevel,
      bodyZone: session.bodyZone,
      duration: session.duration,
      symptoms: [...session.symptoms],
      vitalsNeeded: [...session.vitalsNeeded],
      followUpQuestion: session.followUpQuestion,
      a2uiSurface: session.a2uiSurface,
    }),
    [session],
  );

  const hasResults = useMemo(() => {
    return (
      session.symptoms.length > 0 ||
      session.a2uiSurface !== null ||
      session.activeAGUIQuestion !== null ||
      runtimeError !== null
    );
  }, [session, runtimeError]);

  useAgentContext({
    description: "Reglas operativas para VoxTriage.",
    value: { instructions },
  });

  useAgentContext({
    description: "Transcript actual del paciente para triage.",
    value: transcript,
  });

  useAgentContext({
    description: "Estado estructurado acumulado del triage actual.",
    value: sessionContext,
  });

  useFrontendTool({
      name: "setUrgency",
      description: "Define el nivel de urgencia del paciente de 1 a 5.",
      parameters: z.object({
        urgency: z.number().describe("Nivel de urgencia de 1 a 5"),
      }),
      handler: async ({ urgency }) => {
        const safeUrgency = Math.min(5, Math.max(1, Math.round(urgency))) as
          | 1
          | 2
          | 3
          | 4
          | 5;
        dispatch({ type: "setUrgency", urgency: safeUrgency });
      },
    });

  useFrontendTool({
      name: "setBodyZone",
      description: "Define la zona corporal principal afectada.",
      parameters: z.object({
        bodyZone: z
          .enum(["head", "chest", "abdomen", "back", "arm", "leg"])
          .describe("Zona corporal principal afectada"),
      }),
      handler: async ({ bodyZone }) => {
        dispatch({ type: "setBodyZone", bodyZone });
      },
    });

  useFrontendTool({
      name: "setTimeline",
      description: "Resume duración y síntomas detectados hasta el momento.",
      parameters: z.object({
        duration: z
          .string()
          .describe("Duración o momento de inicio del síntoma"),
        symptoms: z.array(z.string()).optional().describe("Lista de síntomas detectados"),
      }),
      handler: async ({ duration, symptoms }) => {
        dispatch({ type: "setTimeline", duration, symptoms });
      },
    });

  useFrontendTool({
      name: "setVitalsChecklist",
      description: "Lista los signos vitales que el personal debe tomar primero.",
      parameters: z.object({
        vitalsNeeded: z.array(z.string()).optional().describe("Signos vitales prioritarios"),
      }),
      handler: async ({ vitalsNeeded }) => {
        dispatch({
          type: "setVitalsChecklist",
          vitalsNeeded: vitalsNeeded ?? [],
        });
      },
    });

  useFrontendTool({
      name: "askPatient",
      description: "Realiza una pregunta dinámica al paciente y espera su respuesta para continuar el triage.",
      parameters: z.object({
        question: z.string().describe("La pregunta que se le hará al paciente"),
      }),
      render: ({ args, status }) => {
        if (status === "complete" || !args.question) return null;
        return (
          <AgentActionUI 
            question={args.question} 
            onSubmit={(answer) => {
              setTranscript(prev => prev + "\nPaciente: " + answer);
              dispatch({ type: "setActiveAGUIQuestion", question: null });
              if (resolveAskPatient.current) {
                resolveAskPatient.current(answer);
                resolveAskPatient.current = null;
              }
            }} 
          />
        );
      },
      handler: async ({ question }) => {
        dispatch({ type: "setActiveAGUIQuestion", question });
        return new Promise<string>((resolve) => {
          resolveAskPatient.current = resolve;
        });
      }
    });

  useFrontendTool({
      name: "setFollowUpQuestion",
      description: "Genera una pregunta de seguimiento breve y empática.",
      parameters: z.object({
        question: z
          .string()
          .describe("Pregunta de seguimiento para el paciente"),
      }),
      handler: async ({ question }) => {
        dispatch({ type: "setFollowUpQuestion", question });
      },
    });

  useFrontendTool({
      name: "setA2UISurface",
      description:
        "Construye la superficie A2UI final del estado actual con JSON declarativo.",
      parameters: z.object({
        version: z.enum(["0.1"]).describe("Versión del contrato declarativo"),
        surfaceType: z
          .enum([
            "urgency_card",
            "body_focus_panel",
            "medical_summary_surface",
          ])
          .describe("Tipo de superficie A2UI"),
        title: z.string().describe("Título principal de la superficie"),
        severity: z.number().describe("Nivel de urgencia de 1 a 5"),
        bodyZone: z
          .enum(["head", "chest", "abdomen", "back", "arm", "leg"])
          .optional()
          .describe("Zona corporal prioritaria"),
        symptoms: z.array(z.string()).optional().describe("Síntomas estructurados"),
        duration: z.string().optional().describe("Duración reportada"),
        vitalsNeeded: z
          .array(z.string())
          .optional()
          .describe("Signos vitales por tomar"),
        followUpQuestion: z
          .string()
          .describe("Pregunta siguiente para el paciente"),
      }),
      handler: async (args) => {
        try {
          const payload = parseA2UISurfacePayload(args);
          dispatch({ type: "setA2UISurface", surface: payload });
          setRuntimeError(null);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "No se pudo validar la superficie A2UI.";
          setRuntimeError(message);
        }
      },
    });

  useEffect(() => {
    if (!session.followUpQuestion) return;
    speak(session.followUpQuestion);
  }, [session.followUpQuestion, speak]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRuntimeStatus() {
      try {
        const response = await fetch("/api/runtime-status", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("No se pudo consultar el estado de Vertex.");
        }

        const payload = (await response.json()) as RuntimeStatus;
        setRuntimeStatus(payload);
        setRuntimeStatusError(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo consultar el estado de runtime.";
        setRuntimeStatusError(message);
      }
    }

    void loadRuntimeStatus();

    return () => controller.abort();
  }, []);

  async function runTranscriptAnalysis(nextTranscript: string) {
    const cleanTranscript = nextTranscript.trim();
    if (!cleanTranscript) return;

    setIsSubmitting(true);
    setRuntimeError(null);
    dispatch({ type: "reset" });
    resetTranscript();
    setTranscript(cleanTranscript);
    setLastSubmittedTranscript(cleanTranscript);

    try {
      agent.setMessages([]);
      agent.addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: `Analiza este caso de triage: "${cleanTranscript}". Usa las acciones frontend para actualizar urgencia, zona corporal, duración, signos vitales y termina llamando setA2UISurface.`,
      });
      await copilotkit.runAgent({ agent });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      // CopilotKit enriches errors with these fields
      const enriched = err as {
        runtimeErrorCode?: string;
        agentId?: string;
        source?: string;
        event?: Record<string, unknown>;
        cause?: unknown;
      };

      const parts: string[] = [err.message];

      if (enriched.runtimeErrorCode) {
        parts.push(`Codigo: ${enriched.runtimeErrorCode}`);
      }
      if (enriched.source) {
        parts.push(`Origen: ${enriched.source}`);
      }
      if (enriched.agentId) {
        parts.push(`Agente: ${enriched.agentId}`);
      }
      if (enriched.cause) {
        parts.push(`Causa: ${String(enriched.cause)}`);
      }
      if (enriched.event) {
        parts.push(`Evento: ${JSON.stringify(enriched.event)}`);
      }

      const fullMessage = parts.join(" | ");
      setRuntimeError(fullMessage);

      console.error("[VoxTriage] Agent run failed:", {
        message: err.message,
        runtimeErrorCode: enriched.runtimeErrorCode,
        source: enriched.source,
        agentId: enriched.agentId,
        event: enriched.event,
        cause: enriched.cause,
        stack: err.stack,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleScriptPick(script: DemoScript) {
    setTranscript(script.transcript);
    void runTranscriptAnalysis(script.transcript);
  }

  function handleFollowUpAnswer(answer: string) {
    setTranscript(prev => prev + "\nPaciente (seguimiento): " + answer);
    void runTranscriptAnalysis(transcript + "\n" + answer);
  }

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(191,88,62,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(21,90,84,0.22),transparent_28%),linear-gradient(180deg,#f6efe5,#efe4d6_45%,#ece4d9)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(19,38,39,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(19,38,39,0.4)_1px,transparent_1px)] [background-size:34px_34px]" />

      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <VoicePanel
          transcript={transcript}
          isListening={isListening}
          isSupported={isSupported}
          isSubmitting={isSubmitting}
          speechError={speechError}
          onTranscriptChange={setTranscript}
          onStartListening={startListening}
          onStopListening={stopListening}
          onSubmit={() => void runTranscriptAnalysis(transcript)}
          onScriptPick={handleScriptPick}
        />

        {hasResults && (
          <div className="mt-8">
            <TriageStage 
              session={session} 
              runtimeError={runtimeError} 
              onFollowUpAnswer={handleFollowUpAnswer}
            />
          </div>
        )}
      </div>
    </main>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.7rem] border border-[rgba(27,59,57,0.1)] bg-white/70 p-4">
      <p className="text-[0.72rem] uppercase tracking-[0.3em] text-[#8b9b96]">
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#1a3936]">{value}</p>
    </div>
  );
}

function formatRuntimeStatus(
  runtimeStatus: RuntimeStatus | null,
  runtimeStatusError: string | null,
) {
  if (runtimeStatusError) {
    return runtimeStatusError;
  }

  if (!runtimeStatus) {
    return "Verificando credenciales de Vertex...";
  }

  const { provider, checks } = runtimeStatus;

  if (provider.mode === "developer") {
    return checks.hasGeminiApiKey || checks.hasGoogleApiKey
      ? `Developer API lista con ${provider.model}.`
      : "Falta GEMINI_API_KEY o GOOGLE_API_KEY.";
  }

  if (checks.adcReady) {
    const projectLabel = checks.resolvedProjectId || "proyecto resuelto por ADC";
    return `Vertex listo en ${provider.location} con ${provider.model}. Proyecto: ${projectLabel}.`;
  }

  return checks.authError
    ? `Vertex aún no autentica: ${checks.authError}`
    : "Vertex está configurado pero ADC todavía no responde.";
}
