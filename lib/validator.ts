export function validate(entries: any[]) {
  const map = new Map()

  return entries.map((e) => {
    let remarks = []

    if (!e.outTime) remarks.push("❌ Missing OUT Time")

    if (!e.inTime) remarks.push("Continue")

    // Track duplicates
    const key = `${e.name}-${e.date}`
    if (map.has(key)) {
      remarks.push("Multiple shifts")
    } else {
      map.set(key, true)
    }

    // Long shift check (simple logic)
    if (e.inTime && e.outTime) {
      const inH = parseInt(e.inTime.split(":")[0])
      const outH = parseInt(e.outTime.split(":")[0])

      let duration = outH - inH
      if (duration < 0) duration += 24

      if (duration > 12) {
        remarks.push("Long shift")
      }
    }

      // Shift expectation check
    if (e.shift === "MORNING" && e.inTime && e.inTime > "07:00") {
      remarks.push("Late IN")
    }

    return {
      ...e,
      remarks: remarks.length ? remarks.join(", ") : "OK",
    }
  })
}

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