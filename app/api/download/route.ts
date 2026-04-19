import { NextRequest } from "next/server";
import { generateAttendanceWorkbook } from "@/lib/excel";
import { getDailyLogs, getOperatorTimesheet, getStationReport } from "@/lib/services/report.service";
import { currentIsoDate } from "@/lib/utils/time";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const date = typeof body.date === "string" && body.date ? body.date : currentIsoDate();
  const month =
    typeof body.month === "string" && body.month ? body.month : currentIsoDate().slice(0, 7);
  const station = typeof body.station === "string" && body.station ? body.station : null;
  const operator = typeof body.operator === "string" && body.operator ? body.operator : null;

  const [dailyLogs, stationReport, timesheet] = await Promise.all([
    getDailyLogs(date),
    getStationReport({ month, station }),
    getOperatorTimesheet({ month, station, operator }),
  ]);

  const workbook = await generateAttendanceWorkbook({
    dailyLogs,
    stationReport,
    timesheet,
    date,
    month,
    station,
    operator,
  });

  return new Response(new Uint8Array(workbook), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="attendance-${month}.xlsx"`,
    },
  });
}
