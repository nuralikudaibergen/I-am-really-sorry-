"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WISH_OPTIONS } from "@/lib/types";

type Status = "idle" | "submitting" | "done" | "error";

export default function WishForm() {
  const [choice, setChoice] = useState<string>("");
  const [custom, setCustom] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!choice) {
      setError("Pick a wish, pretty please 🥺👉👈");
      return;
    }
    if (choice === "other" && !custom.trim()) {
      setError("Type your demanding wish in the box 💖");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice, custom: choice === "other" ? custom : "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Something went wrong. Try again?");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Network hiccup. Please try once more 💔");
      setStatus("error");
    }
  };

  /* ----------- success screen ----------- */
  if (status === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-[92vw] max-w-lg rounded-[2rem] bg-white/90 backdrop-blur-md p-8 md:p-10 shadow-card border border-white text-center"
      >
        <div className="text-5xl mb-3">🕊️✨</div>
        <h2 className="font-rounded text-2xl md:text-3xl font-bold text-rose-500">
          Thank you!
        </h2>
        <p className="text-rose-400 mt-2">
          Your wish has been sent — I will make it happen soon! 💖
        </p>
        <div className="mt-6 flex justify-center gap-2 text-2xl">
          <span className="animate-pulseSoft">💖</span>
          <span className="animate-pulseSoft" style={{ animationDelay: "0.2s" }}>💗</span>
          <span className="animate-pulseSoft" style={{ animationDelay: "0.4s" }}>💞</span>
        </div>
      </motion.div>
    );
  }

  /* ----------- form ----------- */
  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-[92vw] max-w-lg rounded-[2rem] bg-white/85 backdrop-blur-md p-6 md:p-8 shadow-card border border-white"
    >
      <h1 className="text-center font-rounded text-2xl md:text-3xl font-bold text-rose-500 leading-tight">
        The answer was obvious and I knew it! 😎❤️
      </h1>
      <p className="text-center text-rose-400 mt-2 text-sm md:text-base">
        What do you want in return for your forgiveness?
      </p>

      <div className="mt-6 grid gap-3">
        {WISH_OPTIONS.map((opt) => {
          const selected = choice === opt.key;
          return (
            <label
              key={opt.key}
              className={`group flex items-center gap-3 cursor-pointer rounded-2xl border px-4 py-3 transition-all
                ${
                  selected
                    ? "border-rose-300 bg-rose-50 shadow-dreamy"
                    : "border-rose-100 bg-white/70 hover:bg-rose-50/60"
                }`}
            >
              <input
                type="radio"
                name="wish"
                value={opt.key}
                checked={selected}
                onChange={() => setChoice(opt.key)}
                className="sr-only"
              />
              <span className="text-2xl">{opt.emoji}</span>
              <span className="flex-1 text-rose-500 font-medium">{opt.label}</span>
              <span
                className={`h-5 w-5 rounded-full border-2 grid place-items-center transition
                  ${selected ? "border-rose-400" : "border-rose-200"}`}
                aria-hidden
              >
                {selected && <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />}
              </span>
            </label>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {choice === "other" && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              <label className="block text-rose-400 text-sm mb-1 ml-1">
                Your demanding wish ✨
              </label>
              <textarea
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                rows={3}
                placeholder="Type your demanding wish here... 🥰"
                className="w-full rounded-2xl border border-rose-200 bg-white/80 p-3 text-rose-500 placeholder:text-rose-300 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-200/40 transition"
                maxLength={500}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-3 text-center text-sm text-strawberry">{error}</p>
      )}

      <motion.button
        type="submit"
        disabled={status === "submitting"}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="mt-6 w-full rounded-full bg-gradient-to-br from-rose-300 to-rose-500 px-6 py-3 text-white font-semibold shadow-button disabled:opacity-60"
      >
        {status === "submitting" ? "Sending… 💌" : "Send my wish 💖"}
      </motion.button>
    </motion.form>
  );
}
