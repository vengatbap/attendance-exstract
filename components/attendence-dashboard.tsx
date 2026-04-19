"use client";

import { useEffect, useState, useTransition } from "react";
import { AttendanceIntake } from "@/components/attendance-intake";
import DailyTable from "@/components/table/DailyTable";
import StationReportTable from "@/components/table/StationReportTable";
import TimesheetTable from "@/components/table/TimesheetTable";
import { AttendanceRecord, StationReportRow, TimesheetRow } from "@/lib/types";

type DashboardProps = {
  initialDailyLogs: AttendanceRecord[];
  initialStationReport: StationReportRow[];
  initialTimesheet: TimesheetRow[];
  defaultDate: string;
  defaultMonth: string;
};

type TabKey = "daily" | "station" | "timesheet";

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as T | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : "Request failed.";
    throw new Error(message);
  }

  if (!data) {
    throw new Error("Empty response.");
  }

  return data;
}

export function AttendanceDashboard({
  initialDailyLogs,
  initialStationReport,
  initialTimesheet,
  defaultDate,
  defaultMonth,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("daily");
  const [dailyDate, setDailyDate] = useState(defaultDate);
  const [reportMonth, setReportMonth] = useState(defaultMonth);
  const [station, setStation] = useState("");
  const [operator, setOperator] = useState("");
  const [dailyLogs, setDailyLogs] = useState(initialDailyLogs);
  const [stationReport, setStationReport] = useState(initialStationReport);
  const [timesheet, setTimesheet] = useState(initialTimesheet);
  const [info, setInfo] = useState("");
  const [isRefreshing, startRefresh] = useTransition();

  async function refreshDaily(nextDate: string) {
    const response = await fetch(`/api/report/daily?date=${nextDate}`);
    const data = await readJson<{ records: AttendanceRecord[] }>(response);
    setDailyLogs(data.records);
  }

  async function refreshReports(nextMonth: string, nextStation: string, nextOperator: string) {
    const params = new URLSearchParams();
    params.set("month", nextMonth);

    if (nextStation.trim()) {
      params.set("station", nextStation.trim().toUpperCase());
    }

    if (nextOperator.trim()) {
      params.set("operator", nextOperator.trim());
    }

    const [stationResponse, timesheetResponse] = await Promise.all([
      fetch(`/api/report/station?${params.toString()}`),
      fetch(`/api/report/timesheet?${params.toString()}`),
    ]);

    const stationData = await readJson<{ records: StationReportRow[] }>(stationResponse);
    const timesheetData = await readJson<{ records: TimesheetRow[] }>(timesheetResponse);
    setStationReport(stationData.records);
    setTimesheet(timesheetData.records);
  }

  useEffect(() => {
    startRefresh(async () => {
      try {
        await refreshDaily(dailyDate);
        setInfo(`Loaded daily logs for ${dailyDate}.`);
      } catch (error) {
        setInfo(error instanceof Error ? error.message : "Unable to load daily logs.");
      }
    });
  }, [dailyDate]);

  useEffect(() => {
    startRefresh(async () => {
      try {
        await refreshReports(reportMonth, station, operator);
        setInfo(`Updated reports for ${reportMonth}.`);
      } catch (error) {
        setInfo(error instanceof Error ? error.message : "Unable to load reports.");
      }
    });
  }, [reportMonth, station, operator]);

  async function handleDownload() {
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dailyDate,
          month: reportMonth,
          station: station.trim() || null,
          operator: operator.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to generate workbook.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `attendance-report-${reportMonth}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
      setInfo("Excel workbook downloaded.");
    } catch (error) {
      setInfo(error instanceof Error ? error.message : "Unable to download workbook.");
    }
  }

  return (
    <div className="space-y-6">
      <AttendanceIntake
        onSaved={async () => {
          await refreshDaily(dailyDate);
          await refreshReports(reportMonth, station, operator);
          setInfo("Attendance saved and dashboard refreshed.");
        }}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Reports
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Daily logs, station summaries, and operator timesheets
            </h2>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Download Excel
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <label className="space-y-2 text-sm text-slate-600">
            <span className="block font-medium text-slate-700">Daily date</span>
            <input
              type="date"
              value={dailyDate}
              onChange={(event) => setDailyDate(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span className="block font-medium text-slate-700">Report month</span>
            <input
              type="month"
              value={reportMonth}
              onChange={(event) => setReportMonth(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span className="block font-medium text-slate-700">Station</span>
            <input
              value={station}
              onChange={(event) => setStation(event.target.value)}
              placeholder="MUSALLA BS"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            <span className="block font-medium text-slate-700">Operator</span>
            <input
              value={operator}
              onChange={(event) => setOperator(event.target.value)}
              placeholder="Syedali"
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("daily")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeTab === "daily" ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Daily Logs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("station")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeTab === "station" ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Station Report
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timesheet")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeTab === "timesheet" ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Operator Timesheet
          </button>
        </div>

        {info ? (
          <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{info}</p>
        ) : null}
        {isRefreshing ? <p className="mt-4 text-sm text-slate-500">Refreshing data...</p> : null}

        <div className="mt-5">
          {activeTab === "daily" ? <DailyTable data={dailyLogs} /> : null}
          {activeTab === "station" ? <StationReportTable data={stationReport} /> : null}
          {activeTab === "timesheet" ? <TimesheetTable data={timesheet} /> : null}
        </div>
      </section>
    </div>
  );
}
