import { NextRequest, NextResponse } from "next/server";
import { getDailyLogs } from "@/lib/services/report.service";
import { currentIsoDate } from "@/lib/utils/time";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? currentIsoDate();
  const records = await getDailyLogs(date);
  return NextResponse.json({ records, date });
}
