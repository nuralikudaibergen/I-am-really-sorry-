import { NextRequest, NextResponse } from "next/server";
import { readWishes, clearWishes, appendWish, isKVConfigured } from "@/lib/kv";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const all = await readWishes();
  const remaining = all.filter((w: any) => w?.id !== id);
  if (remaining.length === all.length) {
    return NextResponse.json({ ok: true, removed: 0 });
  }
  // Rewrite the storage list. For KV this is a clear + re-push. For
  // the in-memory fallback we just splice.
  if (isKVConfigured) {
    await clearWishes();
    // Push back in the same order so the list is unchanged for the admin.
    for (const w of [...remaining].reverse()) {
      await appendWish(w);
    }
  } else {
    // In-memory: replace contents in place.
    (await import("@/lib/kv")).__setMemory(remaining);
  }
  return NextResponse.json({ ok: true, removed: all.length - remaining.length });
}
