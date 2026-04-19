import { AttendanceDashboard } from "@/components/attendence-dashboard";
import { logoutAction } from "./actions";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { currentIsoDate } from "@/lib/utils/time";
import { getDailyLogs, getOperatorTimesheet, getStationReport } from "@/lib/services/report.service";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const today = currentIsoDate();
  const month = today.slice(0, 7);
  const [dailyLogs, stationReport, timesheet] = await Promise.all([
    getDailyLogs(today),
    getStationReport({ month }),
    getOperatorTimesheet({ month }),
  ]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc,_#eff6ff)] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                Attendance Dashboard
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Attendance Management System
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Logged in as {session.username}. Track daily logs, station reports, and operator timesheets.
              </p>
            </div>

            <form action={logoutAction}>
              <button className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700">
                Logout
              </button>
            </form>
          </div>
        </header>

        <AttendanceDashboard
          initialDailyLogs={dailyLogs}
          initialStationReport={stationReport}
          initialTimesheet={timesheet}
          defaultDate={today}
          defaultMonth={month}
        />
      </div>
    </main>
  );
}
