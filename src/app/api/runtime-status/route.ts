import { existsSync } from "node:fs";

import { NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

import { getActiveLLMProvider } from "@/lib/llm-provider";

export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown authentication error.";
}

export async function GET() {
  const provider = getActiveLLMProvider();
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const checks = {
    hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
    hasGoogleApiKey: Boolean(process.env.GOOGLE_API_KEY),
    hasProjectEnv: Boolean(process.env.GOOGLE_CLOUD_PROJECT),
    hasCredentialsFileEnv: Boolean(credentialsPath),
    credentialsFileExists: credentialsPath ? existsSync(credentialsPath) : false,
    adcReady: false,
    resolvedProjectId: null as string | null,
    authError: null as string | null,
  };

  if (provider.mode === "vertex") {
    try {
      const auth = new GoogleAuth();
      await auth.getClient();
      checks.adcReady = true;
      checks.resolvedProjectId = await auth.getProjectId();
    } catch (error) {
      checks.authError = getErrorMessage(error);
    }
  }

  return NextResponse.json(
    {
      provider,
      checks,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
