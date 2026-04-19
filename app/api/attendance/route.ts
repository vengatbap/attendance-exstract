import { NextRequest, NextResponse } from "next/server";
import { parseAttendanceMessage } from "@/lib/services/attendance.service";
import { getDailyLogs } from "@/lib/services/report.service";
import { currentIsoDate } from "@/lib/utils/time";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? currentIsoDate();
  const records = await getDailyLogs(date);
  return NextResponse.json({ records, date });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const message = String(body.message ?? "");
  const mode = body.mode === "save";

  if (!message.trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const result = await parseAttendanceMessage(message, { persist: mode });
  return NextResponse.json({
    entries: result.operations,
    records: result.records,
    saved: mode ? result.summary.touchedRecords : 0,
  });
}
