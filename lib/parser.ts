import { Console } from "node:console"


export interface Entry {
  name: string
  station: string
  date: string
  shift?: string
  inTime?: string
  outTime?: string
}


const SHIFT_MAP = {
  MORNING: "06:00-14:00",
  AFTERNOON: "14:00-22:00",
  EVENING: "14:00-22:00",
  NIGHT: "22:00-06:00",
}

function clean(line: string) {
  return line.replace(/\*/g, "").replace(/➡️|↪️/g, "").trim()
}

function normalizeTime(t: string) {
  return t.replace(".", ":")
}

// const raw = `YOUR_FULL_TEXT_HERE`

// const messages = raw.split(/\[\d{1,2}:\d{2}.*?\]/g).filter(Boolean)

type ParsedData = {
  station: string | null
  shift: string | null
  date: string | null
  operators: string[]
  inTimes: string[]
  outTimes: string[]
  driver: string | null
  vehicle: string | null
}

const STATIONS = ["MUSALLA", "SEEF", "HOORA", "SALMANIYA", "SALMABAD"]

function parseMessage(text: string): ParsedData {
  const upper = text.toUpperCase()

  // ✅ STATION
  const stationMatch = STATIONS.find((s) => upper.includes(s))

  // ✅ SHIFT
  const shiftMatch =
    upper.match(/MORNING|AFTERNOON|EVENING|NIGHT/)?.[0] || null

  // ✅ DATE (multiple formats handled)
  const dateMatch =
    text.match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/)?.[0] || null

  // ✅ OPERATORS
  const operators =
    [...text.matchAll(/OPR[^A-Z0-9]*([A-Z][A-Z\s]+)/gi)].map(
      (m) => m[1].trim()
    ) || []

  // ✅ IN TIMES
  const inTimes =
    [...text.matchAll(/IN\s*TIME[^0-9]*([\d:.]+\s*(AM|PM)?)/gi)].map(
      (m) => m[1]
    ) || []

  // also capture "@ 06:04 AM" style
  const inlineTimes =
    [...text.matchAll(/@\s*([\d:.]+\s*(AM|PM)?)/gi)].map((m) => m[1])

  // merge
  const allInTimes = [...inTimes, ...inlineTimes]

  // ✅ OUT TIMES
  const outTimes =
    [...text.matchAll(/OUT\s*TIME[^0-9]*([\d:.]+\s*(AM|PM)?)/gi)].map(
      (m) => m[1]
    ) || []

  // ✅ DRIVER
  const driver =
    text.match(/DRIVER[:\s-]*([A-Z]+)/i)?.[1] || null

  // ✅ VEHICLE
  const vehicle =
    text.match(/VEHICLE[^0-9]*([0-9]+)/i)?.[1] || null

  return {
    station: stationMatch || null,
    shift: shiftMatch,
    date: dateMatch,
    operators,
    inTimes: allInTimes,
    outTimes,
    driver,
    vehicle,
  }
}





export function parseWhatsapp(text: string): Entry[] {


// const parsedResults : ParsedData[] = messages.map((msg) => parseMessage(msg))

// console.log(parsedResults, "parsedResults");


  const lines = text.split("\n")

  let station = ""
  let date = ""
  let shift = ""

  let lastName = "" // for multi-line cases

  const entries: Entry[] = []
  const map: Record<string, Entry> = {}

  for (let raw of lines) {
    let line = clean(raw)
    let upper = line.toUpperCase()

    // ✅ STATION (FIXED)
    const foundStation = STATIONS.find((s) => upper.includes(s))
    if (foundStation) {
      station = foundStation
    }

    // 📅 DATE
    const d = line.match(/\d{2}[-/]\d{2}[-/]\d{4}/)
    if (d) date = d[0]

    // 🔁 SHIFT
    if (upper.includes("MORNING")) shift = "MORNING"
    if (upper.includes("AFTERNOON")) shift = "AFTERNOON"
    if (upper.includes("EVENING")) shift = "EVENING"
    if (upper.includes("NIGHT")) shift = "NIGHT"

    // =========================
    // ✅ NAME + TIME (INLINE)
    // =========================
    const inlineMatch = line.match(
      /OPR.*?[-:]?\s*([A-Za-z ]+).*?(\d{1,2}[:.]\d{2})/i
    )

    if (inlineMatch) {
      const name = inlineMatch[1].trim()
      const t = normalizeTime(inlineMatch[2])

      const entry: Entry = {
        name,
        station,
        date,
        shift,
        inTime: t,
      }

      entries.push(entry)
      map[name] = entry
      lastName = name
      continue
    }

    // =========================
    // ✅ NAME ONLY (MULTI-LINE)
    // =========================
    const nameOnly = line.match(/OPR.*?[-:]?\s*([A-Za-z ]+)$/i)
    if (nameOnly) {
      lastName = nameOnly[1].trim()

      const entry: Entry = {
        name: lastName,
        station,
        date,
        shift,
      }

      entries.push(entry)
      map[lastName] = entry
      continue
    }

    // =========================
    // ✅ IN TIME (NEXT LINE)
    // =========================
    const inOnly = line.match(/IN.*?(\d{1,2}[:.]\d{2})/i)
    if (inOnly && lastName && map[lastName]) {
      map[lastName].inTime = normalizeTime(inOnly[1])
    }

    // =========================
    // 🔴 OUT TIME
    // =========================
    const outMatch = line.match(/OUT.*?(\d{1,2}[:.]\d{2})/i)

    if (outMatch) {
      const t = normalizeTime(outMatch[1])

      if (lastName && map[lastName]) {
        map[lastName].outTime = t
      } else if (entries.length > 0) {
        entries[entries.length - 1].outTime = t
      }
    }
  }

  return entries
}

