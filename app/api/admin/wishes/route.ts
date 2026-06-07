import { NextRequest, NextResponse } from "next/server";
import { readWishes } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const url = new URL(req.url);
  const provided = url.searchParams.get("secret") || req.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_SECRET;
  // If no ADMIN_SECRET is set we still require the request to provide the
  // literal string "change-me" so the env is not silently bypassed.
  if (!expected || expected === "change-me") return false;
  return provided === expected;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await readWishes();
  return NextResponse.json({ wishes: list });
}
