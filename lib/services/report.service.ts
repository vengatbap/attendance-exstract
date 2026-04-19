import { getAllAttendance, getAttendanceByDate } from "@/lib/store";
import { StationReportRow, TimesheetRow } from "@/lib/types";

type ReportFilters = {
  station?: string | null;
  month?: string | null;
  operator?: string | null;
};

function applySharedFilters<T extends { station: string; date: string; name: string }>(
  rows: T[],
  filters: ReportFilters
) {
  return rows.filter((row) => {
    if (filters.station && row.station !== filters.station.toUpperCase()) {
      return false;
    }

    if (filters.month && !row.date.startsWith(filters.month)) {
      return false;
    }

    if (filters.operator && row.name.toLowerCase() !== filters.operator.toLowerCase()) {
      return false;
    }

    return true;
  });
}

export async function getDailyLogs(date: string) {
  return getAttendanceByDate(date);
}

export async function getStationReport(filters: ReportFilters): Promise<StationReportRow[]> {
  const records = applySharedFilters(await getAllAttendance(), filters);
  const grouped = new Map<string, StationReportRow>();

  for (const record of records) {
    const key = `${record.station}|${record.name}`;
    const existing = grouped.get(key) ?? {
      name: record.name,
      station: record.station,
      totalDays: 0,
      completedDays: 0,
      missingDays: 0,
      totalHours: 0,
    };

    existing.totalDays += 1;
    if (record.status === "Completed") {
      existing.completedDays += 1;
    }

    if (record.status !== "Completed") {
      existing.missingDays += 1;
    }

    existing.totalHours = Number((existing.totalHours + record.workHours).toFixed(2));
    grouped.set(key, existing);
  }

  return [...grouped.values()].sort(
    (left, right) => left.station.localeCompare(right.station) || left.name.localeCompare(right.name)
  );
}

export async function getOperatorTimesheet(filters: ReportFilters): Promise<TimesheetRow[]> {
  const records = applySharedFilters(await getAllAttendance(), filters);

  return records
    .map((record) => ({
      date: record.date,
      name: record.name,
      station: record.station,
      shift: record.shift,
      inTime: record.inTime,
      outTime: record.outTime,
      hours: record.workHours,
      overtime: record.overtime,
      late: record.late,
      status: record.status,
    }))
    .sort((left, right) => left.date.localeCompare(right.date) || left.name.localeCompare(right.name));
}
