"use client";

import { useEffect, useState } from "react";

const PHRASES = ["go", "go", "go", "gidget!"];

// Maltipoo SVG — cream/fluffy dog running
function MaltipooSVG() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="55" cy="50" rx="28" ry="18" fill="#F5EDD8" stroke="#D4B896" strokeWidth="1.5"/>
      {/* Fluffy texture on body */}
      <ellipse cx="45" cy="45" rx="8" ry="6" fill="#FDF5E6" opacity="0.7"/>
      <ellipse cx="65" cy="47" rx="7" ry="5" fill="#FDF5E6" opacity="0.7"/>
      {/* Head */}
      <circle cx="82" cy="38" r="16" fill="#F5EDD8" stroke="#D4B896" strokeWidth="1.5"/>
      {/* Fluffy head */}
      <circle cx="80" cy="32" r="9" fill="#FDF5E6" opacity="0.6"/>
      <circle cx="89" cy="30" r="7" fill="#FDF5E6" opacity="0.5"/>
      {/* Ear left */}
      <ellipse cx="72" cy="28" rx="7" ry="10" fill="#E8D0B0" stroke="#D4B896" strokeWidth="1" transform="rotate(-15 72 28)"/>
      {/* Ear right - flop */}
      <ellipse cx="91" cy="27" rx="6" ry="9" fill="#E8D0B0" stroke="#D4B896" strokeWidth="1" transform="rotate(10 91 27)"/>
      {/* Eye */}
      <circle cx="85" cy="37" r="3.5" fill="#2C1810"/>
      <circle cx="86.2" cy="35.8" r="1" fill="white"/>
      {/* Nose */}
      <ellipse cx="92" cy="42" rx="3" ry="2" fill="#8B5E3C"/>
      <circle cx="91" cy="41.5" r="0.8" fill="#C49070" opacity="0.5"/>
      {/* Mouth */}
      <path d="M90 44 Q92 46 94 44" stroke="#8B5E3C" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Tongue */}
      <ellipse cx="92" cy="46" rx="2.5" ry="1.8" fill="#E88080"/>
      {/* Tail wagging */}
      <path d="M27 48 Q18 35 22 26 Q26 18 30 22" stroke="#F5EDD8" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M30 22 Q34 18 32 14" stroke="#F5EDD8" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Front legs running */}
      <path d="M70 65 Q72 72 68 76" stroke="#E8D0B0" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M78 68 Q82 74 80 78" stroke="#E8D0B0" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Back legs */}
      <path d="M38 64 Q36 72 32 76" stroke="#E8D0B0" strokeWidth="5" fill="none" strokeLinecap="round"/>
      <path d="M47 67 Q48 75 45 79" stroke="#E8D0B0" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Paws */}
      <ellipse cx="68" cy="76" rx="4" ry="2.5" fill="#E8D0B0"/>
      <ellipse cx="80" cy="78" rx="4" ry="2.5" fill="#E8D0B0"/>
      <ellipse cx="32" cy="76" rx="4" ry="2.5" fill="#E8D0B0"/>
      <ellipse cx="45" cy="79" rx="4" ry="2.5" fill="#E8D0B0"/>
    </svg>
  );
}

export default function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [phraseIndex, setPhraseIndex] = useState(-1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setPhraseIndex(idx);
      idx++;
      if (idx >= PHRASES.length) {
        clearInterval(interval);
        setTimeout(() => {
          setDone(true);
          onComplete?.();
        }, 600);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-opacity duration-500 z-50 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "var(--gg-cream)" }}
    >
      {/* App name */}
      <div className="mb-10 text-center">
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ color: "var(--gg-yellow-dark)", fontFamily: "Georgia, serif" }}
        >
          Go Gidget
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--gg-muted)" }}>
          pet-friendly places near you
        </p>
      </div>

      {/* Running dog */}
      <div className="relative w-48 h-24 flex items-center justify-center overflow-hidden">
        <div className="animate-dog-run">
          <MaltipooSVG />
        </div>
      </div>

      {/* Phrase sequence */}
      <div className="mt-8 h-10 flex items-center justify-center">
        {phraseIndex >= 0 && (
          <span
            key={phraseIndex}
            className="text-2xl font-bold animate-fade-in"
            style={{
              color: phraseIndex === PHRASES.length - 1 ? "var(--gg-yellow-dark)" : "var(--gg-brown)",
              fontSize: phraseIndex === PHRASES.length - 1 ? "2rem" : "1.5rem",
            }}
          >
            {PHRASES[phraseIndex]}
          </span>
        )}
      </div>

      {/* Paw dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="text-xl"
            style={{
              animation: `pawBounce 0.8s ease-in-out ${i * 0.2}s infinite`,
              color: "var(--gg-yellow-dark)",
            }}
          >
            🐾
          </span>
        ))}
      </div>
    </div>
  );
}
