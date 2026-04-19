import { NextRequest } from "next/server"
import { generateExcel } from "@/lib/excel"

export async function POST(req: NextRequest) {
  const data = await req.json()

  const file = generateExcel(data)

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=shifts.xlsx",
    },
  })
}