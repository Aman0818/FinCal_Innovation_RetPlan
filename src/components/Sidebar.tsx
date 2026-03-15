"use client";

import { useSession, signOut } from "next-auth/react";
import { useRetirementStore } from "@/store/useRetirementStore";
import { formatCurrency } from "@/lib/format";
import {
  LuCalculator,
  LuFolder,
  LuUser,
  LuLogOut,
  LuChevronLeft,
  LuChevronRight,
  LuTarget,
  LuTrendingUp,
} from "react-icons/lu";
import { useState } from "react";

export type SidebarView = "calculator" | "plans" | "profile";

const NAV_ITEMS: {
  id: SidebarView;
  icon: typeof LuCalculator;
  label: string;
  desc: string;
}[] = [
  { id: "calculator", icon: LuCalculator, label: "Calculator",  desc: "Plan your retirement" },
  { id: "plans",      icon: LuFolder,     label: "My Plans",    desc: "Saved projections" },
  { id: "profile",    icon: LuUser,       label: "Profile",     desc: "Account settings" },
];

export default function Sidebar({
  activeView,
  onViewChange,
  collapsed,
  onToggle,
}: {
  activeView: SidebarView;
  onViewChange: (v: SidebarView) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { data: session } = useSession();
  const { result } = useRetirementStore();
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const user = session?.user;

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setLogoutConfirm(false);
    onViewChange("calculator");
    window.location.reload();
  };

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen sticky top-0 z-40 transition-[width] duration-200 ease-out ${
        collapsed ? "w-[64px]" : "w-[248px]"
      }`}
      style={{ background: "#ffffff", borderRight: "1px solid #e5e7eb" }}
    >
      {/* ── Brand header ── */}
      <div
        className={`shrink-0 flex items-center h-[60px] ${
          collapsed ? "justify-center px-0" : "px-5 gap-3"
        }`}
        style={{ background: "#224c87", borderBottom: "1px solid #1a3a68" }}
      >
        {/* HDFC monogram */}
        <div
          className="w-8 h-8 rounded flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          <span className="text-white font-black text-[13px] tracking-tight">H</span>
        </div>

        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-[12.5px] font-bold tracking-tight leading-none text-white">
              HDFC Mutual Fund
            </p>
            <p className="text-[10px] leading-none mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
              Retirement Planner
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3">
        {!collapsed && (
          <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] px-5 py-2"
             style={{ color: "#9ca3af" }}>
            Menu
          </p>
        )}

        <div className={`space-y-0.5 ${collapsed ? "px-2" : "px-3"}`}>
          {NAV_ITEMS.map((item) => {
            const active   = activeView === item.id;
            const Icon     = item.icon;
            const needsAuth = item.id === "plans" || item.id === "profile";
            const disabled  = needsAuth && !user;

            return (
              <button
                key={item.id}
                onClick={() => !disabled && onViewChange(item.id)}
                disabled={disabled}
                title={collapsed ? item.label : disabled ? "Sign in to access" : undefined}
                aria-current={active ? "page" : undefined}
                className={`
                  w-full flex items-center gap-3 rounded-lg
                  transition-all duration-150 text-left
                  ${collapsed ? "justify-center py-3 px-0" : "px-3 py-2.5"}
                  ${disabled ? "cursor-not-allowed opacity-35" : "cursor-pointer"}
                `}
                style={{
                  background:  active ? "#eef3fb" : "transparent",
                  color:       active ? "#224c87" : "#4b5563",
                  fontWeight:  active ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active && !disabled)
                    (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  if (!active && !disabled)
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                {/* Icon container */}
                <span
                  className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: active ? "#224c87" : "#f3f4f6",
                    color:      active ? "#ffffff"  : "#6b7280",
                  }}
                >
                  <Icon className="w-4 h-4" />
                </span>

                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] truncate leading-tight">{item.label}</p>
                    <p className="text-[10px] truncate leading-tight mt-0.5"
                       style={{ color: active ? "#4d7cc7" : "#9ca3af" }}>
                      {item.desc}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Live estimates panel ── */}
        {!collapsed && (
          <div className="mx-3 mt-5">
            {/* Panel header */}
            <div
              className="rounded-t-lg px-3 py-2 flex items-center gap-2"
              style={{ background: "#224c87" }}
            >
              <LuTrendingUp className="w-3.5 h-3.5 text-white opacity-70" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white opacity-70">
                Live Estimate
              </p>
            </div>

            {/* Metrics */}
            <div
              className="rounded-b-lg overflow-hidden"
              style={{ border: "1px solid #e5e7eb", borderTop: "none" }}
            >
              {/* Target corpus */}
              <div
                className="px-3 py-3"
                style={{ borderBottom: "1px solid #f3f4f6" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <LuTarget className="w-3 h-3" style={{ color: "#9ca3af" }} />
                    <p className="text-[9.5px] font-semibold uppercase tracking-wider"
                       style={{ color: "#9ca3af" }}>
                      Target Corpus
                    </p>
                  </div>
                </div>
                <p className="text-[15px] font-bold tabular-nums tracking-tight"
                   style={{ color: "#224c87" }}>
                  {formatCurrency(result.corpusWithBuffer)}
                </p>
              </div>

              {/* Monthly SIP */}
              <div className="px-3 py-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <LuTrendingUp className="w-3 h-3" style={{ color: "#9ca3af" }} />
                  <p className="text-[9.5px] font-semibold uppercase tracking-wider"
                     style={{ color: "#9ca3af" }}>
                    Monthly SIP
                  </p>
                </div>
                <p className="text-[15px] font-bold tabular-nums tracking-tight"
                   style={{ color: "#0f7a38" }}>
                  {formatCurrency(result.requiredMonthlySIP)}
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── User / sign-in section ── */}
      <div
        className="shrink-0"
        style={{ borderTop: "1px solid #e5e7eb" }}
      >
        {user ? (
          <div className={`py-3 ${collapsed ? "px-2" : "px-3"}`}>
            {!collapsed ? (
              <div
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg"
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                  style={{ background: "#224c87" }}
                >
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold truncate leading-tight"
                     style={{ color: "#111827" }}>
                    {user.name}
                  </p>
                  <p className="text-[10px] truncate leading-tight mt-0.5"
                     style={{ color: "#6b7280" }}>
                    {user.email}
                  </p>
                </div>

                {/* Logout */}
                {logoutConfirm ? (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={handleLogout}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                      style={{ background: "#da3832" }}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setLogoutConfirm(false)}
                      className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                      style={{ border: "1px solid #d1d5db", color: "#6b7280", background: "white" }}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setLogoutConfirm(true)}
                    className="p-1.5 rounded-md transition-colors shrink-0"
                    title="Sign out"
                    style={{ color: "#9ca3af" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "#da3832";
                      (e.currentTarget as HTMLButtonElement).style.background = "#fdf2f1";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    <LuLogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              /* Collapsed — icon only */
              <button
                onClick={() => logoutConfirm ? handleLogout() : setLogoutConfirm(true)}
                className="w-full flex justify-center py-2 rounded-lg transition-colors"
                title="Sign out"
                style={{ color: "#9ca3af" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#da3832";
                  (e.currentTarget as HTMLButtonElement).style.background = "#fdf2f1";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <LuLogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          !collapsed && (
            <div className="px-4 py-4">
              <div
                className="rounded-lg px-3 py-2.5"
                style={{ background: "#eef3fb", border: "1px solid rgba(34,76,135,0.15)" }}
              >
                <p className="text-[11px] leading-relaxed font-medium" style={{ color: "#224c87" }}>
                  Sign in to save and manage your retirement plans.
                </p>
              </div>
            </div>
          )
        )}

        {/* ── Collapse toggle ── */}
        <div
          className="flex items-center justify-end px-3 py-2"
          style={{ borderTop: "1px solid #e5e7eb" }}
        >
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors"
            style={{ color: "#9ca3af" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
              (e.currentTarget as HTMLButtonElement).style.color = "#374151";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <LuChevronRight className="w-4 h-4" />
            ) : (
              <>
                <LuChevronLeft className="w-3.5 h-3.5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
