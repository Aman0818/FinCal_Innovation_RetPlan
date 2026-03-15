"use client";

import { useEffect, useState } from "react";
import { useRetirementStore } from "@/store/useRetirementStore";
import { formatCurrency } from "@/lib/format";
import {
  LuFolder,
  LuFolderOpen,
  LuTrash2,
  LuLoader,
  LuPlus,
  LuClock,
  LuSave,
  LuX,
  LuCircleAlert,
} from "react-icons/lu";

export default function SavedPlans({ onClose }: { onClose: () => void }) {
  const {
    savedPlans,
    currentPlanId,
    isLoading,
    error,
    fetchPlans,
    savePlan,
    loadPlan,
    deletePlan,
    showResults,
    inputs,
    result,
  } = useRetirementStore();

  const [showSaveForm, setShowSaveForm] = useState(false);
  const [planName, setPlanName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSave = async () => {
    if (!planName.trim()) return;
    await savePlan(planName.trim());
    setPlanName("");
    setShowSaveForm(false);
  };

  const handleDelete = async (id: string) => {
    await deletePlan(id);
    setDeleteConfirm(null);
  };

  const handleLoad = async (id: string) => {
    await loadPlan(id);
    onClose();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="w-full space-y-8" aria-label="Saved retirement plans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-hdfc-blue flex items-center justify-center">
            <LuFolder className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-[-0.01em]">Saved Plans</h2>
            <p className="text-[12px] text-muted-foreground">
              {savedPlans.length} plan{savedPlans.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="btn-ghost !text-[13px] !shadow-none"
        >
          Back to Calculator
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-hdfc-red-light flex items-center gap-2 text-[13px] text-hdfc-red font-medium">
          <LuCircleAlert className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Save current plan */}
      <div>
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              disabled={!showResults}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[15px] font-semibold transition-all ${
                showResults
                  ? "btn-primary !w-full"
                  : "bg-muted/50 text-muted-foreground border border-border/60 cursor-not-allowed rounded-xl"
              }`}
            >
              <LuPlus className="w-5 h-5" />
              {showResults ? "Save Current Plan" : "Complete your plan first to save"}
            </button>
          ) : (
            <div className="surface p-5 space-y-3">
              <p className="text-[14px] font-semibold text-foreground">
                Name your plan
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="e.g. Retire at 55 – Aggressive"
                  className="flex-1 px-4 py-3 text-[14px] rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground/40 focus:border-hdfc-blue focus:ring-2 focus:ring-hdfc-blue/20 focus:outline-none transition-all shadow-sm"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={!planName.trim() || isLoading}
                  className="btn-primary !px-5 !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <LuLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    <LuSave className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowSaveForm(false);
                    setPlanName("");
                  }}
                  className="btn-ghost !px-3 !py-3"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>
              {/* Preview of what will be saved */}
              <p className="text-[12px] text-muted-foreground">
                Age {inputs.currentAge} → {inputs.retirementAge} | SIP{" "}
                {formatCurrency(result.requiredMonthlySIP)} | Corpus{" "}
                {formatCurrency(result.corpusWithBuffer)}
              </p>
            </div>
          )}
        </div>

      {/* Plans list */}
      <div className="space-y-3">
          {isLoading && savedPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <LuLoader className="w-8 h-8 animate-spin mb-3" />
              <p className="text-[15px] font-medium">Loading plans...</p>
            </div>
          ) : savedPlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <LuFolderOpen className="w-12 h-12 mb-3 text-border" />
              <p className="text-[16px] font-semibold text-foreground">
                No saved plans yet
              </p>
              <p className="text-[14px] mt-1">
                Complete your retirement plan and save it here.
              </p>
            </div>
          ) : (
            savedPlans.map((plan) => {
              const isActive = plan.id === currentPlanId;
              const isDeleting = deleteConfirm === plan.id;
              const planInputs = plan.inputs;
              const planResult = plan.result;

              return (
                <div
                  key={plan.id}
                  className={`surface-interactive !cursor-default relative ${
                    isActive ? "!border-hdfc-blue !bg-hdfc-blue-light" : ""
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-semibold text-foreground truncate">
                            {plan.name}
                          </h3>
                          {isActive && (
                            <span className="badge badge-blue !py-0.5 !px-2 !text-[11px]">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[13px] text-muted-foreground">
                            Age {planInputs.currentAge}→{planInputs.retirementAge}
                          </span>
                          <span className="text-[13px] font-semibold text-hdfc-blue">
                            SIP {formatCurrency(planResult.requiredMonthlySIP)}
                          </span>
                          <span className="text-[13px] font-semibold text-foreground">
                            Corpus {formatCurrency(planResult.corpusWithBuffer)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2 text-[12px] text-muted-foreground">
                          <LuClock className="w-3.5 h-3.5" />
                          {formatDate(plan.updatedAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {isDeleting ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(plan.id)}
                              className="px-3 py-1.5 rounded-lg bg-hdfc-red text-white text-[13px] font-semibold hover:bg-hdfc-red/90 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1.5 rounded-lg border border-border text-[13px] font-medium hover:bg-muted transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleLoad(plan.id)}
                              disabled={isLoading}
                              className="btn-ghost !px-3.5 !py-2 !text-[13px] text-hdfc-blue !border-hdfc-blue/30 hover:!bg-hdfc-blue-light"
                            >
                              <LuFolderOpen className="w-4 h-4" />
                              Load
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(plan.id)}
                              disabled={isLoading}
                              className="btn-ghost !px-2.5 !py-2 text-hdfc-red !border-hdfc-red/20 hover:!bg-hdfc-red-light"
                              aria-label={`Delete plan: ${plan.name}`}
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
      </div>

      {/* Footer hint */}
      <div className="mt-6 pt-4 border-t border-border/30 text-center">
        <p className="text-[11px] text-muted-foreground/60">
          Plans are saved to your MySQL database via secure API
        </p>
      </div>
    </section>
  );
}
