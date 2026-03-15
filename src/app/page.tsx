"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRetirementStore } from "@/store/useRetirementStore";
import Sidebar, { type SidebarView } from "@/components/Sidebar";
import StepInputFlow from "@/components/StepInputFlow";
import AssumptionsPanel from "@/components/AssumptionsPanel";
import ResultsSection from "@/components/ResultsSection";
import ScenarioComparison from "@/components/ScenarioComparison";
import SavedPlans from "@/components/SavedPlans";
import AuthModal from "@/components/AuthModal";
import ProfileView from "@/components/ProfileView";
import Footer from "@/components/Footer";

const TOTAL_INPUT_STEPS = 5;

export default function Home() {
  const { data: session } = useSession();
  const { currentStep, showResults } = useRetirementStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<SidebarView>("calculator");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authCallback, setAuthCallback] = useState<(() => void) | null>(null);

  const isInPersonalSteps = currentStep < TOTAL_INPUT_STEPS;
  const isInAssumptions = currentStep >= TOTAL_INPUT_STEPS && !showResults;
  const isLoggedIn = !!session?.user;

  // Auth gate — called from AssumptionsPanel "See My Plan"
  const handleAuthGate = useCallback(
    (onSuccess: () => void) => {
      if (isLoggedIn) {
        onSuccess();
      } else {
        setAuthCallback(() => onSuccess);
        setShowAuthModal(true);
      }
    },
    [isLoggedIn]
  );

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (authCallback) {
      authCallback();
      setAuthCallback(null);
    }
  };

  const handleViewChange = (view: SidebarView) => {
    setActiveView(view);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header (hidden on lg+) */}
        <header
          className="lg:hidden w-full sticky top-0 z-50"
          style={{
            background: "var(--color-card)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between px-4 h-[52px]">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                style={{ background: "var(--color-hdfc-blue)" }}
              >
                <span className="text-white font-black text-[11px] tracking-tighter">H</span>
              </div>
              <div>
                <p
                  className="text-[11.5px] font-bold tracking-tight leading-none"
                  style={{ color: "var(--color-foreground)" }}
                >
                  HDFC Mutual Fund
                </p>
                <p
                  className="text-[9.5px] leading-none mt-0.5"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  Retirement Planner
                </p>
              </div>
            </div>

            {/* Auth */}
            {isLoggedIn ? (
              <div
                className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold"
                style={{ background: "var(--color-hdfc-blue)", color: "white" }}
              >
                {session.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-[12px] font-semibold px-3 py-1.5 rounded transition-colors"
                style={{
                  color: "var(--color-hdfc-blue)",
                  border: "1px solid var(--color-hdfc-blue)",
                  background: "var(--color-hdfc-blue-light)",
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        <main
          id="main-content"
          className="flex-1 w-full max-w-4xl mx-auto px-5 sm:px-8 py-7 sm:py-10"
        >
          {activeView === "calculator" && (
            <>
              {isInPersonalSteps && <StepInputFlow />}
              {isInAssumptions && <AssumptionsPanel onAuthGate={handleAuthGate} />}
              {showResults && (
                <div className="space-y-12">
                  <ResultsSection onOpenPlans={() => handleViewChange("plans")} />
                  <ScenarioComparison />
                </div>
              )}
            </>
          )}

          {activeView === "plans" && (
            <SavedPlans onClose={() => handleViewChange("calculator")} />
          )}

          {activeView === "profile" && <ProfileView />}
        </main>

        <Footer />
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setAuthCallback(null);
          }}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
