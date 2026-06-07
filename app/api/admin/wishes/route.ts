import { NextRequest, NextResponse } from "next/server";
import { readWishes } from "@/lib/kv";
import { isAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await readWishes();
  return NextResponse.json({ wishes: list });
}
