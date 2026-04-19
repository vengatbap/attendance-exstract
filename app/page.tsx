import Link from "next/link";
import { AttendanceIntake } from "@/components/attendance-intake";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_34%),linear-gradient(180deg,_#f8fafc,_#eef6f4)] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-700">
                Internal Attendance Management
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
                Parse WhatsApp attendance updates, merge check-ins and check-outs, and export clean reports.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                This MVP turns shift messages into structured daily logs, station summaries, and operator
                timesheets with Excel export.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Open Dashboard
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400"
              >
                Internal Login
              </Link>
            </div>
          </div>
        </section>

        <AttendanceIntake showDashboardLink />
      </div>
    </main>
  );
}
