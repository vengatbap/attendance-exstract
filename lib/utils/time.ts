const DATE_PATTERN = /^(\d{2})[-/](\d{2})[-/](\d{4})$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function normalizeDate(value: string): string | null {
  const trimmed = value.trim();
  const isoMatch = trimmed.match(ISO_DATE_PATTERN);

  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const match = trimmed.match(DATE_PATTERN);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

export function normalizeTime(value: string): string | null {
  const trimmed = value.trim().toUpperCase().replace(/\s+/g, "");
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(AM|PM)?$/);

  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3];

  if (minute > 59 || hour > 23) {
    return null;
  }

  if (period === "PM" && hour < 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function calculateWorkHours(inTime: string | null, outTime: string | null): number {
  if (!inTime || !outTime) {
    return 0;
  }

  const start = toMinutes(inTime);
  let end = toMinutes(outTime);

  if (end < start) {
    end += 24 * 60;
  }

  return Number(((end - start) / 60).toFixed(2));
}

export function extractShiftStart(shift: string): string | null {
  const match = shift.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) {
    return null;
  }

  return normalizeTime(match[1]);
}

export function formatHours(value: number): string {
  return value.toFixed(2);
}

export function normalizeName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeStation(value: string): string {
  return value.replace(/\s+/g, " ").trim().toUpperCase();
}

export function currentIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
