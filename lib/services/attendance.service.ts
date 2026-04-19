// import { mergeParsedEntries, previewOperations } from "@/lib/store";
// import { parseWhatsappMessage } from "@/lib/parser";
// import { ParseResponse } from "@/lib/types";

// function buildSummary(records: ParseResponse["records"], parsedLines: number) {
//   return {
//     parsedLines,
//     touchedRecords: records.length,
//     completed: records.filter((record) => record.status === "Completed").length,
//     pending: records.filter((record) => record.status === "Pending").length,
//     errors: records.filter((record) => record.status === "Error").length,
//   };
// }

// export async function parseAttendanceMessage(
//   message: string,
//   options: { persist: boolean }
// ): Promise<ParseResponse> {
//   const operations = parseWhatsappMessage(message);
//   const result = options.persist
//     ? await mergeParsedEntries(operations)
//     : await previewOperations(operations);

//   return {
//     saved: options.persist,
//     operations,
//     records: result.touchedRecords,
//     summary: buildSummary(result.touchedRecords, operations.length),
//   };
// }


function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function calcHours(inTime: string, outTime: string) {
  let start = toMinutes(inTime)
  let end = toMinutes(outTime)

  if (end < start) end += 24 * 60

  return (end - start) / 60
}

export function enrich(entries: any[]) {
  return entries.map((e) => {
    if (!e.inTime && e.outTime) {
      return { ...e, status: "Error" }
    }

    if (e.inTime && !e.outTime) {
      return { ...e, status: "Pending" }
    }

    if (e.inTime && e.outTime) {
      const hours = calcHours(e.inTime, e.outTime)

      return {
        ...e,
        workHours: Number(hours.toFixed(2)),
        overtime: hours > 8 ? Number((hours - 8).toFixed(2)) : 0,
        late: e.inTime > "06:00",
        status: "Completed",
      }
    }

    return e
  })
}