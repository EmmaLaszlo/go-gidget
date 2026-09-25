"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import PlaceCard from "@/components/places/PlaceCard";
import FilterBar from "@/components/places/FilterBar";
import UpgradeModal from "@/components/UpgradeModal";
import { Category, Place, PlaceFilters, FREE_CLICK_LIMIT } from "@/types";

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "cafe", label: "Cafes", emoji: "☕" },
  { id: "restaurant", label: "Restaurants", emoji: "🍽️" },
  { id: "store", label: "Stores", emoji: "🛍️" },
];

type LocationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; lat: number; lon: number }
  | { status: "denied" };

export default function ExplorePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [location, setLocation] = useState<LocationState>({ status: "idle" });
  const [manualCity, setManualCity] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [filters, setFilters] = useState<PlaceFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [error, setError] = useState("");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [clickCount, setClickCount] = useState(user?.clickCount ?? 0);
  const [history, setHistory] = useState<{ category: string; createdAt: string }[]>([]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  // Sync clickCount from user
  useEffect(() => {
    if (user) setClickCount(user.clickCount);
  }, [user]);

  // Request location on mount
  useEffect(() => {
    setLocation({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ status: "ready", lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setLocation({ status: "denied" })
    );
  }, []);

  // Load search history
  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setHistory(d.history ?? []))
      .catch(() => {});
  }, []);

  const search = useCallback(
    async (category: Category, loc: { lat: number; lon: number }) => {
      setLoadingPlaces(true);
      setError("");
      setPlaces([]);

      const params = new URLSearchParams({
        category,
        lat: String(loc.lat),
        lon: String(loc.lon),
        openNow: String(filters.openNow ?? false),
      });
      filters.price?.forEach((p) => params.append("price", p));
      if (filters.cuisine) params.set("cuisine", filters.cuisine);

      const res = await fetch(`/api/places?${params}`);
      const data = await res.json();

      if (res.status === 402) {
        setShowUpgrade(true);
        setLoadingPlaces(false);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoadingPlaces(false);
        return;
      }

      setPlaces(data.places);
      setClickCount(data.clickCount);
      setLoadingPlaces(false);
    },
    [filters]
  );

  const handleCategoryClick = async (cat: Category) => {
    setActiveCategory(cat);
    setShowFilters(false);

    if (location.status !== "ready") {
      setError("Location required. Please allow location access.");
      return;
    }
    await search(cat, { lat: location.lat, lon: location.lon });
  };

  const handleReSearch = async () => {
    if (!activeCategory || location.status !== "ready") return;
    await search(activeCategory, { lat: location.lat, lon: location.lon });
  };

  if (authLoading || !user) return null;

  const clicksLeft = FREE_CLICK_LIMIT - clickCount;
  const nearLimit = !user.isPremium && clicksLeft <= 5;

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--gg-cream)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 px-4 py-3"
        style={{ background: "var(--gg-cream)", borderBottom: "1.5px solid var(--gg-border)" }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <h1 className="text-lg font-bold" style={{ color: "var(--gg-yellow-dark)", fontFamily: "Georgia, serif" }}>
              Go Gidget
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {!user.isPremium && (
              <span className="text-xs font-medium px-2 py-1 rounded-full"
                style={{ background: nearLimit ? "#FEE2E2" : "var(--gg-yellow-light)", color: nearLimit ? "#991B1B" : "var(--gg-brown)" }}>
                {clicksLeft} left
              </span>
            )}
            <button onClick={logout} className="text-xs" style={{ color: "var(--gg-muted)" }}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5">
        {/* Greeting */}
        <div className="mb-5">
          <p className="text-xl font-semibold" style={{ color: "var(--gg-text)" }}>
            Hi, {user.username}! 🐶
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--gg-muted)" }}>
            Find pet-friendly spots near you
          </p>
        </div>

        {/* Location status */}
        {location.status === "denied" && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B" }}>
            📍 Location access denied.{" "}
            <button className="underline font-medium" style={{ color: "#92400E" }} onClick={() => {
              setLocation({ status: "loading" });
              navigator.geolocation.getCurrentPosition(
                (p) => setLocation({ status: "ready", lat: p.coords.latitude, lon: p.coords.longitude }),
                () => setLocation({ status: "denied" })
              );
            }}>
              Try again
            </button>
          </div>
        )}

        {/* Categories */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                disabled={loadingPlaces}
                className="flex flex-col items-center gap-2 py-5 rounded-2xl transition-all font-medium text-sm"
                style={{
                  background: active ? "var(--gg-yellow)" : "white",
                  border: `1.5px solid ${active ? "var(--gg-yellow-dark)" : "var(--gg-border)"}`,
                  color: "var(--gg-text)",
                  boxShadow: active ? "0 2px 12px rgba(245,200,66,0.3)" : "0 1px 4px rgba(0,0,0,0.05)",
                  transform: active ? "scale(1.02)" : "scale(1)",
                }}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters toggle */}
        {activeCategory && (
          <div className="mb-4">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all"
              style={{
                background: showFilters ? "var(--gg-yellow)" : "white",
                border: "1.5px solid var(--gg-border)",
                color: "var(--gg-text)",
              }}
            >
              <span>⚙️</span> Filters {showFilters ? "↑" : "↓"}
            </button>

            {showFilters && (
              <div
                className="mt-3 p-4 rounded-2xl animate-fade-in"
                style={{ background: "white", border: "1.5px solid var(--gg-border)" }}
              >
                <FilterBar
                  category={activeCategory}
                  filters={filters}
                  onChange={(f) => { setFilters(f); }}
                />
                <button
                  onClick={handleReSearch}
                  className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--gg-yellow)", color: "var(--gg-text)" }}
                >
                  Apply filters 🐾
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#FEE2E2", color: "#991B1B" }}>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loadingPlaces && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl animate-pulse"
                style={{ background: "var(--gg-yellow-light)" }}
              />
            ))}
          </div>
        )}

        {/* Results */}
        {!loadingPlaces && places.length > 0 && (
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: "var(--gg-muted)" }}>
              {places.length} pet-friendly spots nearby
            </p>
            <div className="space-y-4">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loadingPlaces && activeCategory && places.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🐾</div>
            <p className="font-medium" style={{ color: "var(--gg-text)" }}>No spots found nearby</p>
            <p className="text-sm mt-1" style={{ color: "var(--gg-muted)" }}>Try a different category or remove filters</p>
          </div>
        )}

        {/* Recent searches */}
        {!activeCategory && history.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--gg-muted)" }}>RECENT SEARCHES</p>
            <div className="space-y-2">
              {history.slice(0, 5).map((h, i) => (
                <button
                  key={i}
                  onClick={() => handleCategoryClick(h.category as Category)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all"
                  style={{ background: "white", border: "1.5px solid var(--gg-border)", color: "var(--gg-text)" }}
                >
                  <span>🕐</span>
                  <span className="capitalize">{h.category}</span>
                  <span className="ml-auto text-xs" style={{ color: "var(--gg-muted)" }}>
                    {new Date(h.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Upgrade Modal */}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
