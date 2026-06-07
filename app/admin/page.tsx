"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Wish = {
  id: string;
  name: string | null;
  choice: string;
  custom: string | null;
  message: string;
  createdAt: string;
};

const SECRET_STORAGE_KEY = "forgive-me:admin-secret";

function getStoredSecret(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SECRET_STORAGE_KEY);
}
function setStoredSecret(v: string | null) {
  if (typeof window === "undefined") return;
  if (v) sessionStorage.setItem(SECRET_STORAGE_KEY, v);
  else sessionStorage.removeItem(SECRET_STORAGE_KEY);
}

export default function AdminPage() {
  const [wishes, setWishes] = useState<Wish[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [secret, setSecret] = useState<string | null>(null);
  const [pwdInput, setPwdInput] = useState<string>("");
  const [pwdError, setPwdError] = useState<string>("");
  const [authChecked, setAuthChecked] = useState(false);

  const fetchWishes = useCallback(async (s: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/wishes`, {
        cache: "no-store",
        headers: { "x-admin-secret": s },
      });
      if (res.status === 401) {
        setStoredSecret(null);
        setSecret(null);
        setWishes(null);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWishes(data.wishes || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load wishes");
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, try the session-stored secret. If it works → enter. If not → show login.
  useEffect(() => {
    const stored = getStoredSecret();
    if (stored) {
      setSecret(stored);
      fetchWishes(stored);
    }
    setAuthChecked(true);
  }, [fetchWishes]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (!pwdInput) {
      setPwdError("Type the password 💭");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/wishes`, {
        cache: "no-store",
        headers: { "x-admin-secret": pwdInput },
      });
      if (res.status === 401) {
        setPwdError("Wrong password 😔");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStoredSecret(pwdInput);
      setSecret(pwdInput);
      const data = await res.json();
      setWishes(data.wishes || []);
    } catch (e: any) {
      setPwdError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    setStoredSecret(null);
    setSecret(null);
    setWishes(null);
    setPwdInput("");
  };

  const clearAll = async () => {
    if (!secret) return;
    if (!confirm("Are you sure? This will delete all wishes forever 💔")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/wishes/clear`, {
        method: "POST",
        headers: { "x-admin-secret": secret },
      });
      if (!res.ok) throw new Error("Failed to clear");
      setWishes([]);
    } catch (e: any) {
      setError(e?.message || "Failed to clear");
    } finally {
      setLoading(false);
    }
  };

  const deleteOne = async (id: string) => {
    if (!secret) return;
    if (!confirm("Delete this wish?")) return;
    try {
      const res = await fetch(`/api/admin/wishes/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      setWishes((prev) => (prev || []).filter((w) => w.id !== id));
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    }
  };

  const renameOne = async (id: string, name: string) => {
    if (!secret) return;
    try {
      const res = await fetch(`/api/admin/wishes/rename`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify({ id, name }),
      });
      if (!res.ok) throw new Error("Rename failed");
      const data = await res.json();
      setWishes((prev) =>
        (prev || []).map((w) => (w.id === id ? { ...w, name: data.wish.name } : w))
      );
    } catch (e: any) {
      setError(e?.message || "Rename failed");
    }
  };

  /* ---------- render: login ---------- */
  if (authChecked && !secret) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 sparkle-bg">
        <motion.form
          onSubmit={onLogin}
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-[92vw] max-w-sm rounded-[2rem] bg-white/90 backdrop-blur-md p-8 shadow-card border border-white"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="font-rounded text-2xl font-bold text-rose-500">
              Admin sign-in
            </h1>
            <p className="text-rose-400 text-sm mt-1">
              Enter the password to view the wishes.
            </p>
          </div>
          <div className="mt-6">
            <input
              type="password"
              value={pwdInput}
              onChange={(e) => setPwdInput(e.target.value)}
              autoFocus
              placeholder="Password"
              className="w-full rounded-2xl border border-rose-200 bg-white/80 p-3 text-rose-500 placeholder:text-rose-300 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-200/40 transition"
            />
          </div>
          {pwdError && (
            <p className="mt-2 text-center text-sm text-strawberry">{pwdError}</p>
          )}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-4 w-full rounded-full bg-gradient-to-br from-rose-300 to-rose-500 px-6 py-3 text-white font-semibold shadow-button disabled:opacity-60"
          >
            {loading ? "Checking…" : "Unlock 💖"}
          </motion.button>
        </motion.form>
      </main>
    );
  }

  /* ---------- render: dashboard ---------- */
  return (
    <main className="relative min-h-screen px-4 py-10 sparkle-bg">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="font-rounded text-3xl md:text-4xl font-bold text-rose-500">
              Submitted Wishes &amp; Responses 💌
            </h1>
            <p className="text-rose-400 text-sm mt-1">
              {wishes === null
                ? "Loading…"
                : `${wishes.length} wish${wishes.length === 1 ? "" : "es"} on file`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => secret && fetchWishes(secret)}
              disabled={loading || !secret}
              className="rounded-full bg-white border border-rose-200 text-rose-500 px-4 py-2 shadow-sm hover:bg-rose-50 transition"
            >
              Refresh 🔄
            </button>
            <button
              onClick={clearAll}
              disabled={loading || !wishes?.length}
              className="rounded-full bg-gradient-to-br from-rose-300 to-rose-500 text-white px-4 py-2 shadow-button disabled:opacity-50"
            >
              Clear history 🧹
            </button>
            <button
              onClick={onLogout}
              className="rounded-full bg-white border border-rose-200 text-rose-400 px-4 py-2 shadow-sm hover:bg-rose-50 transition"
              title="Log out"
            >
              Log out
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-2xl border border-strawberry/30 bg-strawberry/10 px-4 py-2 text-strawberry text-sm">
            {error}
          </div>
        )}

        {loading && wishes === null && (
          <div className="text-rose-400">Loading…</div>
        )}

        {wishes && wishes.length === 0 && (
          <div className="rounded-3xl bg-white/80 border border-white p-10 text-center text-rose-400 shadow-card">
            <div className="text-4xl mb-2">🕊️</div>
            No wishes yet. The page is fresh and waiting.
          </div>
        )}

        <ul className="grid gap-3">
          <AnimatePresence initial={false}>
            {wishes?.map((w) => (
              <WishRow
                key={w.id}
                wish={w}
                onDelete={() => deleteOne(w.id)}
                onRename={(name) => renameOne(w.id, name)}
              />
            ))}
          </AnimatePresence>
        </ul>

        <footer className="mt-10 text-center text-xs text-rose-300/80">
          🔐 Signed in. Your session is local to this tab.
        </footer>
      </div>
    </main>
  );
}

