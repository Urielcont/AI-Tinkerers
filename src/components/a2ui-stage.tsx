"use client";

import { useMemo } from "react";
import { A2uiSurface, basicCatalog } from "@a2ui/react/v0_9";
import { MessageProcessor } from "@a2ui/web_core/v0_9";

import { buildA2UIMessages } from "@/lib/a2ui-builder";
import type { A2UISurfacePayload } from "@/lib/triage-schema";

interface A2UIStageProps {
  payload: A2UISurfacePayload;
}

export function A2UIStage({ payload }: A2UIStageProps) {
  const surfaces = useMemo(() => {
    const processor = new MessageProcessor([basicCatalog]);
    processor.processMessages(buildA2UIMessages(payload));
    return Array.from(processor.model.surfacesMap.values());
  }, [payload]);

  return (
    <div className="grid gap-4">
      {surfaces.map((surface) => (
        <div
          key={surface.id}
          className="rounded-[2.5rem] border border-white/5 bg-transparent p-2"
        >
          <A2uiSurface surface={surface} />
        </div>
      ))}
    </div>
  );
}
