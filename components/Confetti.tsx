"use client";

import { useEffect } from "react";

/**
 * Wraps canvas-confetti in a "hearts & sparkles" preset.
 * Only runs on the client; no-ops on the server.
 */
export default function Confetti() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("canvas-confetti");
      if (cancelled) return;
      const confetti = mod.default;

      const colors = ["#ff7896", "#ffb3c6", "#ffd1dc", "#ff5577", "#ff4d6d"];
      const heart = confetti.shapeFromText({ text: "❤️" });
      const sparkle = confetti.shapeFromText({ text: "✨" });
      const star = confetti.shapeFromText({ text: "⭐" });

      const fire = (particleRatio: number, opts: confetti.Options) =>
        confetti({
          origin: { y: 0.6 },
          ...opts,
          particleCount: Math.floor(200 * particleRatio),
          shapes: [heart, sparkle, star],
          colors,
          scalar: 1.1,
          ticks: 240,
          gravity: 0.9,
          drift: 0,
        });

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