/* ---------- row with inline name editor ---------- */

function WishRow({
  wish,
  onDelete,
  onRename,
}: {
  wish: Wish;
  onDelete: () => void;
  onRename: (name: string) => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(wish.name ?? "");
  const [saving, setSaving] = useState(false);

  const commit = async () => {
    const next = draft.trim();
    if ((wish.name ?? "") === next) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onRename(next);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(wish.name ?? "");
    setEditing(false);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl bg-white/90 border border-white p-4 md:p-5 shadow-card"
    >
      <div className="flex items-center gap-2 mb-2">
        {!editing ? (
          <button
            onClick={() => {
              setDraft(wish.name ?? "");
              setEditing(true);
            }}
            className="group inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-500 hover:bg-rose-200 transition"
            title="Click to assign a name"
          >
            <span>🙋</span>
            <span>{wish.name?.trim() || "Anonymous"}</span>
            <span className="opacity-0 group-hover:opacity-100 transition">✏️</span>
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              commit();
            }}
            className="inline-flex items-center gap-1"
          >
            <span className="text-rose-400 text-xs">🙋</span>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Escape") cancel();
              }}
              maxLength={60}
              placeholder="Assign a name…"
              className="rounded-full border border-rose-200 bg-white px-2.5 py-0.5 text-xs text-rose-500 placeholder:text-rose-300 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/40 w-40"
            />
            {saving && <span className="text-xs text-rose-300">saving…</span>}
          </form>
        )}
        <span className="text-rose-300 text-xs">
          {new Date(wish.createdAt).toLocaleString()}
        </span>
      </div>

      <div className="flex items-start gap-4">
        <p className="flex-1 min-w-0 text-rose-500 font-medium break-words">
          {wish.message}
        </p>
        <button
          onClick={onDelete}
          className="shrink-0 rounded-full bg-rose-50 border border-rose-200 text-rose-400 hover:bg-rose-100 hover:text-rose-500 px-3 py-1 text-xs"
          title="Delete this wish"
        >
          Delete
        </button>
      </div>
    </motion.li>
  );
}
