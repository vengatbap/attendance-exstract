

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