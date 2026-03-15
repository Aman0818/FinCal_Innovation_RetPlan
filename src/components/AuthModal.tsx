"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  LuX,
  LuMail,
  LuLock,
  LuUser,
  LuLoader,
  LuEye,
  LuEyeOff,
  LuShieldCheck,
} from "react-icons/lu";

type Mode = "login" | "signup";

export default function AuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Registration failed. Please try again.");
          setLoading(false);
          return;
        }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(
          mode === "login"
            ? "Invalid email or password. Please check your credentials."
            : "Account created. Please sign in to continue."
        );
        setLoading(false);
        return;
      }
      onSuccess();
    } catch {
      setError("A system error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[400px] rounded-xl overflow-hidden flex flex-col"
        style={{ background: "#ffffff", boxShadow: "0 24px 48px rgba(0,0,0,0.22)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
      >
        {/* ── Header ── */}
        <div
          className="relative flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded flex items-center justify-center shrink-0"
              style={{ background: "#224c87" }}
            >
              <LuShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <p id="auth-title" className="text-[14px] font-bold" style={{ color: "#111827" }}>
              {mode === "login" ? "Sign In" : "Register"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "#9ca3af" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
              (e.currentTarget as HTMLButtonElement).style.color = "#374151";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
            }}
            aria-label="Close"
          >
            <LuX className="w-4 h-4" />
          </button>
        </div>

        {/* ── Tab toggle ── */}
        <div
          className="flex"
          style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}
        >
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="flex-1 py-3 text-[13px] font-semibold transition-colors relative"
              style={{
                color:      mode === m ? "#224c87" : "#9ca3af",
                background: mode === m ? "#ffffff"  : "transparent",
                borderBottom: mode === m ? "2px solid #224c87" : "2px solid transparent",
              }}
            >
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            className="mx-6 mt-5 px-4 py-3 rounded-lg text-[12px] font-medium flex items-start gap-2"
            style={{
              background: "#fdf2f1",
              border: "1px solid rgba(218,56,50,0.2)",
              borderLeft: "3px solid #da3832",
              color: "#da3832",
            }}
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-5"
        >
          {/* Full name — signup only */}
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: "#374151" }}>
                Full Name
              </label>
              <div className="relative">
                <LuUser
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#9ca3af" }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full pl-10 pr-4 py-3 text-[14px] rounded-lg outline-none transition-all"
                  style={{
                    border: "1px solid #d1d5db",
                    background: "#ffffff",
                    color: "#111827",
                    fontFamily: "var(--font-sans)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#224c87";
                    e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(34,76,135,0.09)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#d1d5db";
                    e.currentTarget.style.boxShadow  = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: "#374151" }}>
              Email Address
            </label>
            <div className="relative">
              <LuMail
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#9ca3af" }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 text-[14px] rounded-lg outline-none transition-all"
                style={{
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#111827",
                  fontFamily: "var(--font-sans)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#224c87";
                  e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(34,76,135,0.09)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.boxShadow  = "none";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: "#374151" }}>
              Password
            </label>
            <div className="relative">
              <LuLock
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#9ca3af" }}
              />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "Minimum 6 characters" : "Enter your password"}
                required
                minLength={mode === "signup" ? 6 : 1}
                className="w-full pl-10 pr-11 py-3 text-[14px] rounded-lg outline-none transition-all"
                style={{
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  color: "#111827",
                  fontFamily: "var(--font-sans)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#224c87";
                  e.currentTarget.style.boxShadow  = "0 0 0 3px rgba(34,76,135,0.09)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.boxShadow  = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#9ca3af" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = "#374151"}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all mt-1"
            style={{
              background: loading ? "#5b7fad" : "#224c87",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading)
                (e.currentTarget as HTMLButtonElement).style.background = "#1a3a68";
            }}
            onMouseLeave={(e) => {
              if (!loading)
                (e.currentTarget as HTMLButtonElement).style.background = "#224c87";
            }}
          >
            {loading ? (
              <LuLoader className="w-4 h-4 animate-spin" />
            ) : mode === "login" ? (
              "Sign In to Your Account"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* ── Footer toggle ── */}
        <div
          className="px-6 py-4 text-center"
          style={{ borderTop: "1px solid #f3f4f6", background: "#f9fafb" }}
        >
          <p className="text-[12px]" style={{ color: "#6b7280" }}>
            {mode === "login" ? (
              <>
                New to HDFC Retirement Planner?{" "}
                <button
                  onClick={() => switchMode("signup")}
                  className="font-bold transition-colors"
                  style={{ color: "#224c87" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.textDecoration = "none"}
                >
                  Create a free account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("login")}
                  className="font-bold transition-colors"
                  style={{ color: "#224c87" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.textDecoration = "underline"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.textDecoration = "none"}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
