"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LuUser, LuMail, LuCalendar, LuFolder, LuLoader, LuPencil, LuCheck, LuX } from "react-icons/lu";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
  _count: { plans: number };
}

export default function ProfileView() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.user);
        setNewName(d.user?.name || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setProfile((p) => (p ? { ...p, name: data.user.name } : p));
      setEditing(false);
      // update NextAuth session
      await update({ name: data.user.name });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LuLoader className="w-8 h-8 animate-spin text-hdfc-blue" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-32 text-muted-foreground">
        <p className="text-lg font-semibold">Not signed in</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground tracking-[-0.01em]">Profile</h2>
        <p className="text-[14px] text-muted-foreground mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Avatar + Name */}
      <div className="surface p-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-hdfc-blue-light flex items-center justify-center shadow-sm">
            <span className="text-xl font-semibold text-hdfc-blue">
              {profile.name[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="flex-1 px-4 py-2.5 text-[15px] font-semibold rounded-xl border border-border bg-white focus:border-hdfc-blue focus:ring-2 focus:ring-hdfc-blue/10 focus:outline-none transition-all shadow-sm"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="p-2.5 rounded-xl bg-gradient-to-br from-hdfc-blue to-hdfc-blue-dark text-white hover:opacity-90 transition-opacity shadow-sm"
                >
                  {saving ? <LuLoader className="w-5 h-5 animate-spin" /> : <LuCheck className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => { setEditing(false); setNewName(profile.name); }}
                  className="p-2.5 rounded-xl border border-border/60 hover:bg-muted/50 transition-colors"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-hdfc-blue hover:bg-hdfc-blue-light transition-colors"
                >
                  <LuPencil className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-[15px] text-muted-foreground mt-1">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <LuMail className="w-4 h-4 text-muted-foreground" />
            <p className="label-xs">Email</p>
          </div>
          <p className="text-[15px] font-semibold text-foreground truncate">{profile.email}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <LuFolder className="w-4 h-4 text-muted-foreground" />
            <p className="label-xs">Saved Plans</p>
          </div>
          <p className="text-xl font-semibold text-hdfc-blue">{profile._count.plans}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-2">
            <LuCalendar className="w-4 h-4 text-muted-foreground" />
            <p className="label-xs">Member Since</p>
          </div>
          <p className="text-[15px] font-semibold text-foreground">
            {new Date(profile.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Security note */}
      <div className="surface p-5">
        <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
          Your data is stored securely in an encrypted cloud database. All calculations and
          plan modifications are logged for compliance and audit purposes.
        </p>
      </div>
    </div>
  );
}
