import * as XLSX from "xlsx"
import { buildStationSheet } from "./formatExcel"

export function generateExcel(daily, station, timesheet) {
  const wb = XLSX.utils.book_new()

  const dailySheet = XLSX.utils.json_to_sheet(daily)
  const stationSheet = buildStationSheet(station)
  const timesheetSheet = XLSX.utils.json_to_sheet(timesheet)

  XLSX.utils.book_append_sheet(wb, dailySheet, "Daily")
  XLSX.utils.book_append_sheet(wb, stationSheet, "Station Report")
  XLSX.utils.book_append_sheet(wb, timesheetSheet, "Timesheet")

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
}