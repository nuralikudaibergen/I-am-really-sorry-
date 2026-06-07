"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "./Confetti";
import { useRouter } from "next/navigation";

/**
 * The runaway "No" button.
 *
 * Why this is robust:
 *  - On desktop it uses `pointerover` / `pointerenter` to teleport.
 *  - On mobile it uses `touchstart` (so it moves the moment a finger lands)
 *    AND `pointerover` (because some browsers fire it on tap as well).
 *  - We compute a *random* position inside the visible viewport but keep
 *    the button fully on-screen with a 12px margin.
 *  - We measure the *card* and reserve a "no-fly-zone" rectangle in the
 *    center, so the button cannot overlap the headline.
 *  - We use `position: fixed` so the button escapes any clipping parent.
 *  - We disable the actual click via `onClick` (it just teleports again).
 */

const PAD = 12;        // distance from any viewport edge, in px
const SAFE_PAD = 16;   // padding around the card no-fly-zone, in px

type Rect = { left: number; top: number; right: number; bottom: number };

function pickSafeCoords(btnW: number, btnH: number, noFly: Rect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const minX = PAD;
  const maxX = vw - btnW - PAD;
  const minY = PAD;
  const maxY = vh - btnH - PAD;

  // Build the allowed area as 4 rectangles around the no-fly-zone.
  // We pick one of them at random to bias the button toward the corners.
  const zones: Rect[] = [
    // top strip
    { left: minX, top: minY, right: maxX, bottom: Math.max(minY, noFly.top - SAFE_PAD) },
    // bottom strip
    {
      left: minX,
      top: Math.min(maxY, noFly.bottom + SAFE_PAD),
      right: maxX,
      bottom: maxY,
    },
    // left strip
    { left: minX, top: minY, right: Math.max(minX, noFly.left - SAFE_PAD), bottom: maxY },
    // right strip
    {
      left: Math.min(maxX, noFly.right + SAFE_PAD),
      top: minY,
      right: maxX,
      bottom: maxY,
    },
  ].filter((z) => z.right > z.left && z.bottom > z.top);

  // Fall back to the entire viewport if all zones collapse (tiny screens).
  const pool = zones.length ? zones : [{ left: minX, top: minY, right: maxX, bottom: maxY }];

  for (let i = 0; i < 30; i++) {
    const z = pool[Math.floor(Math.random() * pool.length)];
    const x = z.left + Math.random() * (z.right - z.left - btnW);
    const y = z.top + Math.random() * (z.bottom - z.top - btnH);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    return { x, y };
  }
  // last-ditch
  return { x: minX, y: minY };
}

function measure(el: HTMLElement | null) {
  if (!el) return { width: 0, height: 0 };
  const r = el.getBoundingClientRect();
  return { width: r.width, height: r.height };
}

function rectFromEl(el: HTMLElement | null): Rect {
  if (!el) return { left: 0, top: 0, right: 0, bottom: 0 };
  const r = el.getBoundingClientRect();
  return {
    left: r.left,
    top: r.top,
    right: r.right,
    bottom: r.bottom,
  };
}

export default function ForgivenessCard() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const noBtnRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [forgiven, setForgiven] = useState(false);

  const teleport = useCallback(() => {
    const btn = noBtnRef.current;
    const card = cardRef.current;
    if (!btn) return;
    const { width: bw, height: bh } = measure(btn);
    const noFly = rectFromEl(card);
    const next = pickSafeCoords(bw, bh, noFly);
    setPos(next);
  }, []);

  const onForgive = () => {
    setForgiven(true);
    // Give confetti a beat before routing
    setTimeout(() => router.push("/wish"), 1600);
  };

  // Prevent native context menu on long-press (mobile) from being weird
  const preventContext = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <>
      {forgiven && <Confetti />}

      <AnimatePresence>
        {forgiven && (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <div className="rounded-3xl bg-white/90 backdrop-blur px-8 py-6 shadow-dreamy text-2xl md:text-3xl font-rounded text-rose-500">
              Yaaay! I love you! 💖
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 w-[92vw] max-w-md rounded-[2rem] bg-white/85 backdrop-blur-md p-8 md:p-10 shadow-card border border-white"
      >
        {/* Cute header emoji row */}
        <div className="flex items-center justify-center gap-2 text-3xl mb-4">
          <span className="animate-pulseSoft">🥺</span>
          <span className="animate-pulseSoft" style={{ animationDelay: "0.2s" }}>👉</span>
          <span className="animate-pulseSoft" style={{ animationDelay: "0.4s" }}>👈</span>
        </div>

        <h1 className="text-center font-rounded text-2xl md:text-3xl font-bold text-rose-500 leading-tight animate-shakeCute">
          Please forgive me... 🥺
        </h1>

        <p className="text-center text-rose-400 mt-3 text-sm md:text-base">
          I made this little page just for you. Will you give me another chance?
          <span className="block mt-1 text-rose-300">(I promise I&apos;ll do better 💗)</span>
        </p>

        {/* Buttons area — the "Yes" stays put, "No" teleports out of this area */}
        <div className="mt-8 flex items-center justify-center gap-4 min-h-[64px]">
          <motion.button
            onClick={onForgive}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={forgiven}
            className="ring-cute relative rounded-full bg-gradient-to-br from-rose-300 to-rose-500 px-6 py-3 text-white font-semibold shadow-button hover:shadow-lg transition-shadow"
          >
            <span className="inline-flex items-center gap-2">
              <span>I forgive you</span>
              <span>💖</span>
            </span>
          </motion.button>

          {/* The "No" button is rendered inside the card on first paint
              so screen readers + keyboard users can still reach it.
              As soon as it teleports once, it leaves the card via fixed. */}
          {!pos && (
            <button
              ref={noBtnRef}
              type="button"
              onClick={teleport}
              onPointerOver={teleport}
              onPointerDown={teleport}
              onTouchStart={teleport}
              onContextMenu={preventContext}
              className="rounded-full bg-white/90 border border-rose-200 px-6 py-3 text-rose-400 font-medium shadow-sm hover:bg-rose-50 transition-colors"
              aria-label="No"
            >
              <span className="inline-flex items-center gap-2">
                <span>No</span>
                <span>🙈</span>
              </span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Teleported "No" button lives here once it has run away */}
      {pos && !forgiven && (
        <motion.button
          ref={noBtnRef}
          type="button"
          onClick={teleport}
          onPointerOver={teleport}
          onPointerDown={teleport}
          onTouchStart={teleport}
          onContextMenu={preventContext}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ left: pos.x, top: pos.y, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          style={{ position: "fixed", left: pos.x, top: pos.y }}
          className="z-30 rounded-full bg-white/95 border border-rose-200 px-6 py-3 text-rose-400 font-medium shadow-dreamy hover:bg-rose-50 transition-colors"
          aria-label="No"
        >
          <span className="inline-flex items-center gap-2">
            <span>No</span>
            <span>🙈</span>
          </span>
        </motion.button>
      )}
    </>
  );
}
