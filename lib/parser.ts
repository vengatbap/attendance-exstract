import { ParsedAttendanceOperation } from "@/lib/types";
import { normalizeDate, normalizeName, normalizeStation, normalizeTime } from "@/lib/utils/time";

type MessageContext = {
  station: string | null;
  date: string | null;
  shift: string | null;
};

function normalizeShift(value: string): string {
  return value.replace(/\s+/g, " ").trim().toUpperCase();
}

function parseOperatorLine(
  line: string,
  context: MessageContext,
  fallbackType: ParsedAttendanceOperation["type"] | null
): ParsedAttendanceOperation | null {
  const match = line.match(/^(.+?)\s*-\s*(IN|OUT)\s*:\s*(.+)$/i);
  const looseMatch = line.match(/^(.+?)\s*-\s*(.+)$/);

  let name = "";
  let type: ParsedAttendanceOperation["type"] | null = fallbackType;
  let rawTime = "";

  if (match) {
    name = match[1];
    type = match[2].toUpperCase() === "IN" ? "CHECK_IN" : "CHECK_OUT";
    rawTime = match[3];
  } else if (looseMatch && fallbackType) {
    name = looseMatch[1];
    rawTime = looseMatch[2].replace(/^(IN|OUT)\s*:\s*/i, "");
  } else {
    return null;
  }

  const normalizedTime = normalizeTime(rawTime);
  if (!type || !normalizedTime) {
    return null;
  }

  return {
    type,
    name: normalizeName(name),
    time: normalizedTime,
    station: context.station,
    date: context.date,
    shift: context.shift,
    sourceLine: line,
  };
}

export function parseWhatsappMessage(message: string): ParsedAttendanceOperation[] {
  const lines = message
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const context: MessageContext = {
    station: null,
    date: null,
    shift: null,
  };

  const operations: ParsedAttendanceOperation[] = [];
  let currentType: ParsedAttendanceOperation["type"] | null = null;

  for (const line of lines) {
    if (/^CHECK[-\s]?IN:?$/i.test(line) || /^OPR:?$/i.test(line)) {
      currentType = "CHECK_IN";
      continue;
    }

    if (/^CHECK[-\s]?OUT:?$/i.test(line) || /^OUT:?$/i.test(line)) {
      currentType = "CHECK_OUT";
      continue;
    }

    const stationMatch = line.match(/^STATION\s*:\s*(.+)$/i);
    if (stationMatch) {
      context.station = normalizeStation(stationMatch[1]);
      continue;
    }

    const dateMatch = line.match(/^DATE\s*:\s*(.+)$/i);
    if (dateMatch) {
      context.date = normalizeDate(dateMatch[1]);
      continue;
    }

    const shiftMatch = line.match(/^SHIFT\s*:\s*(.+)$/i);
    if (shiftMatch) {
      context.shift = normalizeShift(shiftMatch[1]);
      continue;
    }

    const parsedLine = parseOperatorLine(line, context, currentType);
    if (parsedLine) {
      operations.push(parsedLine);
    }
  }

  return operations;
}

export const parseWhatsapp = parseWhatsappMessage;
export const parseMessages = parseWhatsappMessage;
