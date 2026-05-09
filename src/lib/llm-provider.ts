const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_GEMINI_API_VERSION = "v1";
const DEFAULT_VERTEX_LOCATION = "us-central1";

type GeminiApiVersion = "v1" | "v1beta";
type GeminiMode = "developer" | "vertex";

function getGeminiApiVersion(): GeminiApiVersion {
  return process.env.GEMINI_API_VERSION === "v1beta" ? "v1beta" : DEFAULT_GEMINI_API_VERSION;
}

function getGeminiMode(): GeminiMode {
  if (process.env.GEMINI_PROVIDER === "developer") {
    return "developer";
  }

  if (process.env.GEMINI_PROVIDER === "vertex") {
    return "vertex";
  }

  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    return "developer";
  }

  return "vertex";
}

export interface LLMProviderConfig {
  provider: "gemini";
  mode: GeminiMode;
  model: string;
  apiVersion: GeminiApiVersion;
  location?: string;
}

export function getActiveLLMProvider(): LLMProviderConfig {
  const mode = getGeminiMode();

  return {
    provider: "gemini",
    mode,
    model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    apiVersion: getGeminiApiVersion(),
    location: mode === "vertex" ? process.env.GOOGLE_CLOUD_LOCATION || DEFAULT_VERTEX_LOCATION : undefined,
  };
}
