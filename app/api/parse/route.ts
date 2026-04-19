import { NextRequest, NextResponse } from "next/server"
import { parseWhatsapp } from "@/lib/parser"
import { validate } from "@/lib/validator"
// import { db } from "@/lib/db"
// import { shifts } from "@/lib/db/schema"

export async function POST(req: Request) {
  const { text } = await req.json()

  const parsed = parseWhatsapp(text)
  const validated = validate(parsed)

  return NextResponse.json(validated)

//   // Save to DB
//   for (const row of validated) {
//     await db.insert(shifts).values({
//       name: row.name,
//       station: row.station,
//       date: row.date,
//       inTime: row.inTime,
//       outTime: row.outTime,
//       remarks: row.remarks,
//     })
//   }

//   return Response.json(validated)   
}


// export async function POST(req: NextRequest) {
//   const { text } = await req.json()

//   const parsed = parseWhatsapp(text)
//   const validated = validate(parsed)

//   return NextResponse.json(validated)
// }
