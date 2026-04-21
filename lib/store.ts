import { promises as fs } from "node:fs";
import path from "node:path"; 
import { AttendanceRecord, AttendanceStatus, AttendanceStore, ParsedAttendanceOperation } from "@/lib/types";
import {
  calculateWorkHours,
  currentIsoDate,
  extractShiftStart,
  normalizeName,
  normalizeStation,
  toMinutes,
} from "@/lib/utils/time";  

const storePath = path.join(process.cwd(), "data", "attendance.json");

type StoreShape = {
  sequence: number;
  records: AttendanceRecord[];
};


function buildRecordKey(name: string, date: string, station: string): string {
  return `${normalizeName(name).toLowerCase()}|${date}|${normalizeStation(station)}`;
}

function computeStatus(record: Pick<AttendanceRecord, "inTime" | "outTime">): AttendanceStatus {
  if (record.inTime && record.outTime) {
    return "Completed";
  }

  if (record.inTime) {
    return "Pending";
  }

  return "Error";
}

function enrichRecord(record: AttendanceRecord): AttendanceRecord {
  const workHours = calculateWorkHours(record.inTime, record.outTime);
  const overtime = workHours > 8 ? Number((workHours - 8).toFixed(2)) : 0;
  const shiftStart = extractShiftStart(record.shift);
  const late = Boolean(record.inTime && shiftStart && toMinutes(record.inTime) > toMinutes(shiftStart));

  return {
    ...record,
    workHours,
    overtime,
    late,
    status: computeStatus(record),
  };
}

async function ensureStore() {
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  try {
    await fs.access(storePath);
  } catch {
    const initial: StoreShape = { sequence: 0, records: [] };
    await fs.writeFile(storePath, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(storePath, "utf8");
  return JSON.parse(raw) as StoreShape;
}

async function writeStore(store: StoreShape) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function cloneStore(store: AttendanceStore): AttendanceStore {
  return {
    sequence: store.sequence,
    records: store.records.map((record) => ({ ...record })),
  };
}

function sortRecords(records: AttendanceRecord[]): AttendanceRecord[] {
  return [...records].sort(
    (left, right) =>
      left.date.localeCompare(right.date) ||
      left.station.localeCompare(right.station) ||
      left.name.localeCompare(right.name)
  );
}

function createRecord(
  id: number,
  operation: ParsedAttendanceOperation,
  now: string
): AttendanceRecord | null {
  if (!operation.station || !operation.date) {
    return null;
  }

  const nextRecord: AttendanceRecord = {
    id,
    name: normalizeName(operation.name),
    station: normalizeStation(operation.station),
    date: operation.date,
    shift: operation.shift ?? "UNSPECIFIED",
    inTime: operation.type === "CHECK_IN" ? operation.time : null,
    outTime: operation.type === "CHECK_OUT" ? operation.time : null,
    workHours: 0,
    overtime: 0,
    late: false,
    status: "Pending",
    createdAt: now,
    updatedAt: now,
  };

  return enrichRecord(nextRecord);
}

function resolveCheckoutTarget(
  records: AttendanceRecord[],
  operation: ParsedAttendanceOperation
): AttendanceRecord | undefined {
  if (operation.station && operation.date) {
    const operationStation = operation.station;
    const operationDate = operation.date;

    return records.find(
      (record) =>
        buildRecordKey(record.name, record.date, record.station) ===
        buildRecordKey(operation.name, operationDate, operationStation)
    );
  }

  const pendingMatches = records
    .filter((record) => record.name === normalizeName(operation.name) && !record.outTime)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  return pendingMatches[0];
  }

function createErrorRecord(
  id: number,
  operation: ParsedAttendanceOperation,
  now: string
): AttendanceRecord {
  return enrichRecord({
    id,
    name: normalizeName(operation.name),
    station: operation.station ? normalizeStation(operation.station) : "UNKNOWN",
    date: operation.date ?? currentIsoDate(),
    shift: operation.shift ?? "UNSPECIFIED",
    inTime: null,
    outTime: operation.time,
    workHours: 0,
    overtime: 0,
    late: false,
    status: "Error",
    createdAt: now,
    updatedAt: now,
  });
}

function applyOperationsToStore(
  baseStore: AttendanceStore,
  operations: ParsedAttendanceOperation[]
): { store: AttendanceStore; touchedRecords: AttendanceRecord[] } {
  const store = cloneStore(baseStore);
  const touchedIds = new Set<number>();
  const now = new Date().toISOString();

  for (const operation of operations) {
    if (operation.type === "CHECK_IN") {
      if (!operation.station || !operation.date) {
        continue;
      }

      const key = buildRecordKey(operation.name, operation.date, operation.station);
      const existing = store.records.find(
        (record) => buildRecordKey(record.name, record.date, record.station) === key
      );

      if (existing) {
        existing.shift = operation.shift ?? existing.shift;
        existing.inTime = operation.time;
        existing.updatedAt = now;
        Object.assign(existing, enrichRecord(existing));
        touchedIds.add(existing.id);
        continue;
      }

      store.sequence += 1;
      const created = createRecord(store.sequence, operation, now);
      if (!created) {
        continue;
      }

      store.records.push(created);
      touchedIds.add(created.id);
      continue;
    }

    const target = resolveCheckoutTarget(store.records, operation);
    if (target) {
      target.outTime = operation.time;
      target.shift = operation.shift ?? target.shift;
      target.updatedAt = now;
      Object.assign(target, enrichRecord(target));
      touchedIds.add(target.id);
      continue;
    }

    store.sequence += 1;
    const orphanRecord = createErrorRecord(store.sequence, operation, now);
    store.records.push(orphanRecord);
    touchedIds.add(orphanRecord.id);
  }

  store.records = sortRecords(store.records).map(enrichRecord);

  return {
    store,
    touchedRecords: store.records.filter((record) => touchedIds.has(record.id)),
  };
  }

export async function previewOperations(operations: ParsedAttendanceOperation[]) {
  const store = await readStore();
  return applyOperationsToStore(store, operations);
}

export async function mergeParsedEntries(operations: ParsedAttendanceOperation[]) {
  const store = await readStore();
  const applied = applyOperationsToStore(store, operations);
  await writeStore(applied.store);
  return applied;
}

export async function getAllAttendance(): Promise<AttendanceRecord[]> {
  const store = await readStore();
  return sortRecords(store.records);
}

export async function getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
  const records = await getAllAttendance();
  return records.filter((record) => record.date === date);
}
