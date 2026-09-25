"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await refresh();
      router.push("/explore");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--gg-cream)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🐾</div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--gg-yellow-dark)", fontFamily: "Georgia, serif" }}>
            Go Gidget
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--gg-muted)" }}>pet-friendly places near you</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ background: "white", border: "1.5px solid var(--gg-border)" }}>
          <h2 className="text-lg font-semibold mb-5" style={{ color: "var(--gg-text)" }}>Welcome back</h2>

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-lg text-sm" style={{ background: "#FEE2E2", color: "#991B1B" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--gg-text)" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: "1.5px solid var(--gg-border)",
                  background: "var(--gg-cream)",
                  color: "var(--gg-text)",
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--gg-text)" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: "1.5px solid var(--gg-border)",
                  background: "var(--gg-cream)",
                  color: "var(--gg-text)",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all animate-pulse-glow"
              style={{
                background: loading ? "var(--gg-border)" : "var(--gg-yellow)",
                color: "var(--gg-text)",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Logging in..." : "Log in 🐾"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: "var(--gg-muted)" }}>
          New here?{" "}
          <Link href="/register" className="font-semibold" style={{ color: "var(--gg-yellow-dark)" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
