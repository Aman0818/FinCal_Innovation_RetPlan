"use client";

import { useEffect, useState } from "react";
import { LuHistory, LuLoader } from "react-icons/lu";

interface AuditEntry {
  id: string;
  action: string;
  planId: string | null;
  createdAt: string;
  ip: string | null;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  calculate: { label: "Calculated", color: "badge-blue" },
  save: { label: "Saved Plan", color: "badge-blue" },
  load: { label: "Loaded Plan", color: "badge-muted" },
  delete: { label: "Deleted Plan", color: "badge-red" },
  signup: { label: "Signed Up", color: "badge-blue" },
  login: { label: "Logged In", color: "badge-muted" },
  scenario_compare: { label: "Scenario", color: "badge-muted" },
};

export default function AuditView() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LuLoader className="w-8 h-8 animate-spin text-hdfc-blue" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground tracking-[-0.01em]">Activity Log</h2>
        <p className="text-[14px] text-muted-foreground mt-1">
          Compliance audit trail — every action is tracked
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <LuHistory className="w-10 h-10 mx-auto mb-3 text-border" />
          <p className="text-[16px] font-semibold text-foreground">No activity yet</p>
          <p className="text-[13px] mt-1">Actions will appear here as you use the calculator.</p>
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[15px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border/50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Plan ID
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const meta = ACTION_LABELS[log.action] || {
                    label: log.action,
                    color: "badge-muted",
                  };
                  return (
                    <tr key={log.id} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-2.5">
                        <span className={`badge ${meta.color}`}>{meta.label}</span>
                      </td>
                      <td className="px-5 py-2.5 text-muted-foreground tabular-nums text-[13px]">
                        {new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-2.5 font-mono text-[12px] text-muted-foreground">
                        {log.planId ? log.planId.slice(0, 8) + "..." : "—"}
                      </td>
                      <td className="px-5 py-2.5 text-[12px] text-muted-foreground">
                        {log.ip || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
