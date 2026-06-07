import { Redis } from "@upstash/redis";

/**
 * Storage adapter. We support two backends:
 *  1) Vercel KV / Upstash Redis (preferred) — set the KV_* env vars.
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

type GlobalShape = typeof globalThis & {
  __forgiveMeMemory?: { list: any[] };
  __forgiveMeRedis?: Redis;
};
const g = globalThis as GlobalShape;
if (!g.__forgiveMeMemory) g.__forgiveMeMemory = { list: [] };
const memory = g.__forgiveMeMemory;

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.KV_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  // Pin the client to globalThis so HMR / warm serverless instances
  // don't open a new connection per invocation.
  if (!g.__forgiveMeRedis) {
    g.__forgiveMeRedis = new Redis({ url, token });
  }
  return g.__forgiveMeRedis;
}

export const isKVConfigured = Boolean(
  (process.env.KV_REST_API_URL || process.env.KV_URL) &&
    process.env.KV_REST_API_TOKEN
);

export const isTelegramConfigured = Boolean(
  process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
);

export async function appendWish(entry: unknown) {
  const redis = getRedis();
  if (redis) {
    // Push to the head so the newest item shows up first in the admin panel.
    await redis.lpush(KEY, JSON.stringify(entry));
    return;
  }
  memory.list.unshift(entry);
}

export async function readWishes(): Promise<any[]> {
  const redis = getRedis();
  if (redis) {
    const raw = (await redis.lrange(KEY, 0, 199)) as unknown as Array<
      string | Record<string, unknown>
    >;
    return raw.map((r) => {
      if (typeof r === "string") {
        try {
          return JSON.parse(r);
        } catch {
          return r;
        }
      }
      return r;
    });
  }
  return memory.list;
}

export async function clearWishes() {
  const redis = getRedis();
  if (redis) {
    await redis.del(KEY);
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
