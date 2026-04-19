export function enrichAttendance(e) {
  if (!e.inTime || !e.outTime) {
    return {
      ...e,
      status: "Pending",
      workHours: 0,
      overtime: 0,
      late: false,
    }
  }

  const hours = calculateHours(e.inTime, e.outTime)

  // 🟡 Shift rules
  const expectedStart = "06:00"
  const expectedHours = 8

  const late = e.inTime > expectedStart

  let overtime = 0
  if (hours > expectedHours) {
    overtime = hours - expectedHours
  }

  return {
    ...e,
    status: "Completed",
    workHours: hours.toFixed(2),
    overtime: overtime.toFixed(2),
    late,
  }
}