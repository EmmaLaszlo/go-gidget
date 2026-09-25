"use client";

import { PlaceFilters, PriceLevel } from "@/types";

const PRICES: PriceLevel[] = ["$", "$$", "$$$", "$$$$"];

const CUISINES = [
  "Italian", "Mexican", "Japanese", "Chinese", "American",
  "Thai", "Mediterranean", "Indian", "French", "Vegan",
];

interface Props {
  category: string;
  filters: PlaceFilters;
  onChange: (filters: PlaceFilters) => void;
}

export default function FilterBar({ category, filters, onChange }: Props) {
  const togglePrice = (p: PriceLevel) => {
    const current = filters.price ?? [];
    const next = current.includes(p) ? current.filter((x) => x !== p) : [...current, p];
    onChange({ ...filters, price: next.length ? next : undefined });
  };

  return (
    <div className="space-y-3">
      {/* Price */}
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "var(--gg-muted)" }}>PRICE</p>
        <div className="flex gap-2">
          {PRICES.map((p) => {
            const active = filters.price?.includes(p);
            return (
              <button
                key={p}
                onClick={() => togglePrice(p)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: active ? "var(--gg-yellow)" : "white",
                  border: `1.5px solid ${active ? "var(--gg-yellow-dark)" : "var(--gg-border)"}`,
                  color: "var(--gg-text)",
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cuisine (restaurants only) */}
      {category === "restaurant" && (
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--gg-muted)" }}>CUISINE</p>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((c) => {
              const active = filters.cuisine === c.toLowerCase();
              return (
                <button
                  key={c}
                  onClick={() => onChange({ ...filters, cuisine: active ? undefined : c.toLowerCase() })}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: active ? "var(--gg-yellow)" : "white",
                    border: `1.5px solid ${active ? "var(--gg-yellow-dark)" : "var(--gg-border)"}`,
                    color: "var(--gg-text)",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Open Now */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange({ ...filters, openNow: !filters.openNow })}
          className="flex items-center gap-2 text-sm font-medium transition-all px-3 py-1.5 rounded-lg"
          style={{
            background: filters.openNow ? "var(--gg-yellow)" : "white",
            border: `1.5px solid ${filters.openNow ? "var(--gg-yellow-dark)" : "var(--gg-border)"}`,
            color: "var(--gg-text)",
          }}
        >
          <span>{filters.openNow ? "✓" : ""} Open Now</span>
        </button>
      </div>
    </div>
  );
}
