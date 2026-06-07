import { kv } from "@vercel/kv";

/**
 * Storage adapter. We support two backends:
 *  1) Vercel KV (preferred) — set the KV_* env vars.
 *  2) Telegram bot fallback — set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID.
 *
 * If neither is configured, we fall back to an in-memory list.
 * That last one is INTENTIONALLY local-only; it exists so the project
 * runs out of the box in `next dev` without any setup. Deploy to Vercel
 * and configure KV (or Telegram) to make the data persist & shared.
 *
 * In-memory store: pinned to globalThis so that HMR module reloads in
 * dev don't fragment the data across copies. Production doesn't use this.
 */

const KEY = "wishes:list";

type GlobalShape = typeof globalThis & { __forgiveMeMemory?: { list: any[] } };
const g = globalThis as GlobalShape;
if (!g.__forgiveMeMemory) g.__forgiveMeMemory = { list: [] };
const memory = g.__forgiveMeMemory;

export const isKVConfigured = Boolean(
  process.env.KV_URL &&
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
);

export const isTelegramConfigured = Boolean(
  process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
);

export async function appendWish(entry: unknown) {
  if (isKVConfigured) {
    // Push to the head so the newest item shows up first in the admin panel.
    await kv.lpush(KEY, JSON.stringify(entry));
    return;
  }
  memory.list.unshift(entry);
}

export async function readWishes(): Promise<any[]> {
  if (isKVConfigured) {
    const raw = (await kv.lrange(KEY, 0, 199)) as string[];
    return raw.map((r) => {
      try {
        return typeof r === "string" ? JSON.parse(r) : r;
      } catch {
        return r;
      }
    });
  }
  return memory.list;
}

export async function clearWishes() {
  if (isKVConfigured) {
    await kv.del(KEY);
    return;
  }
  memory.list = [];
}

/**
 * Replace the in-memory list (only used by the in-memory fallback).
 * In production with KV configured, callers should `clearWishes()` and
 * `appendWish()` instead.
 */
export function __setMemory(list: any[]) {
  if (isKVConfigured) return;
  memory.list = list;
}
