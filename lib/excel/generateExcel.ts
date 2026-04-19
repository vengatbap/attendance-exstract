import ExcelJS from "exceljs";
import { AttendanceRecord, StationReportRow, TimesheetRow } from "@/lib/types";
import { formatHours } from "@/lib/utils/time";
import { applyBodyBorders, applyHeaderStyle, applyTitleSheetStyle } from "@/lib/excel/formatExcel";

type WorkbookInput = {
  dailyLogs: AttendanceRecord[];
  stationReport: StationReportRow[];
  timesheet: TimesheetRow[];
  date: string;
  month: string;
  station?: string | null;
  operator?: string | null;
};

function addDailySheet(workbook: ExcelJS.Workbook, input: WorkbookInput) {
  const sheet = workbook.addWorksheet("Daily Logs", {
    views: [{ state: "frozen", ySplit: 3 }],
  });

  sheet.addRow(["Attendance Daily Logs"]);
  sheet.addRow([`Date: ${input.date}${input.station ? ` | Station: ${input.station}` : ""}`]);
  applyTitleSheetStyle(sheet, 10);

  const header = sheet.addRow([
    "Name",
    "Station",
    "Date",
    "Shift",
    "IN",
    "OUT",
    "Hours",
    "Overtime",
    "Late",
    "Status",
  ]);
  applyHeaderStyle(header);

  for (const row of input.dailyLogs) {
    sheet.addRow([
      row.name,
      row.station,
      row.date,
      row.shift,
      row.inTime ?? "-",
      row.outTime ?? "-",
      formatHours(row.workHours),
      formatHours(row.overtime),
      row.late ? "Yes" : "No",
      row.status,
    ]);
  }

  sheet.columns = [
    { width: 20 },
    { width: 18 },
    { width: 14 },
    { width: 28 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 12 },
    { width: 10 },
    { width: 14 },
  ];

  applyBodyBorders(sheet, 4);
}

function addStationSheet(workbook: ExcelJS.Workbook, input: WorkbookInput) {
  const sheet = workbook.addWorksheet("Station Report", {
    views: [{ state: "frozen", ySplit: 3 }],
  });

  sheet.addRow(["Station Monthly Report"]);
  sheet.addRow([`Month: ${input.month}${input.station ? ` | Station: ${input.station}` : ""}`]);
  applyTitleSheetStyle(sheet, 6);

  const header = sheet.addRow([
    "Operator",
    "Station",
    "Total Days",
    "Completed Days",
    "Missing Days",
    "Total Hours",
  ]);
  applyHeaderStyle(header);

  for (const row of input.stationReport) {
    sheet.addRow([
      row.name,
      row.station,
      row.totalDays,
      row.completedDays,
      row.missingDays,
      formatHours(row.totalHours),
    ]);
  }

  sheet.columns = [
    { width: 20 },
    { width: 18 },
    { width: 12 },
    { width: 16 },
    { width: 14 },
    { width: 12 },
  ];

  applyBodyBorders(sheet, 4);
}

function addTimesheetSheet(workbook: ExcelJS.Workbook, input: WorkbookInput) {
  const sheet = workbook.addWorksheet("Timesheet", {
    views: [{ state: "frozen", ySplit: 3 }],
  });

  sheet.addRow(["Operator Timesheet"]);
  sheet.addRow([
    `Month: ${input.month}${input.operator ? ` | Operator: ${input.operator}` : ""}${
      input.station ? ` | Station: ${input.station}` : ""
    }`,
  ]);
  applyTitleSheetStyle(sheet, 9);

  const header = sheet.addRow([
    "Date",
    "Operator",
    "Station",
    "Shift",
    "IN",
    "OUT",
    "Hours",
    "Overtime",
    "Status",
  ]);
  applyHeaderStyle(header);

  for (const row of input.timesheet) {
    sheet.addRow([
      row.date,
      row.name,
      row.station,
      row.shift,
      row.inTime ?? "-",
      row.outTime ?? "-",
      formatHours(row.hours),
      formatHours(row.overtime),
      row.status,
    ]);
  }

  sheet.columns = [
    { width: 14 },
    { width: 20 },
    { width: 18 },
    { width: 28 },
    { width: 10 },
    { width: 10 },
    { width: 10 },
    { width: 12 },
    { width: 14 },
  ];

  applyBodyBorders(sheet, 4);
}

export async function generateAttendanceWorkbook(input: WorkbookInput): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Attendance Management System";
  workbook.created = new Date();

  addDailySheet(workbook, input);
  addStationSheet(workbook, input);
  addTimesheetSheet(workbook, input);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
