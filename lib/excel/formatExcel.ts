import * as XLSX from "xlsx"

export function buildStationSheet(data: any[]) {
  const ws = XLSX.utils.aoa_to_sheet([])

  // 🧱 Header (merged like your sheet)
  XLSX.utils.sheet_add_aoa(ws, [
    ["OPERATORS DUTY REPORT"],
    ["STATION: MUSALLA BS"],
    [],
    ["Name", "Total Days", "Completed", "Missing", "Total Hours"],
  ])

  // Merge title rows
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
  ]

  // Add data
  XLSX.utils.sheet_add_json(ws, data, {
    origin: "A5",
    skipHeader: true,
  })

  // Column widths
  ws["!cols"] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
  ]

  return ws
}