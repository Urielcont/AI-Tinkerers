import { describe, expect, test } from "vitest";

import {
  createInitialTriageSession,
  triageSessionReducer,
} from "@/lib/triage-session";

describe("triageSessionReducer", () => {
  test("updates urgency and follow-up question idempotently", () => {
    const initial = createInitialTriageSession();

    const withUrgency = triageSessionReducer(initial, {
      type: "setUrgency",
      urgency: 4,
    });

    const withQuestion = triageSessionReducer(withUrgency, {
      type: "setFollowUpQuestion",
      question: "¿El dolor corre hacia el brazo?",
    });

    expect(withQuestion.urgencyLevel).toBe(4);
    expect(withQuestion.followUpQuestion).toBe(
      "¿El dolor corre hacia el brazo?",
    );

    const repeated = triageSessionReducer(withQuestion, {
      type: "setUrgency",
      urgency: 4,
    });

    expect(repeated).toEqual(withQuestion);
  });

  test("resets the session to its initial shape", () => {
    const dirty = triageSessionReducer(createInitialTriageSession(), {
      type: "setBodyZone",
      bodyZone: "head",
    });

    const reset = triageSessionReducer(dirty, { type: "reset" });

    expect(reset).toEqual(createInitialTriageSession());
  });
});
