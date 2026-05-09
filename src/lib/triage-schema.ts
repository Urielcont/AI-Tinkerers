import { z } from "zod";

export const bodyZoneSchema = z.enum([
  "head",
  "chest",
  "abdomen",
  "back",
  "arm",
  "leg",
]);

export const surfaceTypeSchema = z.enum([
  "urgency_card",
  "body_focus_panel",
  "medical_summary_surface",
]);

export const a2uiSurfacePayloadSchema = z.object({
  version: z.literal("0.1"),
  surfaceType: surfaceTypeSchema,
  title: z.string().min(1),
  severity: z.number().int().min(1).max(5),
  bodyZone: bodyZoneSchema.optional(),
  symptoms: z.array(z.string().min(1)).default([]),
  duration: z.string().optional(),
  vitalsNeeded: z.array(z.string().min(1)).default([]),
  followUpQuestion: z.string().min(1),
});

export type BodyZone = z.infer<typeof bodyZoneSchema>;
export type SurfaceType = z.infer<typeof surfaceTypeSchema>;
export type A2UISurfacePayload = z.infer<typeof a2uiSurfacePayloadSchema>;

export function parseA2UISurfacePayload(
  payload: unknown,
): A2UISurfacePayload {
  return a2uiSurfacePayloadSchema.parse(payload);
}
