import { NextRequest, NextResponse } from "next/server";
import { getStationReport } from "@/lib/services/report.service";
import { currentIsoDate } from "@/lib/utils/time";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const month = searchParams.get("month") ?? currentIsoDate().slice(0, 7);
  const station = searchParams.get("station");
  const operator = searchParams.get("operator");

  const records = await getStationReport({ month, station, operator });
  return NextResponse.json({ records, month, station, operator });
}
