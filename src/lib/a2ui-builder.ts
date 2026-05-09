import type { A2UISurfacePayload } from "@/lib/triage-schema";

const SURFACE_ID = "voxtriage-main";
const CATALOG_ID = "https://a2ui.org/specification/v0_9/basic_catalog.json";

type A2UIMessage =
  | {
      version: "v0.9";
      createSurface: { surfaceId: string; catalogId: string };
    }
  | {
      version: "v0.9";
      updateComponents: {
        surfaceId: string;
        components: Array<Record<string, unknown>>;
      };
    }
  | {
      version: "v0.9";
      updateDataModel: {
        surfaceId: string;
        path: "/";
        value: Record<string, unknown>;
      };
    };

export function buildA2UIMessages(payload: A2UISurfacePayload): A2UIMessage[] {
  return [
    {
      version: "v0.9",
      createSurface: {
        surfaceId: SURFACE_ID,
        catalogId: CATALOG_ID,
      },
    },
    {
      version: "v0.9",
      updateComponents: {
        surfaceId: SURFACE_ID,
        components: buildComponentTree(payload),
      },
    },
    {
      version: "v0.9",
      updateDataModel: {
        surfaceId: SURFACE_ID,
        path: "/",
        value: {
          title: payload.title,
          severity: payload.severity,
          bodyZone: payload.bodyZone ?? "unspecified",
          symptoms: payload.symptoms,
          duration: payload.duration ?? "No especificada",
          vitalsNeeded: payload.vitalsNeeded,
          followUpQuestion: payload.followUpQuestion,
          summaryLabel: getSummaryLabel(payload.surfaceType),
        },
      },
    },
  ];
}

function getSummaryLabel(surfaceType: A2UISurfacePayload["surfaceType"]) {
  switch (surfaceType) {
    case "urgency_card":
      return "Nivel de urgencia detectado";
    case "body_focus_panel":
      return "Zona corporal prioritaria";
    case "medical_summary_surface":
      return "Resumen pre-consulta";
  }
}

function buildComponentTree(payload: A2UISurfacePayload) {
  const baseChildren: Array<
    | { id: string; component: string; children: string[] }
    | { id: string; component: string; text: { path: string } }
    | { id: string; component: string }
  > = [
    {
      id: "root",
      component: "Column",
      children: [
        "summary-label",
        "title",
        "severity",
        "body-zone",
        "duration",
        "symptoms",
        "vitals",
        "follow-up",
      ],
    },
    {
      id: "summary-label",
      component: "Text",
      text: { path: "/summaryLabel" },
    },
    {
      id: "title",
      component: "Text",
      text: { path: "/title" },
    },
    {
      id: "severity",
      component: "Text",
      text: { path: "/severity" },
    },
    {
      id: "body-zone",
      component: "Text",
      text: { path: "/bodyZone" },
    },
    {
      id: "duration",
      component: "Text",
      text: { path: "/duration" },
    },
    {
      id: "symptoms",
      component: "Text",
      text: { path: "/symptoms/0" },
    },
    {
      id: "vitals",
      component: "Text",
      text: { path: "/vitalsNeeded/0" },
    },
    {
      id: "follow-up",
      component: "Text",
      text: { path: "/followUpQuestion" },
    },
  ];

  if (payload.surfaceType === "medical_summary_surface") {
    return [
      {
        id: "root",
        component: "Column",
        children: ["summary-label", "divider", "main-info"],
      },
      {
        id: "summary-label",
        component: "Text",
        text: { path: "/summaryLabel" },
        style: { fontSize: "12px", color: "#000000", fontWeight: "bold", letterSpacing: "1px" }
      },
      { id: "divider", component: "Divider" },
      {
        id: "main-info",
        component: "Column",
        children: ["title", "symptoms-label", "symptoms-list", "follow-up-section"],
      },
      {
        id: "title",
        component: "Text",
        text: { path: "/title" },
        style: { fontSize: "28px", fontWeight: "600", color: "#000000", letterSpacing: "-0.02em" }
      },
      {
        id: "symptoms-label",
        component: "Text",
        text: "ANÁLISIS CLÍNICO DETALLADO",
        style: { fontSize: "10px", color: "#000000", marginTop: "24px", letterSpacing: "0.15em", fontWeight: "bold" }
      },
      {
        id: "symptoms-list",
        component: "Text",
        text: { path: "/symptoms/0" },
        style: { fontSize: "15px", lineHeight: "1.7", color: "#000000", marginTop: "8px" }
      },
      {
        id: "follow-up-section",
        component: "Column",
        children: ["follow-up-label", "follow-up-q"],
        style: { marginTop: "32px", padding: "20px", backgroundColor: "rgba(192, 133, 82, 0.08)", borderRadius: "20px", border: "1px solid rgba(192, 133, 82, 0.15)" }
      },
      {
        id: "follow-up-label",
        component: "Text",
        text: "PREGUNTA DE SEGUIMIENTO RECOMENDADA",
        style: { fontSize: "10px", color: "#000000", fontWeight: "bold", letterSpacing: "0.1em" }
      },
      {
        id: "follow-up-q",
        component: "Text",
        text: { path: "/followUpQuestion" },
        style: { fontSize: "16px", color: "#000000", marginTop: "8px", fontWeight: "500" }
      }
    ];
  }

  return baseChildren;
}
