import { NextRequest, NextResponse } from "next/server";
import { parseAttendanceMessage } from "@/lib/services/attendance.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const expectedToken = process.env.WEBHOOK_TOKEN;
  const incomingToken = request.headers.get("x-webhook-token");

  if (expectedToken && incomingToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized webhook token." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const message = String(body.message ?? body.text ?? "");

  if (!message.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const result = await parseAttendanceMessage(message, { persist: true });
  return NextResponse.json({ ok: true, saved: result.summary.touchedRecords });
}
