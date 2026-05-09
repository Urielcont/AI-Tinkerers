import { describe, expect, test } from "vitest";

import { buildA2UIMessages } from "@/lib/a2ui-builder";
import { parseA2UISurfacePayload } from "@/lib/triage-schema";

describe("buildA2UIMessages", () => {
  test("builds a v0.9 message stream for an urgency card", () => {
    const payload = parseA2UISurfacePayload({
      version: "0.1",
      surfaceType: "urgency_card",
      title: "Urgencia alta",
      severity: 4,
      bodyZone: "chest",
      symptoms: ["dolor de pecho"],
      duration: "desde esta mañana",
      vitalsNeeded: ["Pulso"],
      followUpQuestion: "¿Te falta el aire?",
    });

    const messages = buildA2UIMessages(payload);

    expect(messages).toHaveLength(3);
    expect(messages[0]).toMatchObject({
      version: "v0.9",
      createSurface: { surfaceId: "voxtriage-main" },
    });
    expect(messages[1]).toMatchObject({
      version: "v0.9",
      updateComponents: { surfaceId: "voxtriage-main" },
    });
    expect(messages[2]).toMatchObject({
      version: "v0.9",
      updateDataModel: {
        surfaceId: "voxtriage-main",
        path: "/",
      },
    });
  });
});
