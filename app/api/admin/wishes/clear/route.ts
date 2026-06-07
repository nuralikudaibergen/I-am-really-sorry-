import { NextRequest, NextResponse } from "next/server";
import { clearWishes } from "@/lib/kv";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
