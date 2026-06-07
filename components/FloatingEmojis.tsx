"use client";

import { useEffect, useState } from "react";

type Emoji = {
  id: number;
  char: string;
  left: number;     // 0..100 (vw)
  top: number;      // 0..100 (vh)
  size: number;     // px
  duration: number; // s
  delay: number;    // s
  sway: boolean;
};

const POOL = [
  "❤️", "💖", "💕", "💗", "💓", "💞", "💝",
  "🐱", "🐰", "🧸", "🐻", "🐼", "🐨", "🦊",
  "✨", "⭐", "🌟", "💫", "🌸", "🌷", "🌹",
  "🍓", "🍰", "🍫", "🧁", "☕",
];

function makeEmojis(count: number): Emoji[] {
  // Avoid SSR/CSR mismatch by seeding with a deterministic-ish shuffle.
  const out: Emoji[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: i,
      char: POOL[Math.floor(Math.random() * POOL.length)],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 18 + Math.round(Math.random() * 28),
      duration: 6 + Math.random() * 8,
      delay: -Math.random() * 8,
      sway: Math.random() > 0.5,
    });
  }
  return out;
}

export default function FloatingEmojis({ count = 28 }: { count?: number }) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  useEffect(() => {
    setEmojis(makeEmojis(count));
  }, [count]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {emojis.map((e) => (
        <span
          key={e.id}
          className={`absolute select-none ${
            e.sway ? "animate-sway" : "animate-float"
          } animate-sparkle`}
          style={{
            left: `${e.left}%`,
            top: `${e.top}%`,
            fontSize: `${e.size}px`,
            animationDuration: `${e.duration}s, 1.8s`,
            animationDelay: `${e.delay}s, ${Math.abs(e.delay) / 2}s`,
            filter: "drop-shadow(0 4px 8px rgba(255, 120, 150, 0.25))",
          }}
        >
          {e.char}
        </span>
      ))}
    </div>
  );
}
