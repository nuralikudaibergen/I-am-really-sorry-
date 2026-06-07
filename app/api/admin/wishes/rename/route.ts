import { NextRequest, NextResponse } from "next/server";
import { readWishes, clearWishes, appendWish, isKVConfigured } from "@/lib/kv";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitize(input: unknown, max = 60) {
  if (typeof input !== "string") return "";
  return input.replace(/[\x00-\x1F\x7F]/g, "").slice(0, max).trim();
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: any = {};
  try { body = await req.json(); } catch { body = {}; }

  const id = typeof body?.id === "string" ? body.id : "";
  const name = sanitize(body?.name, 60);

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const all = await readWishes();
  const idx = all.findIndex((w: any) => w?.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Wish not found" }, { status: 404 });
  }

  // Update in place
  all[idx] = { ...all[idx], name: name || null };

  // Persist
  if (isKVConfigured) {
    await clearWishes();
    for (const w of [...all].reverse()) {
      await appendWish(w);
    }
  } else {
    (await import("@/lib/kv")).__setMemory(all);
  }

  return NextResponse.json({ ok: true, wish: all[idx] });
}
