import { CopilotRuntime } from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { createCopilotHonoHandler } from "@copilotkit/runtime/v2/hono";
import { createVertex } from "@ai-sdk/google-vertex";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { handle } from "hono/vercel";
import type { LanguageModel } from "ai";
import type { NextRequest } from "next/server";

import { getActiveLLMProvider } from "@/lib/llm-provider";

/**
 * Creates the LanguageModel instance using the existing env vars
 * (GOOGLE_CLOUD_LOCATION, GOOGLE_CLOUD_PROJECT, GEMINI_API_KEY, etc.)
 *
 * We build the model explicitly instead of using CopilotKit's string
 * shorthand ("vertex/model") because createVertex() without params
 * expects GOOGLE_VERTEX_LOCATION/GOOGLE_VERTEX_PROJECT, which differ
 * from our env var naming convention.
 */
function resolveLanguageModel(): LanguageModel {
  const config = getActiveLLMProvider();

  if (config.mode === "vertex") {
    const vertex = createVertex({
      location: config.location,
      project: process.env.GOOGLE_CLOUD_PROJECT,
    });
    return vertex(config.model);
  }

  const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  });
  return google(config.model);
}

const model = resolveLanguageModel();
const config = getActiveLLMProvider();

console.log(`[CopilotKit] Using model: ${config.mode}/${config.model}`);

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({ model }),
  },
});

const runtimeInstance = runtime.instance;
const mutableRuntimeInstance = runtimeInstance as unknown as {
  delegate?: {
    runner?: unknown;
  };
};

// CopilotKit's local thread fallback only recognizes the concrete
// InMemoryAgentRunner. The compatibility runtime wraps it in telemetry by
// default, so we unwrap it for this demo-oriented local setup.
if (
  mutableRuntimeInstance.delegate?.runner &&
  typeof mutableRuntimeInstance.delegate.runner === "object" &&
  "_runner" in mutableRuntimeInstance.delegate.runner
) {
  const telemetryRunner = mutableRuntimeInstance.delegate.runner as {
    _runner?: unknown;
  };

  if (telemetryRunner._runner) {
    mutableRuntimeInstance.delegate.runner = telemetryRunner._runner;
  }
}

const honoHandler = handle(
  createCopilotHonoHandler({
    runtime: runtimeInstance,
    basePath: "/api/copilotkit",
    mode: "multi-route",
  }),
);

export async function handleCopilotRequest(req: NextRequest) {
  const method = req.method;
  const url = req.nextUrl.pathname;

  console.log(`[CopilotKit] ${method} ${url}`);

  try {
    const response = await honoHandler(req);

    console.log(
      `[CopilotKit] ${method} ${url} -> ${response.status} ${response.statusText || ""}`,
    );

    return response;
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    console.error(`[CopilotKit] ${method} ${url} -> UNHANDLED ERROR:`, {
      message: err.message,
      name: err.name,
      stack: err.stack,
      cause: err.cause ? String(err.cause) : undefined,
    });

    return new Response(
      JSON.stringify({
        error: err.message,
        code: "COPILOTKIT_HANDLER_ERROR",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
