"use client";

import { useState } from "react";
import { Place } from "@/types";
import GoGidgetRating from "@/components/GoGidgetRating";

interface Props {
  place: Place;
  onFavorite?: (place: Place, isFav: boolean) => void;
  isFavorited?: boolean;
}

const CONFIDENCE_LABELS = {
  high: { text: "high confidence", color: "#15803D" },
  moderate: { text: "moderate confidence", color: "#B45309" },
  low: { text: "low confidence", color: "#9CA3AF" },
};

export default function PlaceCard({ place, onFavorite, isFavorited = false }: Props) {
  const [fav, setFav] = useState(isFavorited);
  const [expanded, setExpanded] = useState(false);

  const toggleFav = async () => {
    const next = !fav;
    setFav(next);
    if (next) {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeId: place.id,
          placeName: place.name,
          placeType: place.category,
          lat: place.lat,
          lon: place.lon,
        }),
      });
    } else {
      await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: place.id }),
      });
    }
    onFavorite?.(place, next);
  };

  const conf = place.aiConfidence ? CONFIDENCE_LABELS[place.aiConfidence] : null;

  return (
    <article
      className="rounded-2xl overflow-hidden transition-all animate-fade-in"
      style={{ background: "white", border: "1.5px solid var(--gg-border)", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
    >
      {/* Image */}
      {place.imageUrl && (
        <div className="relative w-full h-40 overflow-hidden">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Favorite button */}
          <button
            onClick={toggleFav}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{ background: "rgba(255,255,255,0.9)" }}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
          >
            {fav ? "❤️" : "🤍"}
          </button>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate" style={{ color: "var(--gg-text)" }}>
              {place.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-sm" style={{ color: "var(--gg-muted)" }}>
                {place.price}
              </span>
              <span className="text-xs" style={{ color: "var(--gg-muted)" }}>·</span>
              <span className="text-sm" style={{ color: "var(--gg-muted)" }}>
                {place.distanceMiles} mi
              </span>
              {place.hours && (
                <>
                  <span className="text-xs" style={{ color: "var(--gg-muted)" }}>·</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: place.hours.open ? "#15803D" : "#DC2626" }}
                  >
                    {place.hours.open ? "Open now" : "Closed"}
                  </span>
                </>
              )}
            </div>
          </div>
          {/* Yelp rating */}
          <div className="text-right shrink-0">
            <span className="text-sm font-bold" style={{ color: "var(--gg-yellow-dark)" }}>
              ★ {place.rating.toFixed(1)}
            </span>
            <div className="text-xs" style={{ color: "var(--gg-muted)" }}>{place.reviewCount} reviews</div>
          </div>
        </div>

        {/* Address */}
        <p className="text-xs mt-2 truncate" style={{ color: "var(--gg-muted)" }}>
          📍 {place.address}
        </p>

        {/* AI Blurb */}
        {place.aiBlurb && (
          <div
            className="mt-3 px-3 py-2.5 rounded-xl text-sm"
            style={{ background: "var(--gg-yellow-light)", color: "var(--gg-text)" }}
          >
            <p className="leading-relaxed">{place.aiBlurb}</p>
            {conf && (
              <p className="text-xs mt-1 font-medium" style={{ color: conf.color }}>
                {conf.text}
              </p>
            )}
          </div>
        )}

        {/* Expand for details */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-xs font-medium"
          style={{ color: "var(--gg-yellow-dark)" }}
        >
          {expanded ? "Less ↑" : "More ↓"}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 animate-fade-in">
            {/* Categories */}
            <div className="flex flex-wrap gap-1">
              {place.yelpCategories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "var(--gg-yellow-light)", color: "var(--gg-brown)" }}
                >
                  {cat}
                </span>
              ))}
            </div>
            {/* Phone */}
            {place.phone && (
              <a href={`tel:${place.phone}`} className="block text-xs" style={{ color: "var(--gg-yellow-dark)" }}>
                📞 {place.phone}
              </a>
            )}
            {/* Yelp link */}
            {place.url && (
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs"
                style={{ color: "var(--gg-yellow-dark)" }}
              >
                View on Yelp ↗
              </a>
            )}
          </div>
        )}

        {/* Go Gidget Rating */}
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--gg-border)" }}>
          <p className="text-xs font-medium mb-2" style={{ color: "var(--gg-muted)" }}>
            Rate this spot
          </p>
          <GoGidgetRating
            placeId={place.id}
            communityRating={place.goGidgetRating}
            communityCount={place.goGidgetCount}
          />
        </div>
      </div>
    </article>
  );
}
