"use client";

import { useState } from "react";
import { GO_LABELS } from "@/types";

interface Props {
  placeId: string;
  currentRating?: number | null; // user's own rating if any
  communityRating?: number | null;
  communityCount?: number;
  onRate?: (rating: number) => void;
}

export default function GoGidgetRating({ placeId, currentRating, communityRating, communityCount, onRate }: Props) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(currentRating ?? 0);
  const [submitting, setSubmitting] = useState(false);

  const display = hovered || selected;

  const handleRate = async (rating: number) => {
    if (submitting) return;
    setSelected(rating);
    setSubmitting(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, rating }),
      });
      onRate?.(rating);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Interactive stars */}
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleRate(n)}
            className="transition-transform hover:scale-110 focus:outline-none"
            title={GO_LABELS[n]}
            aria-label={`Rate ${GO_LABELS[n]}`}
          >
            <span
              className="text-xl select-none"
              style={{ filter: n <= display ? "none" : "grayscale(100%) opacity(0.3)" }}
            >
              🐾
            </span>
          </button>
        ))}
      </div>

      {/* Label */}
      <div className="mt-1 flex items-center gap-2">
        {display > 0 && (
          <span className="text-xs font-semibold" style={{ color: "var(--gg-yellow-dark)" }}>
            {GO_LABELS[display]}
          </span>
        )}
        {communityRating && communityCount ? (
          <span className="text-xs" style={{ color: "var(--gg-muted)" }}>
            · {communityRating.toFixed(1)} avg ({communityCount})
          </span>
        ) : null}
      </div>
    </div>
  );
}
