import { describe, expect, test } from "vitest";

import {
  a2uiSurfacePayloadSchema,
  parseA2UISurfacePayload,
} from "@/lib/triage-schema";

describe("a2uiSurfacePayloadSchema", () => {
  test("accepts a valid medical summary payload", () => {
    const result = parseA2UISurfacePayload({
      version: "0.1",
      surfaceType: "medical_summary_surface",
      title: "Resumen de triage",
      severity: 4,
      bodyZone: "chest",
      symptoms: ["dolor de pecho", "falta de aire"],
      duration: "desde esta mañana",
      vitalsNeeded: ["Presion arterial", "Saturacion O2"],
      followUpQuestion: "¿El dolor se irradia al brazo izquierdo?",
    });

    expect(result.surfaceType).toBe("medical_summary_surface");
    expect(result.symptoms).toHaveLength(2);
  });

  test("rejects an out-of-range severity", () => {
    expect(() =>
      a2uiSurfacePayloadSchema.parse({
        version: "0.1",
        surfaceType: "urgency_card",
        title: "Urgencia",
        severity: 6,
        symptoms: ["dolor"],
        vitalsNeeded: [],
        followUpQuestion: "¿Desde cuándo?",
      }),
    ).toThrow();
  });
});
