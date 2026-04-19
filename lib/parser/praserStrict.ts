export interface Entry {
  name: string
  station: string
  date: string
  shift?: string
  inTime?: string
  outTime?: string
}

const IGNORE_WORDS = [
  "driver",
  "vehicle",
  "duty",
  "time",
  "pick",
  "day",
]

function isGarbage(name: string) {
  const lower = name.toLowerCase()
  return IGNORE_WORDS.some((w) => lower.includes(w))
}

function cleanName(raw: string) {
  return raw
    .replace(/OPR[-\d]*/gi, "")
    .replace(/[^a-zA-Z ]/g, "")
    .trim()
}

function normalizeTime(t: string) {
  return t.replace(".", ":").replace(/\s+/g, "")
}

export function parseStrict(text: string): Entry[] {
  const lines = text.split("\n")

  let station = ""
  let date = ""
  let shift = ""

  const entries: Entry[] = []
  const map: Record<string, Entry> = {}

  for (let raw of lines) {
    let line = raw.trim()

    if (!line) continue

    // 🏢 STATION
    if (line.toUpperCase().includes("STATION")) {
      const match = line.match(/STATION[:\-]?\s*(.*)/i)
      if (match) station = match[1].trim()
      continue
    }

    // 📅 DATE
    const dateMatch = line.match(/\d{2}[-/]\d{2}[-/]\d{4}/)
    if (dateMatch) {
      date = dateMatch[0]
    }

    // 🔁 SHIFT
    if (line.toUpperCase().includes("MORNING")) shift = "MORNING"
    if (line.toUpperCase().includes("AFTERNOON")) shift = "AFTERNOON"
    if (line.toUpperCase().includes("EVENING")) shift = "EVENING"
    if (line.toUpperCase().includes("NIGHT")) shift = "NIGHT"

    // =========================
    // 🟢 IN MATCH (STRICT)
    // =========================

    const inMatch = line.match(
      /([A-Za-z ]+)\s*-\s*IN[:\-]?\s*(\d{1,2}[:.]\d{2})/i
    )

    if (inMatch) {
      let name = cleanName(inMatch[1])
      if (!name || isGarbage(name)) continue

      const time = normalizeTime(inMatch[2])

      const key = `${name}-${date}-${station}`

      if (!map[key]) {
        map[key] = {
          name,
          station,
          date,
          shift,
          inTime: time,
        }
      } else {
        map[key].inTime = map[key].inTime || time
      }

      continue
    }

    // =========================
    // 🔴 OUT MATCH (STRICT)
    // =========================

    const outMatch = line.match(
      /([A-Za-z ]+)\s*[-:]?\s*(OUT|OUT TIME)[:\-]?\s*(\d{1,2}[:.]\d{2})/i
    )

    if (outMatch) {
      let name = cleanName(outMatch[1])
      if (!name || isGarbage(name)) continue

      const time = normalizeTime(outMatch[3])

      const key = `${name}-${date}-${station}`

      if (!map[key]) {
        map[key] = {
          name,
          station,
          date,
          shift,
          outTime: time,
        }
      } else {
        map[key].outTime = time
      }

      continue
    }

    // =========================
    // 🟡 SPECIAL CASE
    // "Name 14:37" → treat as OUT
    // =========================

    const looseOut = line.match(/([A-Za-z ]+)\s+(\d{1,2}[:.]\d{2})$/)

    if (looseOut && line.toLowerCase().includes("out")) {
      let name = cleanName(looseOut[1])
      if (!name || isGarbage(name)) continue

      const time = normalizeTime(looseOut[2])
      const key = `${name}-${date}-${station}`

      if (!map[key]) {
        map[key] = { name, station, date, shift, outTime: time }
      } else {
        map[key].outTime = time
      }
    }
  }

  return Object.values(map)
}