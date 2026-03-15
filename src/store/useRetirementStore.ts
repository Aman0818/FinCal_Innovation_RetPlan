import { create } from "zustand";
import {
  type RetirementInputs,
  type RetirementResult,
  calculateRetirement,
} from "@/lib/calculations";

export interface Scenario {
  id: string;
  label: string;
  inputs: RetirementInputs;
  result: RetirementResult;
}

export interface SavedPlan {
  id: string;
  name: string;
  inputs: RetirementInputs;
  result: RetirementResult;
  createdAt: string;
  updatedAt: string;
}

interface RetirementStore {
  // ── Current Step (conversational flow) ──
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // ── Inputs ──
  inputs: RetirementInputs;
  setInput: <K extends keyof RetirementInputs>(
    key: K,
    value: RetirementInputs[K]
  ) => void;

  // ── Computed Result ──
  result: RetirementResult;
  recalculate: () => void;

  // ── Scenarios ──
  scenarios: Scenario[];
  saveScenario: (label: string) => void;
  removeScenario: (id: string) => void;

  // ── UI State ──
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  showBreakdown: boolean;
  toggleBreakdown: () => void;

  // ── Persisted Plans (MySQL via API) ──
  savedPlans: SavedPlan[];
  currentPlanId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
  savePlan: (name: string) => Promise<void>;
  updatePlan: (id: string, name?: string) => Promise<void>;
  loadPlan: (id: string) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
}

const defaultInputs: RetirementInputs = {
  currentAge: 25,
  retirementAge: 60,
  lifeExpectancy: 85,
  monthlyExpenses: 50000,
  existingSavings: 0,
  generalInflation: 0.06,
  healthcareInflation: 0.10,
  healthcarePct: 0.15,
  preRetirementReturn: 0.12,
  postRetirementReturn: 0.08,
  annualStepUp: 0.10,
  emergencyBufferPct: 0.10,
};

const defaultResult = calculateRetirement(defaultInputs);

export const useRetirementStore = create<RetirementStore>((set, get) => ({
  // ── Step ──
  currentStep: 0,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => {
    const { currentStep } = get();
    set({ currentStep: currentStep + 1 });
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) set({ currentStep: currentStep - 1 });
  },

  // ── Inputs ──
  inputs: defaultInputs,
  setInput: (key, value) => {
    const newInputs = { ...get().inputs, [key]: value };
    const result = calculateRetirement(newInputs);
    set({ inputs: newInputs, result });
  },

  // ── Result ──
  result: defaultResult,
  recalculate: () => {
    const result = calculateRetirement(get().inputs);
    set({ result });
  },

  // ── Scenarios ──
  scenarios: [],
  saveScenario: (label) => {
    const { inputs, result, scenarios } = get();
    const id = `scenario-${Date.now()}`;
    set({
      scenarios: [
        ...scenarios,
        { id, label, inputs: { ...inputs }, result: { ...result } },
      ],
    });
  },
  removeScenario: (id) => {
    set({ scenarios: get().scenarios.filter((s) => s.id !== id) });
  },

  // ── UI ──
  showResults: false,
  setShowResults: (show) => set({ showResults: show }),
  showBreakdown: false,
  toggleBreakdown: () => set({ showBreakdown: !get().showBreakdown }),

  // ── Persisted Plans ──
  savedPlans: [],
  currentPlanId: null,
  isLoading: false,
  error: null,

  fetchPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      set({ savedPlans: data.plans, isLoading: false });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  savePlan: async (name) => {
    const { inputs } = get();
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, inputs }),
      });
      if (!res.ok) throw new Error("Failed to save plan");
      const data = await res.json();
      set((s) => ({
        savedPlans: [data.plan, ...s.savedPlans],
        currentPlanId: data.plan.id,
        isLoading: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  updatePlan: async (id, name) => {
    const { inputs } = get();
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, inputs }),
      });
      if (!res.ok) throw new Error("Failed to update plan");
      const data = await res.json();
      set((s) => ({
        savedPlans: s.savedPlans.map((p) => (p.id === id ? data.plan : p)),
        isLoading: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  loadPlan: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/plans/${id}`);
      if (!res.ok) throw new Error("Failed to load plan");
      const data = await res.json();
      const inputs = data.plan.inputs as RetirementInputs;
      const result = calculateRetirement(inputs);
      set({
        inputs,
        result,
        currentPlanId: id,
        currentStep: 5,
        showResults: false,
        isLoading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },

  deletePlan: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete plan");
      set((s) => ({
        savedPlans: s.savedPlans.filter((p) => p.id !== id),
        currentPlanId: s.currentPlanId === id ? null : s.currentPlanId,
        isLoading: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message, isLoading: false });
    }
  },
}));
