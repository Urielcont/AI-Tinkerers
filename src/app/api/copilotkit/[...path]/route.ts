import type { NextRequest } from "next/server";

import { handleCopilotRequest } from "@/app/api/copilotkit/endpoint";

export const GET = async (req: NextRequest) => handleCopilotRequest(req);
export const POST = async (req: NextRequest) => handleCopilotRequest(req);
export const PATCH = async (req: NextRequest) => handleCopilotRequest(req);
export const DELETE = async (req: NextRequest) => handleCopilotRequest(req);
export const OPTIONS = async (req: NextRequest) => handleCopilotRequest(req);
