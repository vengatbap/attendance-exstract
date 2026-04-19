import * as XLSX from "xlsx"

export function generateExcel(daily, station, timesheet) {
  const wb = XLSX.utils.book_new()

  const dailySheet = XLSX.utils.json_to_sheet(daily)
  const stationSheet = XLSX.utils.json_to_sheet(station)
  const timeSheet = XLSX.utils.json_to_sheet(timesheet)

  XLSX.utils.book_append_sheet(wb, dailySheet, "Daily Logs")
  XLSX.utils.book_append_sheet(wb, stationSheet, "Station Report")
  XLSX.utils.book_append_sheet(wb, timeSheet, "Timesheet")

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
}