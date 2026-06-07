import { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";

/**
 * Admin authorization helper.
 *
 * - Reads the expected secret from `ADMIN_SECRET` (or `ADMIN_PASSWORD` for
 *   backwards-compat).
 * - Accepts it from the `x-admin-secret` header OR a `?secret=...` query
 *   param (so static links still work).
 * - Compares with `crypto.timingSafeEqual` to avoid timing leaks.
 * - If the env var is missing or set to a known-bad placeholder, the
 *   request is rejected — we never silently allow access.
 */

const PLACEHOLDERS = new Set(["change-me", "changeme", "password", "admin"]);

function expectedSecret(): string | null {
  const raw =
    process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (PLACEHOLDERS.has(trimmed.toLowerCase())) return null;
  return trimmed;
}

function constantTimeEquals(a: string, b: string): boolean {
  // Pad both sides to the same length so we can use timingSafeEqual.
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  const len = Math.max(aBuf.length, bBuf.length, 1);
  const aPad = Buffer.alloc(len);
  const bPad = Buffer.alloc(len);
  aBuf.copy(aPad);
  bBuf.copy(bPad);
  const sameLength = aBuf.length === bBuf.length;
  const eq = timingSafeEqual(aPad, bPad);
  return sameLength && eq;
}

export function isAuthorized(req: NextRequest): boolean {
  const expected = expectedSecret();
  if (!expected) return false;
  const url = new URL(req.url);
  const provided =
    url.searchParams.get("secret") ||
    req.headers.get("x-admin-secret") ||
    "";
  if (!provided) return false;
  return constantTimeEquals(provided, expected);
}
