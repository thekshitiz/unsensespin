import { create } from "zustand";
import { runMacroBatchSimulation } from "@/lib/engine/macroSimulator";
import type { BatchSimulationConfig, BatchSimulationResult } from "@/types/macro";

interface MacroSimulationStore {
  isRunning: boolean;
  lastResult: BatchSimulationResult | null;
  error: string | null;
  runSimulation: (config: BatchSimulationConfig) => Promise<void>;
  clearResult: () => void;
}

export const useMacroSimulationStore = create<MacroSimulationStore>((set) => ({
  isRunning: false,
  lastResult: null,
  error: null,
  async runSimulation(config) {
    set({ isRunning: true, error: null });
    try {
      const result = runMacroBatchSimulation(config);
      set({ lastResult: result, isRunning: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Macro simulation failed.", isRunning: false });
    }
  },
  clearResult() {
    set({ lastResult: null, error: null });
  },
}));
