import { NextRequest, NextResponse } from "next/server";
import { clearWishes } from "@/lib/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest) {
  const url = new URL(req.url);
  const provided = url.searchParams.get("secret") || req.headers.get("x-admin-secret");
  const expected = process.env.ADMIN_SECRET;
  if (!expected || expected === "change-me") return false;
  return provided === expected;
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await clearWishes();
  return NextResponse.json({ ok: true });
}

// Allow POST with the same secret too — easier to call from a button
// without needing to support DELETE methods in the browser fetch.
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await clearWishes();
  return NextResponse.json({ ok: true });
}
