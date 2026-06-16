import { runMacroBatchSimulation } from "@/lib/engine/macroSimulator";
import type { MacroWorkerInput, MacroWorkerOutput } from "@/types/macro";

self.onmessage = (event: MessageEvent<MacroWorkerInput>) => {
  try {
    if (event.data.type !== "RUN_MACRO_SIMULATION") {
      return;
    }

    const output: MacroWorkerOutput = {
      type: "MACRO_SIMULATION_COMPLETE",
      payload: runMacroBatchSimulation(event.data.payload),
    };
    self.postMessage(output);
  } catch (error) {
    const output: MacroWorkerOutput = {
      type: "MACRO_SIMULATION_ERROR",
      error: error instanceof Error ? error.message : "Macro simulation failed.",
    };
    self.postMessage(output);
  }
};

export {};
