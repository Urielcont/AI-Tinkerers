import type { A2UISurfacePayload, BodyZone } from "@/lib/triage-schema";

export interface TriageSessionState {
  urgencyLevel: 1 | 2 | 3 | 4 | 5 | null;
  bodyZone: BodyZone | null;
  symptoms: string[];
  duration: string;
  vitalsNeeded: string[];
  followUpQuestion: string;
  activeAGUIQuestion: string | null;
  a2uiSurface: A2UISurfacePayload | null;
}

export type TriageSessionAction =
  | { type: "reset" }
  | { type: "setUrgency"; urgency: 1 | 2 | 3 | 4 | 5 }
  | { type: "setBodyZone"; bodyZone: BodyZone }
  | { type: "setTimeline"; duration: string; symptoms?: string[] }
  | { type: "setVitalsChecklist"; vitalsNeeded: string[] }
  | { type: "setFollowUpQuestion"; question: string }
  | { type: "setActiveAGUIQuestion"; question: string | null }
  | { type: "setA2UISurface"; surface: A2UISurfacePayload };

export function createInitialTriageSession(): TriageSessionState {
  return {
    urgencyLevel: null,
    bodyZone: null,
    symptoms: [],
    duration: "",
    vitalsNeeded: [],
    followUpQuestion: "",
    activeAGUIQuestion: null,
    a2uiSurface: null,
  };
}

export function triageSessionReducer(
  state: TriageSessionState,
  action: TriageSessionAction,
): TriageSessionState {
  switch (action.type) {
    case "reset":
      return createInitialTriageSession();
    case "setUrgency":
      return { ...state, urgencyLevel: action.urgency };
    case "setBodyZone":
      return { ...state, bodyZone: action.bodyZone };
    case "setTimeline":
      return {
        ...state,
        duration: action.duration,
        symptoms: action.symptoms ?? state.symptoms,
      };
    case "setVitalsChecklist":
      return { ...state, vitalsNeeded: action.vitalsNeeded };
    case "setFollowUpQuestion":
      return { ...state, followUpQuestion: action.question };
    case "setActiveAGUIQuestion":
      return { ...state, activeAGUIQuestion: action.question };
    case "setA2UISurface":
      return { ...state, a2uiSurface: action.surface };
    default:
      return state;
  }
}
