"use client";

import { FREE_CLICK_LIMIT } from "@/types";

interface Props {
  onClose: () => void;
}

export default function UpgradeModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4">
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 z-10"
        style={{ background: "white", border: "1.5px solid var(--gg-border)" }}
      >
        <div className="text-center">
          <div className="text-5xl mb-3">🐾</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--gg-text)", fontFamily: "Georgia, serif" }}>
            You&apos;ve used all {FREE_CLICK_LIMIT} free searches!
          </h2>
          <p className="text-sm mb-5" style={{ color: "var(--gg-muted)" }}>
            Upgrade to Go Gidget Pro for unlimited searches, priority results, and more.
          </p>

          <div
            className="rounded-xl p-4 mb-5 text-left"
            style={{ background: "var(--gg-yellow-light)", border: "1.5px solid var(--gg-border)" }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--gg-text)" }}>Pro includes:</p>
            <ul className="space-y-1">
              {[
                "Unlimited searches",
                "Save unlimited favorites",
                "Early access to new features",
                "Support a pet lover 🐶",
              ].map((item) => (
                <li key={item} className="text-sm flex gap-2" style={{ color: "var(--gg-text)" }}>
                  <span style={{ color: "var(--gg-yellow-dark)" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            className="w-full py-3 rounded-xl font-semibold text-sm mb-3"
            style={{ background: "var(--gg-yellow)", color: "var(--gg-text)" }}
            onClick={() => alert("Stripe integration coming soon!")}
          >
            Upgrade for $4.99/mo 🐾
          </button>
          <button onClick={onClose} className="text-sm" style={{ color: "var(--gg-muted)" }}>
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
