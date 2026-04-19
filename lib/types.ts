export type AttendanceStatus = "Completed" | "Pending" | "Error";

export type ParsedAttendanceType = "CHECK_IN" | "CHECK_OUT";

export type ParsedAttendanceOperation = {
  type: ParsedAttendanceType;
  name: string;
  time: string;
  station: string | null;
  date: string | null;
  shift: string | null;
  sourceLine: string;
};

export type AttendanceRecord = {
  id: number;
  name: string;
  station: string;
  date: string;
  shift: string;
  inTime: string | null;
  outTime: string | null;
  workHours: number;
  overtime: number;
  late: boolean;
  status: AttendanceStatus;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceStore = {
  sequence: number;
  records: AttendanceRecord[];
};

export type ParseSummary = {
  parsedLines: number;
  touchedRecords: number;
  completed: number;
  pending: number;
  errors: number;
};

export type ParseResponse = {
  saved: boolean;
  operations: ParsedAttendanceOperation[];
  records: AttendanceRecord[];
  summary: ParseSummary;
};

export type StationReportRow = {
  name: string;
  station: string;
  totalDays: number;
  completedDays: number;
  missingDays: number;
  totalHours: number;
};

export type TimesheetRow = {
  date: string;
  name: string;
  station: string;
  shift: string;
  inTime: string | null;
  outTime: string | null;
  hours: number;
  overtime: number;
  late: boolean;
  status: AttendanceStatus;
};
